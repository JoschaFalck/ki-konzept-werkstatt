/**
 * URL-Auflösung für mitgelieferte Materialdateien unter /public.
 * Berücksichtigt die Vite-Base (GitHub Pages, Spezifikation Abschnitt 1).
 */
export function dateiUrl(pfad: string): string {
  if (/^https?:\/\//.test(pfad)) return pfad;
  return import.meta.env.BASE_URL + pfad.replace(/^\//, '');
}
