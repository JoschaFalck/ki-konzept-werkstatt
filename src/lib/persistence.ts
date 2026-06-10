import { ProjectMetaSchema, ProjectSchema, type Project, type ProjectMeta } from '../types/schemas';
import { migrate } from './migrations';

// Persistenz-Schicht (Spezifikation Abschnitt 4). Präfix `kkw:` ist fix.

export const INDEX_KEY = 'kkw:index';
export const projectKey = (id: string) => `kkw:project:${id}`;

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' };

/**
 * Feature-Detection beim App-Start (Stolperfalle 12.3: Safari privat wirft
 * bereits beim Zugriff Exceptions).
 */
export function storageAvailable(): boolean {
  try {
    const probe = 'kkw:__probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function writeRaw(key: string, value: string): SaveResult {
  try {
    window.localStorage.setItem(key, value);
    return { ok: true };
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      return { ok: false, reason: 'quota' };
    }
    return { ok: false, reason: 'unavailable' };
  }
}

export function loadIndex(): ProjectMeta[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = ProjectMetaSchema.array().safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveIndex(index: ProjectMeta[]): SaveResult {
  return writeRaw(INDEX_KEY, JSON.stringify(index));
}

export function saveProject(project: Project): SaveResult {
  return writeRaw(projectKey(project.id), JSON.stringify(project));
}

export function loadProject(id: string): Project | null {
  try {
    const raw = window.localStorage.getItem(projectKey(id));
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function deleteProject(id: string): void {
  try {
    window.localStorage.removeItem(projectKey(id));
  } catch {
    // Löschen darf nie werfen; ohne Storage gibt es nichts zu löschen.
  }
}

/**
 * Slug für Download-Dateinamen: Kleinbuchstaben, Umlaute transliteriert,
 * Nicht-Alphanumerisches → `-` (Stolperfalle 12.5: keine rohen Umlaute).
 */
export function slugify(title: string): string {
  const transliterated = title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function exportFilename(title: string, date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `ki-konzept-werkstatt_${slugify(title)}_${yyyy}-${mm}-${dd}.json`;
}

export function serializeProject(project: Project): string {
  return JSON.stringify(ProjectSchema.parse(project), null, 2);
}
