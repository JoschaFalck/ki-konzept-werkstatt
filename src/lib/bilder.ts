/**
 * Bild-Slots (Spezifikation Abschnitt 6, Aurora): Illustrationen liegen unter
 * /src/assets/bilder/. Fehlt eine Datei, liefert bild() null und die
 * Komponente rendert ihren gestalteten Fallback — nie ein Broken-Image.
 *
 * Erwartete Dateinamen: hero, modul-diagnose, modul-referenz, modul-builder,
 * modul-massnahmen, modul-prozess, team-hinweise, leer-start (.png/.jpg/.webp)
 */
const dateien = import.meta.glob('../assets/bilder/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function bild(name: string): string | null {
  for (const [pfad, url] of Object.entries(dateien)) {
    const dateiname = pfad.split('/').pop() ?? '';
    if (dateiname.replace(/\.(png|jpe?g|webp)$/i, '') === name) return url;
  }
  return null;
}
