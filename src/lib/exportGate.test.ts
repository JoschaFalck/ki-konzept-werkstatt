import { describe, expect, it } from 'vitest';
import { checkExportGate, sectionStatus } from './exportGate';
import type { BuilderSection } from '../types/contentSchemas';
import type { SectionState } from '../types/schemas';

const section: BuilderSection = {
  id: 'sec-test',
  title: 'Testkapitel',
  leitfragen: ['Frage?'],
  templates: [
    {
      id: 'tpl-a',
      label: 'Variante A',
      segments: [
        { type: 'text', value: 'Einleitung ' },
        {
          type: 'field',
          id: 'f1',
          label: 'Pflicht',
          placeholder: '',
          required: true,
          multiline: false,
        },
        {
          type: 'field',
          id: 'f2',
          label: 'Optional',
          placeholder: '',
          required: false,
          multiline: true,
        },
        {
          type: 'field',
          id: 'f3',
          label: 'Pflicht 2',
          placeholder: '',
          required: true,
          multiline: true,
        },
        { type: 'hint', value: 'Randnotiz' },
      ],
    },
  ],
};

function state(fields: SectionState['fields'], templateId: string | null = 'tpl-a'): SectionState {
  return { templateId, fields };
}

describe('checkExportGate (5.3): required/markedOpen-Kombinatorik', () => {
  it('blockiert leere Pflichtfelder und listet sie mit Label', () => {
    const result = checkExportGate([section], { 'sec-test': state({}) });
    expect(result.ok).toBe(false);
    expect(result.blocking.map((b) => b.fieldId)).toEqual(['f1', 'f3']);
    expect(result.blocking[0].fieldLabel).toBe('Pflicht');
  });

  it('akzeptiert gefüllte Pflichtfelder; optionale dürfen leer bleiben', () => {
    const result = checkExportGate([section], {
      'sec-test': state({
        f1: { value: 'Antwort', markedOpen: false },
        f3: { value: 'Antwort', markedOpen: false },
      }),
    });
    expect(result.ok).toBe(true);
  });

  it('akzeptiert markedOpen als Ersatz für eine Eingabe', () => {
    const result = checkExportGate([section], {
      'sec-test': state({
        f1: { value: '', markedOpen: true },
        f3: { value: 'Antwort', markedOpen: false },
      }),
    });
    expect(result.ok).toBe(true);
  });

  it('wertet Nur-Whitespace als leer', () => {
    const result = checkExportGate([section], {
      'sec-test': state({
        f1: { value: '   ', markedOpen: false },
        f3: { value: 'Antwort', markedOpen: false },
      }),
    });
    expect(result.ok).toBe(false);
    expect(result.blocking.map((b) => b.fieldId)).toEqual(['f1']);
  });

  it('überspringt Kapitel ohne gewähltes Gerüst', () => {
    const result = checkExportGate([section], { 'sec-test': state({}, null) });
    expect(result.ok).toBe(true);
  });
});

describe('sectionStatus', () => {
  it('leer ohne Gerüst, Entwurf bei Teileingabe, offen bei markedOpen, fertig bei Vollstand', () => {
    expect(sectionStatus(section, undefined)).toBe('leer');
    expect(sectionStatus(section, state({ f1: { value: 'x', markedOpen: false } }))).toBe(
      'entwurf',
    );
    expect(
      sectionStatus(
        section,
        state({ f1: { value: 'x', markedOpen: false }, f3: { value: '', markedOpen: true } }),
      ),
    ).toBe('offen');
    expect(
      sectionStatus(
        section,
        state({ f1: { value: 'x', markedOpen: false }, f3: { value: 'y', markedOpen: false } }),
      ),
    ).toBe('fertig');
  });
});
