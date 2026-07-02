'use client';

import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from 'react';
type Mode = 'standard' | 'polar' | 'prominent';
type Vec2 = { x: number; y: number };

function smoothStep(a: number, b: number, t: number) {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function roundedRectSDF(x: number, y: number, w: number, h: number, r: number) {
  const qx = Math.abs(x) - w + r;
  const qy = Math.abs(y) - h + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}
// Smooth lens: zero displacement in the interior, ramping gradually toward the rim over a wide
// band so there's no hard caustic line (a precomputed map's flat/refraction boundary shows up
// as an inset "inner frame" rectangle at non-matching sizes).
function lensFragment(uv: Vec2): Vec2 {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  const d = roundedRectSDF(ix, iy, 0.35, 0.35, 0.5);
  const scale = 1 - smoothStep(-0.32, 0, d) * 0.2;
  return { x: ix * scale + 0.5, y: iy * scale + 0.5 };
}
// Generated per-size so the refraction matches the card's actual shape.
function generateDisplacementMap(width: number, height: number) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  let maxScale = 0;
  const raw: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pos = lensFragment({ x: x / w, y: y / h });
      maxScale = Math.max(maxScale, Math.abs(pos.x * w - x), Math.abs(pos.y * h - y));
      raw.push(pos.x * w - x, pos.y * h - y);
    }
  }
  maxScale = maxScale > 0 ? Math.max(maxScale, 1) : 1;

  const img = ctx.createImageData(w, h);
  const data = img.data;
  let i = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = raw[i++];
      const dy = raw[i++];
      const edge = Math.min(1, Math.min(x, y, w - x - 1, h - y - 1) / 2);
      const p = (y * w + x) * 4;
      data[p] = Math.max(0, Math.min(255, ((dx * edge) / maxScale + 0.5) * 255));
      data[p + 1] = Math.max(0, Math.min(255, ((dy * edge) / maxScale + 0.5) * 255));
      data[p + 2] = data[p + 1]; // dy lives in B so yChannelSelector="B" works
      data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function GlassFilter({
  id,
  displacementScale,
  aberrationIntensity,
  width,
  height,
  mapUrl,
}: {
  id: string;
  displacementScale: number;
  aberrationIntensity: number;
  width: number;
  height: number;
  mapUrl: string;
}) {
  return (
    <svg aria-hidden style={{ position: 'absolute', width, height }}>
      <defs>
        <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feImage
            x="0"
            y="0"
            width="100%"
            height="100%"
            result="DISPLACEMENT_MAP"
            href={mapUrl || undefined}
            preserveAspectRatio="xMidYMid slice"
          />
          <feColorMatrix
            in="DISPLACEMENT_MAP"
            type="matrix"
            values="0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0 0 0 1 0"
            result="EDGE_INTENSITY"
          />
          <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
            <feFuncA type="discrete" tableValues={`0 ${aberrationIntensity * 0.05} 1`} />
          </feComponentTransfer>
          <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />
          {/* Sample each channel at a slightly different scale to fake chromatic aberration at the rim. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="DISPLACEMENT_MAP"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="B"
            result="RED_DISPLACED"
          />
          <feColorMatrix
            in="RED_DISPLACED"
            type="matrix"
            values="1 0 0 0 0
                 0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
            result="RED_CHANNEL"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="DISPLACEMENT_MAP"
            scale={displacementScale * (1 + aberrationIntensity * 0.05)}
            xChannelSelector="R"
            yChannelSelector="B"
            result="GREEN_DISPLACED"
          />
          <feColorMatrix
            in="GREEN_DISPLACED"
            type="matrix"
            values="0 0 0 0 0
                 0 1 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
            result="GREEN_CHANNEL"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="DISPLACEMENT_MAP"
            scale={displacementScale * (1 + aberrationIntensity * 0.1)}
            xChannelSelector="R"
            yChannelSelector="B"
            result="BLUE_DISPLACED"
          />
          <feColorMatrix
            in="BLUE_DISPLACED"
            type="matrix"
            values="0 0 0 0 0
                 0 0 0 0 0
                 0 0 1 0 0
                 0 0 0 1 0"
            result="BLUE_CHANNEL"
          />
          <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
          <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />
          <feGaussianBlur
            in="RGB_COMBINED"
            stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)}
            result="ABERRATED_BLURRED"
          />
          <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />
          <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />
          <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export interface LiquidGlassProps {
  children: ReactNode;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number; // accepted for API parity; intentionally unused (no mouse warp)
  cornerRadius?: number;
  className?: string;
  padding?: string;
  style?: CSSProperties;
  overLight?: boolean;
  mode?: Mode;
  onClick?: () => void;
  /** Black tint over the frosted backdrop (0 = clear, 1 = opaque) — for a dark-themed glass. */
  darken?: number;
  // Edge rim, the way liquid-glass-react draws it: a thin masked ring with inset highlights
  // plus a directional sheen gradient (minus the blend modes that break the backdrop).
  edgeWidth?: number;
  edgeIntensity?: number;
  edgeAngle?: number;
  edgeSpread?: number;
  edgeBase?: number;
}

export default function LiquidGlass({
  children,
  displacementScale = 70,
  blurAmount = 0.0625,
  saturation = 140,
  aberrationIntensity = 2,
  cornerRadius = 999,
  className = '',
  padding = '24px 32px',
  style = {},
  overLight = false,
  onClick,
  darken = 0,
  edgeWidth = 1.5,
  edgeIntensity = 0.5,
  edgeAngle = 135,
  edgeSpread = 17,
  edgeBase = 0.3,
}: LiquidGlassProps) {
  // useId() can contain ':' which is invalid in a url(#…) reference.
  const filterId = `lg-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const glassRef = useRef<HTMLDivElement>(null);
  const [glassSize, setGlassSize] = useState({ width: 270, height: 69 });
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    const el = glassRef.current;
    if (!el) return;
    let pw = 0;
    let ph = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setGlassSize({ width: r.width, height: r.height });
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (w !== pw || h !== ph) {
        pw = w;
        ph = h;
        setMapUrl(generateDisplacementMap(w, h)); // regenerate only on actual resize (per-pixel loop)
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const radius = `${cornerRadius}px`;
  const blur = (overLight ? 12 : 4) + blurAmount * 32;
  const backdropFilter = `blur(${blur}px) saturate(${saturation}%)`;

  return (
    <div className={className} style={style} onClick={onClick}>
      <div
        ref={glassRef}
        className={onClick ? 'cursor-pointer' : undefined}
        style={{ position: 'relative', display: 'inline-flex' }}
      >
        <GlassFilter
          id={filterId}
          mapUrl={mapUrl}
          displacementScale={overLight ? displacementScale * 0.5 : displacementScale}
          aberrationIntensity={aberrationIntensity}
          width={glassSize.width}
          height={glassSize.height}
        />

        <div
          className="glass"
          style={{
            borderRadius: radius,
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            padding,
            overflow: 'hidden',
            transition: 'all 0.2s ease-in-out',
            boxShadow: overLight ? '0px 16px 70px rgba(0,0,0,0.75)' : '0px 12px 40px rgba(0,0,0,0.25)',
          }}
        >
          {/* The refraction: backdrop-filter blurs what's behind, the SVG filter then displaces it.
              No mix-blend-mode anywhere in this subtree — a blend layer would isolate the backdrop
              group and the backdrop-filter would stop seeing the scene (renders transparent). */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              filter: `url(#${filterId})`,
              backdropFilter,
              WebkitBackdropFilter: backdropFilter,
            }}
          />
          {darken > 0 && (
            <span
              aria-hidden
              style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${darken})`, pointerEvents: 'none' }}
            />
          )}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              font: '500 20px/1 system-ui',
              color: '#fff',
              textShadow: overLight ? 'none' : '0px 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            {children}
          </div>
        </div>

        {/* Edge rim (liquid-glass-react technique): a thin masked ring carrying inset highlights
            and a directional sheen. No mix-blend-mode — that would isolate the backdrop group. */}
        {edgeWidth > 0 && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: radius,
              pointerEvents: 'none',
              padding: `${edgeWidth}px`,
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              boxShadow: `inset 0 0 0 0.5px rgba(255,255,255,${edgeBase}), inset 0 1px 3px rgba(255,255,255,${(edgeBase * 0.6).toFixed(3)})`,
              background: `linear-gradient(${edgeAngle}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${(edgeIntensity * 0.55).toFixed(3)}) ${50 - edgeSpread}%, rgba(255,255,255,${edgeIntensity.toFixed(3)}) ${50 + edgeSpread}%, rgba(255,255,255,0) 100%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
