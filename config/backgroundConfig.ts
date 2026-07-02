export type BackgroundConfig = {
  /** Deep base the ink flows over. */
  colorBase: string;
  /** First flow color — fills the broad bands. */
  colorFlow1: string;
  /** Second flow color — pulled through by the warp field. */
  colorFlow2: string;
  /** Third flow color — the sharp ribbons. */
  colorFlow3: string;
  /** Additive sheen on the brightest crests. */
  colorGlow: string;

  /** Animation speed multiplier. */
  speed: number;
  /** Noise zoom — smaller = broader bands. */
  scale: number;
  /** Domain-warp intensity — how much the ink folds into itself. */
  warp: number;
  /** How strongly the pointer drags the flow field. */
  pointerPull: number;

  /** Strength of the additive crest sheen. */
  glow: number;
  /** Filmic grain amount. */
  grain: number;
  /** Darkened corners (0 = flat, 1 = heavy). */
  vignette: number;
  /** Overall exposure. */
  exposure: number;
};

export const BACKGROUND_DEFAULTS: BackgroundConfig = {
  // Oil-film iridescence: petrol depths, lagoon + ultraviolet + magenta interference bands,
  // champagne sheen where the film thins.
  colorBase: '#08131c',
  colorFlow1: '#15b8c8',
  colorFlow2: '#6a4dff',
  colorFlow3: '#ff4d8f',
  colorGlow: '#ffd9a3',

  speed: 0.05,
  scale: 1.45,
  warp: 1.21,
  pointerPull: 0.03,

  glow: 1.53,
  grain: 0,
  vignette: 0.5,
  exposure: 1.22,
};
