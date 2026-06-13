import type { Project } from '../../types/schemas';
import {
  buildConceptDocument,
  buildSectionDocument,
  type ConceptDeps,
  type ConceptDocument,
} from './conceptModel';

// Markdown-Export: spiegelt die DOCX-Gliederung (Spezifikation 5.5).

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n+/g, ' ');
}

/** Rendert ein beliebiges Konzept-Dokument als Markdown. */
export function renderMarkdown(doc: ConceptDocument): string {
  const lines: string[] = [];

  lines.push(`# ${doc.title}`);
  lines.push('');
  lines.push(`**Arbeitsstand** · ${doc.dateLabel}`);
  lines.push('');
  lines.push(doc.versionLine);
  lines.push('');
  lines.push('## Hinweise zu diesem Dokument');
  lines.push('');
  for (const absatz of doc.hinweis) {
    lines.push(absatz);
    lines.push('');
  }

  doc.chapters.forEach((chapter, i) => {
    lines.push(`## ${i + 1}. ${chapter.title}`);
    lines.push('');
    for (const block of chapter.blocks) {
      if (block.type === 'paragraph') {
        lines.push(block.text);
        lines.push('');
      } else if (block.type === 'heading2') {
        lines.push(`### ${block.text}`);
        lines.push('');
      } else if (block.type === 'table') {
        lines.push(`| ${block.header.map(escapeCell).join(' | ')} |`);
        lines.push(`| ${block.header.map(() => '---').join(' | ')} |`);
        for (const row of block.rows) {
          lines.push(`| ${row.map(escapeCell).join(' | ')} |`);
        }
        lines.push('');
      } else if (block.type === 'radar') {
        lines.push('*(Spinnennetz-Grafik: siehe Auswertung in der KI-Konzept-Werkstatt)*');
        lines.push('');
      }
    }
  });

  return lines.join('\n');
}

export function exportConceptMarkdown(project: Project, deps: ConceptDeps): string {
  return renderMarkdown(buildConceptDocument(project, deps));
}

export function exportSectionMarkdown(
  project: Project,
  deps: ConceptDeps,
  sectionId: string,
): string {
  return renderMarkdown(buildSectionDocument(project, deps, sectionId));
}
