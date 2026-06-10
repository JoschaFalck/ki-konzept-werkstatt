import { useAppStore } from './store';
import { deleteProject, saveIndex, saveProject } from './lib/persistence';

// Einziges Persistenz-Modul (Stolperfalle 12.4): Subscription auf den Store
// mit Debounce 800 ms; zusätzlich sofortiges Sichern bei Routenwechsel über
// flushPersistence().

const DEBOUNCE_MS = 800;

let timer: ReturnType<typeof setTimeout> | null = null;
const pendingIds = new Set<string>();
let pendingIndex = false;
let savedIndicatorTimer: ReturnType<typeof setTimeout> | null = null;

function persistPending(): void {
  const state = useAppStore.getState();
  if (!state.storageOk) return;

  let quota = false;
  if (pendingIndex) {
    const result = saveIndex(state.index);
    if (!result.ok) quota = quota || result.reason === 'quota';
    pendingIndex = false;
  }
  for (const id of pendingIds) {
    const project = state.projects[id];
    if (project) {
      const result = saveProject(project);
      if (!result.ok) quota = quota || result.reason === 'quota';
    }
  }
  pendingIds.clear();

  state.setQuotaError(quota);
  state.setSaveState('saved');
  if (savedIndicatorTimer) clearTimeout(savedIndicatorTimer);
  savedIndicatorTimer = setTimeout(() => useAppStore.getState().setSaveState('idle'), 2000);
}

/** Sofort sichern (z. B. bei Routenwechsel). */
export function flushPersistence(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (pendingIds.size > 0 || pendingIndex) persistPending();
}

export function initPersistence(): void {
  let prevProjects = useAppStore.getState().projects;
  let prevIndex = useAppStore.getState().index;

  useAppStore.subscribe((state) => {
    let changed = false;

    if (state.index !== prevIndex) {
      pendingIndex = true;
      changed = true;
      // Gelöschte Projekte sofort aus dem Storage entfernen.
      const currentIds = new Set(state.index.map((m) => m.id));
      for (const meta of prevIndex) {
        if (!currentIds.has(meta.id)) deleteProject(meta.id);
      }
      prevIndex = state.index;
    }

    if (state.projects !== prevProjects) {
      for (const [id, project] of Object.entries(state.projects)) {
        if (prevProjects[id] !== project && state.index.some((m) => m.id === id)) {
          pendingIds.add(id);
          changed = true;
        }
      }
      prevProjects = state.projects;
    }

    if (changed && state.storageOk) {
      state.setSaveState('saving');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        persistPending();
      }, DEBOUNCE_MS);
    }
  });
}
