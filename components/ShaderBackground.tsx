'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color, Vector2, type ShaderMaterial } from 'three';
import { useBackgroundControls } from '@/hooks/useBackgroundControls';
import type { BackgroundConfig } from '@/config/backgroundConfig';

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Oil-film ink flow: three nested fbm fields fold the domain into itself (IQ-style
// warping), and the resulting scalar fields pick interference colors the way a thin
// film does — broad lagoon bands, ultraviolet pulled through the folds, magenta
// ribbons where the field shears, champagne sheen on the crests.
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec3 uColorBase;
  uniform vec3 uColorFlow1;
  uniform vec3 uColorFlow2;
  uniform vec3 uColorFlow3;
  uniform vec3 uColorGlow;
  uniform float uScale;
  uniform float uWarp;
  uniform float uPointerPull;
  uniform float uGlow;
  uniform float uGrain;
  uniform float uVignette;
  uniform float uExposure;

  // --- simplex noise (Ashima / stegu, public domain) ---
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    // rotate each octave so the axes never line up
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += amp * snoise(p);
      p = rot * p * 2.02;
      amp *= 0.5;
    }
    return value * 0.5 + 0.5;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 frag = gl_FragCoord.xy / uResolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
    p *= uScale;
    p += uPointer * uPointerPull;

    float t = uTime;

    // three-layer domain warp: f(p + warp * f(p + warp * f(p)))
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + 0.10 * t),
      fbm(p + vec2(5.2, 1.3) - 0.08 * t)
    );
    vec2 r = vec2(
      fbm(p + uWarp * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(p + uWarp * q + vec2(8.3, 2.8) - 0.12 * t)
    );
    float f = fbm(p + uWarp * r);

    // shape the field so the darks stay inky and the crests bloom
    float shaped = f * f * f + 0.6 * f * f + 0.5 * f;
    shaped = clamp(shaped * 0.55, 0.0, 1.0);

    vec3 col = mix(uColorBase, uColorFlow1, smoothstep(0.12, 0.78, shaped));
    // the warp magnitude pulls the second color through the folds
    col = mix(col, uColorFlow2, clamp(length(q) * 0.85 - 0.15, 0.0, 1.0) * 0.75);
    // shear of the second field cuts the ribbon color
    col = mix(col, uColorFlow3, smoothstep(0.4, 0.95, r.x) * smoothstep(0.2, 0.75, shaped) * 0.85);

    // champagne sheen on the crests only
    float crest = pow(clamp(shaped * 1.55 - 0.5, 0.0, 1.0), 3.0);
    col += uColorGlow * crest * uGlow;

    // depth: sink the troughs back toward the base
    col = mix(uColorBase, col, smoothstep(0.0, 0.35, shaped) * 0.9 + 0.1);

    col *= uExposure;

    // vignette
    float vig = smoothstep(1.45, 0.35, length(frag - 0.5) * 2.0);
    col *= mix(1.0, vig, uVignette);

    // filmic grain (animated)
    float g = hash(gl_FragCoord.xy + fract(t) * 100.0) - 0.5;
    col += g * uGrain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function InkPlane({ config }: { config: BackgroundConfig }) {
  const materialRef = useRef<ShaderMaterial>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const pointerTarget = useRef(new Vector2(0, 0));
  const reducedMotion = useRef(false);
  const frozenTime = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uPointer: { value: new Vector2(0, 0) },
      uColorBase: { value: new Color(config.colorBase) },
      uColorFlow1: { value: new Color(config.colorFlow1) },
      uColorFlow2: { value: new Color(config.colorFlow2) },
      uColorFlow3: { value: new Color(config.colorFlow3) },
      uColorGlow: { value: new Color(config.colorGlow) },
      uScale: { value: config.scale },
      uWarp: { value: config.warp },
      uPointerPull: { value: config.pointerPull },
      uGlow: { value: config.glow },
      uGrain: { value: config.grain },
      uVignette: { value: config.vignette },
      uExposure: { value: config.exposure },
    }),
    // uniforms object must be stable across renders; values sync in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      reducedMotion.current = mq.matches;
    };
    apply();
    mq.addEventListener('change', apply);

    const onPointerMove = (e: PointerEvent) => {
      pointerTarget.current.set(
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    const cfg = configRef.current;
    const u = mat.uniforms;

    // reduced motion: hold the field at a fixed, fully-formed moment
    if (reducedMotion.current) {
      u.uTime.value = 25.0;
    } else {
      frozenTime.current += delta * cfg.speed;
      u.uTime.value = frozenTime.current;
    }

    state.gl.getDrawingBufferSize(u.uResolution.value as Vector2);
    (u.uPointer.value as Vector2).lerp(pointerTarget.current, 0.04);

    (u.uColorBase.value as Color).set(cfg.colorBase);
    (u.uColorFlow1.value as Color).set(cfg.colorFlow1);
    (u.uColorFlow2.value as Color).set(cfg.colorFlow2);
    (u.uColorFlow3.value as Color).set(cfg.colorFlow3);
    (u.uColorGlow.value as Color).set(cfg.colorGlow);
    u.uScale.value = cfg.scale;
    u.uWarp.value = cfg.warp;
    u.uPointerPull.value = cfg.pointerPull;
    u.uGlow.value = cfg.glow;
    u.uGrain.value = cfg.grain;
    u.uVignette.value = cfg.vignette;
    u.uExposure.value = cfg.exposure;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ShaderBackground() {
  const config = useBackgroundControls();

  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        // fullscreen quad ignores the camera; defaults are fine
      >
        <InkPlane config={config} />
      </Canvas>
    </div>
  );
}
