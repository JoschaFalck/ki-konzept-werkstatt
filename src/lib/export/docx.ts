import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { Project } from '../../types/schemas';
import { buildConceptDocument, type ConceptDeps } from './conceptModel';

// DOCX-Export (Spezifikation 5.5). UI ruft nur exportConcept(...) auf.
// Formatierung: Heading 1/2, 11-pt-Grundschrift, nur Grautöne.

const PT11 = 22; // docx misst in Halbpunkten

function para(text: string, opts: { bold?: boolean; align?: 'center' } = {}): Paragraph {
  return new Paragraph({
    alignment: opts.align === 'center' ? AlignmentType.CENTER : undefined,
    children: [new TextRun({ text, bold: opts.bold, size: PT11 })],
    spacing: { after: 200 },
  });
}

function tableOf(header: string[], rows: string[][]): Table {
  const makeCell = (text: string, bold: boolean) =>
    new TableCell({
      shading: bold ? { fill: 'EEEEEE' } : undefined,
      children: [new Paragraph({ children: [new TextRun({ text, bold, size: PT11 })] })],
    });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: header.map((h) => makeCell(h, true)), tableHeader: true }),
      ...rows.map((r) => new TableRow({ children: r.map((c) => makeCell(c, false)) })),
    ],
  });
}

/**
 * Erzeugt das Konzeptdokument als DOCX-Blob.
 * radarPng: gerasterte Spinnennetz-Grafik (siehe chartToPng.ts); null, wenn
 * keine Diagnose-Daten vorliegen oder die Rasterung fehlschlägt.
 */
export async function exportConcept(
  project: Project,
  deps: ConceptDeps,
  radarPng: Uint8Array | null,
): Promise<Blob> {
  const doc = buildConceptDocument(project, deps);
  const children: (Paragraph | Table)[] = [];

  // 1. Deckblatt
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 400 },
      children: [new TextRun({ text: doc.title, size: 48, bold: true })],
    }),
    para('Arbeitsstand', { align: 'center', bold: true }),
    para(doc.dateLabel, { align: 'center' }),
    para(doc.versionLine, { align: 'center' }),
  );

  // 2. Hinweisseite
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      children: [new TextRun({ text: 'Hinweise zu diesem Dokument', size: 28, bold: true })],
      spacing: { after: 240 },
    }),
  );
  for (const absatz of doc.hinweis) {
    children.push(para(absatz));
  }

  // 3. Kapitel
  doc.chapters.forEach((chapter, i) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        children: [new TextRun({ text: `${i + 1}. ${chapter.title}`, size: 28, bold: true })],
        spacing: { after: 240 },
      }),
    );
    for (const block of chapter.blocks) {
      if (block.type === 'paragraph') {
        children.push(para(block.text));
      } else if (block.type === 'heading2') {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: block.text, size: 24, bold: true })],
            spacing: { before: 240, after: 160 },
          }),
        );
      } else if (block.type === 'table') {
        children.push(tableOf(block.header, block.rows));
        children.push(para(''));
      } else if (block.type === 'radar' && radarPng) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                type: 'png',
                data: radarPng,
                transformation: { width: 420, height: 420 },
              }),
            ],
            spacing: { after: 240 },
          }),
        );
      }
    }
  });

  const file = new Document({
    creator: 'KI-Konzept-Werkstatt',
    title: doc.title,
    styles: {
      default: {
        document: { run: { size: PT11, font: 'Calibri' } },
      },
    },
    sections: [{ children }],
  });

  return Packer.toBlob(file);
}
