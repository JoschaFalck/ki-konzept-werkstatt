import { create } from 'zustand';
import { SCHEMA_VERSION, type Measure, type Project, type ProjectMeta } from './types/schemas';
import { loadIndex, loadProject, storageAvailable } from './lib/persistence';
import { diagnoseContent, CONTENT_VERSION } from './lib/content';
import { isDiagnosisComplete } from './lib/auswertung';

export type SaveState = 'idle' | 'saving' | 'saved';

export interface AppState {
  storageOk: boolean;
  quotaError: boolean;
  index: ProjectMeta[];
  projects: Record<string, Project>;
  saveState: SaveState;
  /** true, wenn es Änderungen seit dem letzten JSON-Export gibt (für beforeunload ohne Storage). */
  unsavedSinceExport: boolean;

  createProject: (title: string) => string;
  addImportedProject: (project: Project) => void;
  renameProject: (id: string, title: string) => void;
  removeProject: (id: string) => void;
  ensureLoaded: (id: string) => void;
  updateProject: (id: string, updater: (p: Project) => Project) => void;

  setItemLevel: (id: string, itemId: string, level: 0 | 1 | 2 | 3) => void;
  setItemEvidence: (id: string, itemId: string, evidence: string) => void;
  chooseTemplate: (id: string, sectionId: string, templateId: string) => void;
  setFieldValue: (id: string, sectionId: string, fieldId: string, value: string) => void;
  setFieldOpen: (id: string, sectionId: string, fieldId: string, open: boolean) => void;
  saveMeasure: (id: string, measure: Measure) => void;
  removeMeasure: (id: string, measureId: string) => void;

  markExported: () => void;
  setSaveState: (s: SaveState) => void;
  setQuotaError: (q: boolean) => void;
}

function newProject(title: string): Project {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    diagnosis: { items: {}, completedAt: null },
    concept: { sections: {} },
    measures: [],
  };
}

function toMeta(p: Project): ProjectMeta {
  return { id: p.id, title: p.title, updatedAt: p.updatedAt };
}

export const useAppStore = create<AppState>((set, get) => ({
  storageOk: typeof window !== 'undefined' ? storageAvailable() : false,
  quotaError: false,
  index: typeof window !== 'undefined' ? loadIndex() : [],
  projects: {},
  saveState: 'idle',
  unsavedSinceExport: false,

  createProject: (title) => {
    const project = newProject(title);
    set((s) => ({
      projects: { ...s.projects, [project.id]: project },
      index: [toMeta(project), ...s.index],
      unsavedSinceExport: true,
    }));
    return project.id;
  },

  addImportedProject: (project) => {
    set((s) => ({
      projects: { ...s.projects, [project.id]: project },
      index: [toMeta(project), ...s.index.filter((m) => m.id !== project.id)],
      unsavedSinceExport: true,
    }));
  },

  renameProject: (id, title) => {
    get().updateProject(id, (p) => ({ ...p, title }));
  },

  removeProject: (id) => {
    set((s) => {
      const projects = { ...s.projects };
      delete projects[id];
      return { projects, index: s.index.filter((m) => m.id !== id) };
    });
  },

  ensureLoaded: (id) => {
    if (get().projects[id]) return;
    const loaded = loadProject(id);
    if (loaded) {
      set((s) => ({ projects: { ...s.projects, [id]: loaded } }));
    }
  },

  updateProject: (id, updater) => {
    set((s) => {
      const current = s.projects[id];
      if (!current) return s;
      const updated = { ...updater(current), updatedAt: new Date().toISOString() };
      return {
        projects: { ...s.projects, [id]: updated },
        index: s.index.map((m) => (m.id === id ? toMeta(updated) : m)),
        unsavedSinceExport: true,
      };
    });
  },

  setItemLevel: (id, itemId, level) => {
    get().updateProject(id, (p) => {
      const prev = p.diagnosis.items[itemId] ?? { level: null, evidence: '' };
      const items = { ...p.diagnosis.items, [itemId]: { ...prev, level } };
      const candidate: Project = { ...p, diagnosis: { ...p.diagnosis, items } };
      // completedAt wird beim erstmaligen Vollstand gesetzt und bleibt danach
      // bestehen (5.1); die Auswertung zeigt einen Stand-Hinweis.
      const completedAt =
        p.diagnosis.completedAt ??
        (isDiagnosisComplete(diagnoseContent, candidate) ? new Date().toISOString() : null);
      return { ...candidate, diagnosis: { ...candidate.diagnosis, completedAt } };
    });
  },

  setItemEvidence: (id, itemId, evidence) => {
    get().updateProject(id, (p) => {
      const prev = p.diagnosis.items[itemId] ?? { level: null, evidence: '' };
      return {
        ...p,
        diagnosis: {
          ...p.diagnosis,
          items: { ...p.diagnosis.items, [itemId]: { ...prev, evidence } },
        },
      };
    });
  },

  chooseTemplate: (id, sectionId, templateId) => {
    get().updateProject(id, (p) => ({
      ...p,
      concept: {
        sections: {
          ...p.concept.sections,
          // Gerüstwechsel verwirft Feldwerte (5.3, bewusst einfach gehalten).
          [sectionId]: { templateId, fields: {} },
        },
      },
    }));
  },

  setFieldValue: (id, sectionId, fieldId, value) => {
    get().updateProject(id, (p) => {
      const section = p.concept.sections[sectionId] ?? { templateId: null, fields: {} };
      const prev = section.fields[fieldId] ?? { value: '', markedOpen: false };
      return {
        ...p,
        concept: {
          sections: {
            ...p.concept.sections,
            [sectionId]: {
              ...section,
              fields: { ...section.fields, [fieldId]: { ...prev, value } },
            },
          },
        },
      };
    });
  },

  setFieldOpen: (id, sectionId, fieldId, open) => {
    get().updateProject(id, (p) => {
      const section = p.concept.sections[sectionId] ?? { templateId: null, fields: {} };
      const prev = section.fields[fieldId] ?? { value: '', markedOpen: false };
      return {
        ...p,
        concept: {
          sections: {
            ...p.concept.sections,
            [sectionId]: {
              ...section,
              fields: { ...section.fields, [fieldId]: { ...prev, markedOpen: open } },
            },
          },
        },
      };
    });
  },

  saveMeasure: (id, measure) => {
    get().updateProject(id, (p) => {
      const exists = p.measures.some((m) => m.id === measure.id);
      return {
        ...p,
        measures: exists
          ? p.measures.map((m) => (m.id === measure.id ? measure : m))
          : [...p.measures, measure],
      };
    });
  },

  removeMeasure: (id, measureId) => {
    get().updateProject(id, (p) => ({
      ...p,
      measures: p.measures.filter((m) => m.id !== measureId),
    }));
  },

  markExported: () => set({ unsavedSinceExport: false }),
  setSaveState: (saveState) => set({ saveState }),
  setQuotaError: (quotaError) => set({ quotaError }),
}));
