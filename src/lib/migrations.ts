import { ProjectSchema, SCHEMA_VERSION, type Project } from '../types/schemas';

// Migrationskette (Spezifikation Abschnitt 3): Array von Funktionen v1→v2→…
// Jede neue Migration erhält einen eigenen Test und eine eingefrorene
// Beispiel-Datei der Altversion unter /lib/__fixtures__/.

type MigrationFn = (raw: Record<string, unknown>) => Record<string, unknown>;

/** Index 0 migriert von Version 1 auf 2, Index 1 von 2 auf 3 usw. */
export const MIGRATIONS: MigrationFn[] = [];

export class NewerSchemaError extends Error {
  constructor(public readonly fileVersion: number) {
    super(`Datei hat Schema-Version ${fileVersion}, App unterstützt bis ${SCHEMA_VERSION}.`);
    this.name = 'NewerSchemaError';
  }
}

export function migrate(raw: unknown): Project {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Kein Objekt.');
  }
  const data = { ...(raw as Record<string, unknown>) };
  const version = typeof data.schemaVersion === 'number' ? data.schemaVersion : NaN;
  if (!Number.isInteger(version) || version < 1) {
    throw new Error('Keine gültige Schema-Version.');
  }
  if (version > SCHEMA_VERSION) {
    throw new NewerSchemaError(version);
  }
  let migrated = data;
  for (let v = version; v < SCHEMA_VERSION; v++) {
    migrated = MIGRATIONS[v - 1](migrated);
    migrated.schemaVersion = v + 1;
  }
  return ProjectSchema.parse(migrated);
}
