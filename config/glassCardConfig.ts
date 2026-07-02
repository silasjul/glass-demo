export type GlassCardConfig = {
  displacementScale: number;
  blurAmount: number;
  saturation: number;
  aberrationIntensity: number;
  cornerRadius: number;
  mode: 'standard' | 'polar' | 'prominent';
  overLight: boolean;
  /** Black tint over the frosted backdrop (0 = clear, 1 = opaque) — for a dark-themed glass. */
  darken: number;

  /** Rim ring thickness in px (0 hides the edge entirely). */
  edgeWidth: number;
  /** Peak white alpha of the directional sheen along the ring. */
  edgeIntensity: number;
  /** Direction of the sheen highlight, in degrees. */
  edgeAngle: number;
  /** Half-width of the bright band as a % of the gradient — smaller = a tighter glint. */
  edgeSpread: number;
  /** Crisp hairline + soft inset highlight alpha around the whole ring. */
  edgeBase: number;
};

export const GLASS_CARD_DEFAULTS: GlassCardConfig = {
  displacementScale: 58,
  blurAmount: 0.06,
  saturation: 150,
  aberrationIntensity: 1,
  cornerRadius: 20,
  mode: 'standard',
  overLight: false,
  darken: 0.2,

  edgeWidth: 1,
  edgeIntensity: 0.4,
  edgeAngle: 208,
  edgeSpread: 25,
  edgeBase: 0
};
