import { useEffect } from 'react';
import { useControls, folder } from 'leva';
import { GLASS_CARD_DEFAULTS, type GlassCardConfig } from '@/config/glassCardConfig';
import { useLevaStore } from '@/stores/levaStore';

export function useGlassCardControls() {
  const setConfig = useLevaStore((s) => s.setGlassCard);
  const d = GLASS_CARD_DEFAULTS;

  const cfg = useControls(
    'Glass Card',
    {
      Glass: folder(
        {
          displacementScale: { value: d.displacementScale, min: 0, max: 200, step: 1 },
          blurAmount: { value: d.blurAmount, min: 0, max: 1, step: 0.005 },
          saturation: { value: d.saturation, min: 100, max: 300, step: 1 },
          aberrationIntensity: { value: d.aberrationIntensity, min: 0, max: 10, step: 0.1 },
          cornerRadius: { value: d.cornerRadius, min: 0, max: 60, step: 1 },
          mode: { value: d.mode, options: ['standard', 'polar', 'prominent'] },
          overLight: d.overLight,
          darken: { value: d.darken, min: 0, max: 1, step: 0.01 },
        },
        { collapsed: false },
      ),
      Edge: folder(
        {
          edgeWidth: { value: d.edgeWidth, min: 0, max: 6, step: 0.1 },
          edgeIntensity: { value: d.edgeIntensity, min: 0, max: 1, step: 0.01 },
          edgeAngle: { value: d.edgeAngle, min: 0, max: 360, step: 1 },
          edgeSpread: { value: d.edgeSpread, min: 0, max: 25, step: 0.5 },
          edgeBase: { value: d.edgeBase, min: 0, max: 0.5, step: 0.01 },
        },
        { collapsed: false },
      ),
    },
    { collapsed: true },
  );

  useEffect(() => {
    setConfig(cfg as GlassCardConfig);
  }, [setConfig, cfg]);
}
