import { useControls, folder } from 'leva';
import { BACKGROUND_DEFAULTS, type BackgroundConfig } from '@/config/backgroundConfig';

export function useBackgroundControls(): BackgroundConfig {
  const d = BACKGROUND_DEFAULTS;

  return useControls(
    'Background',
    {
      Palette: folder(
        {
          colorBase: d.colorBase,
          colorFlow1: d.colorFlow1,
          colorFlow2: d.colorFlow2,
          colorFlow3: d.colorFlow3,
          colorGlow: d.colorGlow,
        },
        { collapsed: false },
      ),
      Motion: folder(
        {
          speed: { value: d.speed, min: 0, max: 2, step: 0.01 },
          scale: { value: d.scale, min: 0.3, max: 4, step: 0.01 },
          warp: { value: d.warp, min: 0, max: 6, step: 0.01 },
          pointerPull: { value: d.pointerPull, min: 0, max: 1, step: 0.01 },
        },
        { collapsed: false },
      ),
      Light: folder(
        {
          glow: { value: d.glow, min: 0, max: 2, step: 0.01 },
          exposure: { value: d.exposure, min: 0.3, max: 2, step: 0.01 },
          grain: { value: d.grain, min: 0, max: 0.2, step: 0.001 },
          vignette: { value: d.vignette, min: 0, max: 1, step: 0.01 },
        },
        { collapsed: false },
      ),
    },
    { collapsed: true },
  ) as BackgroundConfig;
}
