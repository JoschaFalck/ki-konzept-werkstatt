import { describe, expect, it } from 'vitest';
import { exportConcept, exportSection } from './docx';
import { exportConceptMarkdown, exportSectionMarkdown } from './markdown';
import { OPEN_MARKER } from './conceptModel';
import { CONTENT_VERSION, diagnoseContent, hebelContent, textgeruesteContent } from '../content';
import { activeItems } from '../auswertung';
import { SCHEMA_VERSION, type Project } from '../../types/schemas';

// Smoke-Test (Pflichttest 6): Export eines Beispielprojekts liefert
// Blob > 10 KB ohne Exception.

const deps = {
  diagnose: diagnoseContent,
  gerueste: textgeruesteContent,
  hebel: hebelContent,
  contentVersion: CONTENT_VERSION,
};

function sampleProject(): Project {
  const now = new Date().toISOString();
  const items: Project['diagnosis']['items'] = {};
  for (const dim of diagnoseContent.dimensions) {
    for (const item of activeItems(dim)) {
      items[item.id] = {
        level: 2,
        evidence: 'Beleg: Konferenzbeschluss vom Frühjahr, Protokoll liegt vor.',
      };
    }
  }

  const sections: Project['concept']['sections'] = {};
  for (const section of textgeruesteContent.sections) {
    const template = section.templates[0];
    const fields: Record<string, { value: string; markedOpen: boolean }> = {};
    for (const segment of template.segments) {
      if (segment.type === 'field') {
        fields[segment.id] = {
          value:
            segment.id === 'f2'
              ? ''
              : 'Beispielhafte schulspezifische Festlegung mit Umlauten (Ä, Ö, Ü, ß), die im Kollegium abgestimmt wurde und im Konzeptdokument als Fließtext erscheint.',
          markedOpen: segment.id === 'f2',
        };
      }
    }
    sections[section.id] = { templateId: template.id, fields };
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    id: '44444444-4444-4444-8444-444444444444',
    title: 'KI-Konzept Müller-Schule',
    createdAt: now,
    updatedAt: now,
    diagnosis: { items, completedAt: now },
    concept: { sections },
    measures: [
      {
        id: 'm1',
        title: 'Steuergruppe mandatieren',
        dimensionId: 'd6',
        description: 'Auftrag der Schulleitung, Bericht je Halbjahr.',
        role: 'Schulleitung',
        horizon: 'short',
        impact: 2,
        effort: 1,
        deimplementation: 'Die bisherige AG Digitales geht in der Steuergruppe auf.',
        deimplementationWaived: false,
        linkedItemIds: [],
      },
      {
        id: 'm2',
        title: 'Leistungsnachweise sichten',
        dimensionId: 'd3',
        description: 'Systematische Sichtung je Fachschaft.',
        role: 'Fachschaftsleitungen',
        horizon: 'mid',
        impact: 2,
        effort: 2,
        deimplementation: '',
        deimplementationWaived: true,
        linkedItemIds: [],
      },
    ],
  };
}

describe('exportConcept (DOCX)', () => {
  it('liefert ohne Exception einen Blob > 10 KB', async () => {
    const blob = await exportConcept(sampleProject(), deps, null);
    expect(blob.size).toBeGreaterThan(10 * 1024);
  });
});

describe('exportConceptMarkdown', () => {
  it('spiegelt die Gliederung und markiert offene Felder sichtbar', () => {
    const md = exportConceptMarkdown(sampleProject(), deps);
    expect(md).toContain('# KI-Konzept Müller-Schule');
    expect(md).toContain('## Hinweise zu diesem Dokument');
    expect(md).toContain('Ausgangslage');
    expect(md).toContain('Maßnahmenplan');
    expect(md).toContain(OPEN_MARKER);
    expect(md).toContain('keine – zusätzliche Belastung bewusst in Kauf genommen');
  });
});

describe('kapitelweiser Export', () => {
  it('exportSectionMarkdown enthält nur das gewählte Kapitel', () => {
    const md = exportSectionMarkdown(sampleProject(), deps, 'sec-pruefen');
    expect(md).toContain('Prüfen & Bewerten');
    expect(md).not.toContain('Maßnahmenplan');
    expect(md).not.toContain('Ausgangslage');
  });

  it('exportSection liefert ohne Exception einen Blob', async () => {
    const blob = await exportSection(sampleProject(), deps, 'sec-pruefen');
    expect(blob.size).toBeGreaterThan(1024);
  });
});
