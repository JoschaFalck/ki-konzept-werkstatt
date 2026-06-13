import type {
  DiagnoseContent,
  HebelContent,
  TextgeruesteContent,
} from '../../types/contentSchemas';
import type { Measure, Project } from '../../types/schemas';
import { computeAuswertung, type Auswertung } from '../auswertung';

// Gemeinsames Dokumentmodell für DOCX- und Markdown-Export (Spezifikation 5.5):
// beide Exporte spiegeln dieselbe Gliederung.

export const OPEN_MARKER = '❮ offen – wird im Kollegium geklärt ❯';

export type ConceptBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading2'; text: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'radar' };

export interface ConceptChapter {
  title: string;
  blocks: ConceptBlock[];
}

export interface ConceptDocument {
  title: string;
  dateLabel: string;
  versionLine: string;
  hinweis: string[];
  chapters: ConceptChapter[];
  auswertung: Auswertung;
}

export interface ConceptDeps {
  diagnose: DiagnoseContent;
  gerueste: TextgeruesteContent;
  hebel: HebelContent;
  contentVersion: string;
}

const HORIZON_LABEL: Record<Measure['horizon'], string> = {
  short: 'kurzfristig',
  mid: 'mittelfristig',
  long: 'langfristig',
};

function levelLabel(value: 1 | 2 | null): string {
  if (value === null) return '—';
  return value === 2 ? 'hoch' : 'gering';
}

function sectionBlocks(project: Project, deps: ConceptDeps, sectionId: string): ConceptBlock[] {
  const section = deps.gerueste.sections.find((s) => s.id === sectionId);
  const state = project.concept.sections[sectionId];
  if (!section) return [];
  if (!state || state.templateId === null) {
    return [{ type: 'paragraph', text: OPEN_MARKER }];
  }
  const template = section.templates.find((t) => t.id === state.templateId);
  if (!template) return [{ type: 'paragraph', text: OPEN_MARKER }];

  // text- und field-Segmente werden zu Fließtext; hint-Segmente erscheinen
  // nicht im Export (5.3).
  const parts: string[] = [];
  for (const segment of template.segments) {
    if (segment.type === 'text') {
      parts.push(segment.value);
    } else if (segment.type === 'field') {
      const fieldState = state.fields[segment.id];
      if (fieldState && fieldState.markedOpen) {
        parts.push(`${OPEN_MARKER} (${segment.label})`);
      } else if (fieldState && fieldState.value.trim() !== '') {
        parts.push(fieldState.value.trim());
      } else if (segment.required) {
        parts.push(`${OPEN_MARKER} (${segment.label})`);
      }
    }
  }
  const text = parts.join('').replace(/\s+\n/g, '\n');
  return text.trim() === '' ? [{ type: 'paragraph', text: OPEN_MARKER }] : splitParagraphs(text);
}

function splitParagraphs(text: string): ConceptBlock[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p !== '')
    .map((p) => ({ type: 'paragraph', text: p }) as ConceptBlock);
}

function ausgangslageChapter(deps: ConceptDeps, auswertung: Auswertung): ConceptChapter {
  const blocks: ConceptBlock[] = [];
  const anyComplete = deps.diagnose.dimensions.some((d) => auswertung.means[d.id] !== null);
  if (!anyComplete) {
    blocks.push({
      type: 'paragraph',
      text: `Die Selbstdiagnose wurde noch nicht durchgeführt. ${OPEN_MARKER}`,
    });
    return { title: 'Ausgangslage', blocks };
  }
  blocks.push({
    type: 'paragraph',
    text: 'Grundlage dieses Konzepts ist eine Selbstdiagnose entlang von sieben Dimensionen schulischer KI-Entwicklung (Stufen 0–3). Die folgende Übersicht zeigt die Mittelwerte je Dimension.',
  });
  blocks.push({ type: 'radar' });
  blocks.push({
    type: 'table',
    header: ['Dimension', 'Mittelwert (0–3)'],
    rows: deps.diagnose.dimensions.map((d) => [
      d.title,
      auswertung.means[d.id] === null
        ? 'unvollständig'
        : (auswertung.means[d.id] as number).toFixed(2).replace('.', ','),
    ]),
  });
  if (auswertung.hauptRegel) {
    const haupt = deps.hebel.regeln[auswertung.hauptRegel];
    blocks.push({ type: 'heading2', text: haupt.titel });
    blocks.push({ type: 'paragraph', text: haupt.text });
    for (const regelId of auswertung.zusatzRegeln) {
      const regel = deps.hebel.regeln[regelId];
      blocks.push({ type: 'heading2', text: regel.titel });
      blocks.push({ type: 'paragraph', text: regel.text });
    }
  }
  return { title: 'Ausgangslage', blocks };
}

