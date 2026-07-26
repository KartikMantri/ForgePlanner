export function isLowPowerDevice(): boolean {
  const isTouch =
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  return Boolean(prefersReducedMotion || (isTouch && smallScreen));
}
