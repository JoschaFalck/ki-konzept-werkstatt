import { migrate, NewerSchemaError } from './migrations';
import type { Project } from '../types/schemas';

// Import-Validierung (Spezifikation Abschnitt 4): drei unterscheidbare
// Fehlerklassen plus Kollisionsbehandlung (Kopie, nie überschreiben).

export type ImportResult =
  | { ok: true; project: Project; wasCollision: boolean }
  | { ok: false; reason: 'invalid-json' | 'not-werkstatt' | 'newer-version' };

export function parseImportFile(fileText: string, existingIds: string[]): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(fileText);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }

  let project: Project;
  try {
    project = migrate(raw);
  } catch (e) {
    if (e instanceof NewerSchemaError) {
      return { ok: false, reason: 'newer-version' };
    }
    return { ok: false, reason: 'not-werkstatt' };
  }

  if (existingIds.includes(project.id)) {
    const copy: Project = {
      ...project,
      id: crypto.randomUUID(),
      title: `${project.title} (importiert)`.slice(0, 200),
      updatedAt: new Date().toISOString(),
    };
    return { ok: true, project: copy, wasCollision: true };
  }
  return { ok: true, project, wasCollision: false };
}
