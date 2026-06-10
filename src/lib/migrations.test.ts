import { describe, expect, it } from 'vitest';
import { migrate, MIGRATIONS, NewerSchemaError } from './migrations';
import { SCHEMA_VERSION } from '../types/schemas';
import projectV1 from './__fixtures__/project-v1.json';

describe('migrate', () => {
  it('akzeptiert die eingefrorene v1-Fixture', () => {
    const project = migrate(projectV1);
    expect(project.schemaVersion).toBe(1);
    expect(project.title).toBe('Eingefrorenes Beispielprojekt v1');
    expect(project.measures).toHaveLength(1);
  });

  it('lehnt neuere Schema-Versionen mit eigenem Fehler ab', () => {
    expect(() => migrate({ ...projectV1, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(
      NewerSchemaError,
    );
  });

  it('lehnt Daten ohne gültige Schema-Version ab', () => {
    expect(() => migrate({ foo: 'bar' })).toThrow();
    expect(() => migrate(null)).toThrow();
    expect(() => migrate({ ...projectV1, schemaVersion: 'eins' })).toThrow();
  });

  it('hat für jede Version zwischen 1 und aktuell eine Migration', () => {
    // Schutz davor, SCHEMA_VERSION zu erhöhen, ohne eine Migration anzulegen.
    expect(MIGRATIONS).toHaveLength(SCHEMA_VERSION - 1);
  });
});
