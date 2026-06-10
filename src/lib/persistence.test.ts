import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  exportFilename,
  loadIndex,
  loadProject,
  saveIndex,
  saveProject,
  slugify,
  storageAvailable,
} from './persistence';
import { makeProject } from './__fixtures__/testHelpers';

class LocalStorageMock {
  private store = new Map<string, string>();
  failWith: Error | null = null;

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWith) throw this.failWith;
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

let storage: LocalStorageMock;

beforeEach(() => {
  storage = new LocalStorageMock();
  (globalThis as Record<string, unknown>).window = { localStorage: storage };
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

describe('save/load-Roundtrip', () => {
  it('liest ein gespeichertes Projekt identisch zurück', () => {
    const project = makeProject();
    expect(saveProject(project)).toEqual({ ok: true });
    expect(loadProject(project.id)).toEqual(project);
  });

  it('liest den Index zurück', () => {
    const meta = [{ id: 'a', title: 'Schule A', updatedAt: new Date().toISOString() }];
    expect(saveIndex(meta)).toEqual({ ok: true });
    expect(loadIndex()).toEqual(meta);
  });

  it('liefert null für unbekannte Projekte', () => {
    expect(loadProject('gibt-es-nicht')).toBeNull();
  });
});

describe('Quota-Fehlerpfad', () => {
  it('meldet quota bei QuotaExceededError', () => {
    storage.failWith = new DOMException('voll', 'QuotaExceededError');
    expect(saveProject(makeProject())).toEqual({ ok: false, reason: 'quota' });
  });

  it('meldet unavailable bei sonstigen Fehlern', () => {
    storage.failWith = new Error('SecurityError');
    expect(saveProject(makeProject())).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('storageAvailable erkennt blockierten Storage', () => {
    expect(storageAvailable()).toBe(true);
    storage.failWith = new DOMException('privat', 'SecurityError');
    expect(storageAvailable()).toBe(false);
  });
});

describe('Slug-Funktion (12.5: Umlaute)', () => {
  it('transliteriert Umlaute und ß', () => {
    expect(slugify('Müller-Schule Großstadt')).toBe('mueller-schule-grossstadt');
    expect(slugify('Käthe-Kollwitz-Gymnasium Öhringen')).toBe(
      'kaethe-kollwitz-gymnasium-oehringen',
    );
  });

  it('ersetzt Nicht-Alphanumerisches durch Bindestriche ohne Ränder', () => {
    expect(slugify('  KI-Konzept (Entwurf) 2026!  ')).toBe('ki-konzept-entwurf-2026');
  });

  it('baut den Export-Dateinamen mit Datum', () => {
    expect(exportFilename('Müller-Schule', new Date(2026, 5, 10))).toBe(
      'ki-konzept-werkstatt_mueller-schule_2026-06-10.json',
    );
  });
});
