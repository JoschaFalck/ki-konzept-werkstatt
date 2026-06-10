import { describe, expect, it } from 'vitest';
import { parseImportFile } from './importValidation';
import { SCHEMA_VERSION } from '../types/schemas';
import projectV1 from './__fixtures__/project-v1.json';

const validText = JSON.stringify(projectV1);

describe('parseImportFile: drei Fehlerklassen (Abschnitt 4)', () => {
  it('(a) keine gültige JSON-Datei', () => {
    expect(parseImportFile('das ist kein json {', [])).toEqual({
      ok: false,
      reason: 'invalid-json',
    });
  });

  it('(b) keine Werkstatt-Datei', () => {
    expect(parseImportFile(JSON.stringify({ irgendwas: true }), [])).toEqual({
      ok: false,
      reason: 'not-werkstatt',
    });
  });

  it('(c) Datei aus neuerer App-Version', () => {
    const newer = JSON.stringify({ ...projectV1, schemaVersion: SCHEMA_VERSION + 1 });
    expect(parseImportFile(newer, [])).toEqual({ ok: false, reason: 'newer-version' });
  });
});

describe('parseImportFile: Erfolgs- und Kollisionsfall', () => {
  it('importiert eine gültige Datei unverändert', () => {
    const result = parseImportFile(validText, []);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.wasCollision).toBe(false);
      expect(result.project.id).toBe(projectV1.id);
      expect(result.project.title).toBe(projectV1.title);
    }
  });

  it('legt bei ID-Kollision eine Kopie an, statt zu überschreiben', () => {
    const result = parseImportFile(validText, [projectV1.id]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.wasCollision).toBe(true);
      expect(result.project.id).not.toBe(projectV1.id);
      expect(result.project.title).toBe(`${projectV1.title} (importiert)`);
    }
  });
});
