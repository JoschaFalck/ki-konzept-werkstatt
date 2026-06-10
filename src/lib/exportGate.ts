import type { BuilderSection } from '../types/contentSchemas';
import type { Project, SectionState } from '../types/schemas';

// Export-Gate (Spezifikation 5.3): Export nur, wenn jedes required-Feld eines
// gewählten Gerüsts entweder gefüllt oder als offen markiert ist.

export interface BlockingField {
  sectionId: string;
  sectionTitle: string;
  fieldId: string;
  fieldLabel: string;
}

export interface GateResult {
  ok: boolean;
  blocking: BlockingField[];
}

export function checkExportGate(
  sections: BuilderSection[],
  sectionStates: Record<string, SectionState>,
): GateResult {
  const blocking: BlockingField[] = [];
  for (const section of sections) {
    const state = sectionStates[section.id];
    if (!state || state.templateId === null) continue; // Kapitel ohne Gerüst gilt als offen
    const template = section.templates.find((t) => t.id === state.templateId);
    if (!template) continue;
    for (const segment of template.segments) {
      if (segment.type !== 'field' || !segment.required) continue;
      const fieldState = state.fields[segment.id];
      const filled = !!fieldState && fieldState.value.trim() !== '';
      const open = !!fieldState && fieldState.markedOpen;
      if (!filled && !open) {
        blocking.push({
          sectionId: section.id,
          sectionTitle: section.title,
          fieldId: segment.id,
          fieldLabel: segment.label,
        });
      }
    }
  }
  return { ok: blocking.length === 0, blocking };
}

export type SectionStatus = 'leer' | 'entwurf' | 'offen' | 'fertig';

/** Kapitelstatus für die Navigation (S8): Entwurf / offen markiert / fertig. */
export function sectionStatus(
  section: BuilderSection,
  state: SectionState | undefined,
): SectionStatus {
  if (!state || state.templateId === null) return 'leer';
  const gate = checkExportGate([section], { [section.id]: state });
  const hasInput = Object.values(state.fields).some((f) => f.value.trim() !== '' || f.markedOpen);
  if (!gate.ok) return hasInput ? 'entwurf' : 'leer';
  const hasOpen = Object.values(state.fields).some((f) => f.markedOpen);
  return hasOpen ? 'offen' : 'fertig';
}

/** Builder-Modulstatus für das Dashboard (5.1). */
export function builderModuleStatus(
  sections: BuilderSection[],
  project: Project,
): 'none' | 'in-progress' | 'done' {
  const states = project.concept.sections;
  const anyInput = Object.values(states).some(
    (s) => s.templateId !== null && Object.values(s.fields).some((f) => f.value.trim() !== ''),
  );
  if (!anyInput) return 'none';
  const allChosen = sections.every((sec) => states[sec.id]?.templateId != null);
  return allChosen && checkExportGate(sections, states).ok ? 'done' : 'in-progress';
}
