import diagnoseRaw from '../../content/diagnose-items.json';
import textgeruesteRaw from '../../content/textgerueste.json';
import hebelRaw from '../../content/hebel-texte.json';
import linksRaw from '../../content/links.json';
import kartenRaw from '../../content/prozess/karten.json';
import materialienRaw from '../../content/prozess/materialien.json';
import d1Md from '../../content/referenzrahmen/d1.md?raw';
import d2Md from '../../content/referenzrahmen/d2.md?raw';
import d3Md from '../../content/referenzrahmen/d3.md?raw';
import d4Md from '../../content/referenzrahmen/d4.md?raw';
import d5Md from '../../content/referenzrahmen/d5.md?raw';
import d6Md from '../../content/referenzrahmen/d6.md?raw';
import d7Md from '../../content/referenzrahmen/d7.md?raw';
import einfuehrungMd from '../../content/einfuehrung.md?raw';
import argumentationshilfeMd from '../../content/argumentationshilfe.md?raw';
import hinweiseMd from '../../content/hinweise.md?raw';
import herleitungMd from '../../content/herleitung.md?raw';
import impressumMd from '../../content/impressum.md?raw';
import datenschutzMd from '../../content/datenschutz.md?raw';
import {
  DiagnoseContentSchema,
  HebelContentSchema,
  KartenContentSchema,
  LinksContentSchema,
  MaterialienContentSchema,
  TextgeruesteContentSchema,
  type LinkEntry,
} from '../types/contentSchemas';
import { parseFrontmatter } from './markdown';

// Zentrale, beim App-Start einmalig validierte Sicht auf alle Fachinhalte.
// Dieselben Schemas prüft `npm run validate:content` im Build.

export const diagnoseContent = DiagnoseContentSchema.parse(diagnoseRaw);
export const textgeruesteContent = TextgeruesteContentSchema.parse(textgeruesteRaw);
export const hebelContent = HebelContentSchema.parse(hebelRaw);
export const linksContent = LinksContentSchema.parse(linksRaw);
export const kartenContent = KartenContentSchema.parse(kartenRaw);
export const materialienContent = MaterialienContentSchema.parse(materialienRaw);

export const CONTENT_VERSION = diagnoseContent.contentVersion;

const referenzRaw: Record<string, string> = {
  d1: d1Md,
  d2: d2Md,
  d3: d3Md,
  d4: d4Md,
  d5: d5Md,
  d6: d6Md,
  d7: d7Md,
};

export const referenzrahmen = Object.fromEntries(
  Object.entries(referenzRaw).map(([id, raw]) => [id, parseFrontmatter(raw)]),
);

export const einfuehrungSeite = parseFrontmatter(einfuehrungMd);
export const argumentationshilfeSeite = parseFrontmatter(argumentationshilfeMd);
export const hinweiseSeite = parseFrontmatter(hinweiseMd);
export const herleitungSeite = parseFrontmatter(herleitungMd);
export const impressumSeite = parseFrontmatter(impressumMd);
export const datenschutzSeite = parseFrontmatter(datenschutzMd);

export function dimensionById(id: string) {
  return diagnoseContent.dimensions.find((d) => d.id === id);
}

export function linksForContext(context: string): LinkEntry[] {
  return linksContent.links.filter((l) => l.contexts.includes(context));
}

/**
 * Statische Lookup-Map vollständiger Tailwind-Klassennamen für die
 * Dimensionsfarben (Stolperfalle 12.6: niemals dynamisch zusammensetzen).
 */
export const DIM_CHIP_CLASSES: Record<string, string> = {
  d1: 'bg-dim-d1',
  d2: 'bg-dim-d2',
  d3: 'bg-dim-d3',
  d4: 'bg-dim-d4',
  d5: 'bg-dim-d5',
  d6: 'bg-dim-d6',
  d7: 'bg-dim-d7',
};

/** Hex-Werte der Dimensionsfarben für SVG (RadarChart) — Quelle: tailwind.config. */
export const DIM_HEX: Record<string, string> = {
  d1: '#0F6B6B',
  d2: '#3B5BA5',
  d3: '#7B4FA3',
  d4: '#A04668',
  d5: '#B7791F',
  d6: '#4E7A4E',
  d7: '#5C6B73',
};
