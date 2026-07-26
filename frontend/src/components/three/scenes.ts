/**
 * Public .splinecode scene URLs, one per persistent 3D environment.
 * Set these in frontend/.env once scenes are built/exported in Spline.
 * Left empty, SplineScene falls back to the existing CSS/SVG visuals.
 */
export const SCENE_URLS = {
  ironman: import.meta.env.VITE_SPLINE_IRONMAN_SCENE ?? '',
  spiderman: import.meta.env.VITE_SPLINE_SPIDERMAN_SCENE ?? '',
} as const;
