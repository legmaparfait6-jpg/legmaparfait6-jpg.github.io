/**
 * Retour haptique léger sur mobile (Android ; iOS ne l'expose pas aux sites).
 * Jamais si l'utilisateur demande moins d'animations.
 */
export function buzz(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // vibration refusée par le navigateur : sans effet
  }
}