function massnahmenChapter(project: Project, deps: ConceptDeps): ConceptChapter {
  const blocks: ConceptBlock[] = [];
  if (project.measures.length === 0) {
    blocks.push({
      type: 'paragraph',
      text: `Es wurden noch keine Maßnahmen geplant. ${OPEN_MARKER}`,
    });
  } else {
    blocks.push({
      type: 'table',
      header: [
        'Maßnahme',
        'Dimension',
        'Verantwortung',
        'Horizont',
        'Wirkung/Aufwand',
        'Entlastung',
      ],
      rows: project.measures.map((m) => [
        m.description.trim() === '' ? m.title : `${m.title} — ${m.description}`,
        deps.diagnose.dimensions.find((d) => d.id === m.dimensionId)?.title ?? m.dimensionId,
        m.role || '—',
        HORIZON_LABEL[m.horizon],
        `${levelLabel(m.impact)} / ${levelLabel(m.effort)}`,
        m.deimplementationWaived
          ? 'keine – zusätzliche Belastung bewusst in Kauf genommen'
          : m.deimplementation || '—',
      ]),
    });
  }
  return { title: 'Maßnahmenplan', blocks };
}

/**
 * Dokument für ein einzelnes Kapitel (kapitelweiser Export). Enthält nur das
 * gewählte Builder-Kapitel — keine Ausgangslage, keinen Maßnahmenplan.
 */
export function buildSectionDocument(
  project: Project,
  deps: ConceptDeps,
  sectionId: string,
): ConceptDocument {
  const auswertung = computeAuswertung(deps.diagnose, project);
  const section = deps.gerueste.sections.find((s) => s.id === sectionId);
  const title = section?.title ?? sectionId;
  const date = new Date();
  return {
    title: `${project.title} — ${title}`,
    dateLabel: date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }),
    versionLine: `Auszug aus dem KI-Konzept · erstellt mit der KI-Konzept-Werkstatt · Referenzrahmen v${deps.contentVersion}`,
    hinweis: [
      `Dies ist ein einzelnes Kapitel aus dem KI-Konzept Ihrer Schule (Arbeitsstand). Noch nicht geklärte Punkte sind im Text markiert: ${OPEN_MARKER}.`,
    ],
    chapters: [{ title, blocks: sectionBlocks(project, deps, sectionId) }],
    auswertung,
  };
}

export function buildConceptDocument(project: Project, deps: ConceptDeps): ConceptDocument {
  const auswertung = computeAuswertung(deps.diagnose, project);
  const chapters: ConceptChapter[] = [];

  for (const section of deps.gerueste.sections) {
    chapters.push({ title: section.title, blocks: sectionBlocks(project, deps, section.id) });
    // Kapitel „Ausgangslage" folgt direkt auf die Präambel (5.5).
    if (section.id === 'sec-praeambel') {
      chapters.push(ausgangslageChapter(deps, auswertung));
    }
  }
  chapters.push(massnahmenChapter(project, deps));

  const date = new Date();
  const dateLabel = date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    title: project.title,
    dateLabel,
    versionLine: `Erstellt mit der KI-Konzept-Werkstatt · Referenzrahmen v${deps.contentVersion}`,
    hinweis: [
      'Dieses Dokument ist ein Arbeitsstand, kein abgeschlossenes Konzept. Es dokumentiert den aktuellen Stand der schulischen Verständigung und wird fortgeschrieben.',
      `Noch nicht geklärte Punkte sind im Text sichtbar markiert: ${OPEN_MARKER}. Sie sind kein Mangel, sondern benennen ehrlich, was im Kollegium oder in den Gremien noch zu entscheiden ist.`,
      'Dieses Dokument enthält bewusst keine personenbezogenen Daten; Verantwortlichkeiten sind als Funktionsbezeichnungen angegeben.',
    ],
    chapters,
    auswertung,
  };
}
