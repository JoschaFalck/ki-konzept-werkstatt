import { z } from 'zod';

// Maßgebliche Fassung des Datenmodells (Spezifikation Abschnitt 3).

export const SCHEMA_VERSION = 1;

export const LevelSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);

export const DiagnosisItemStateSchema = z.object({
  level: LevelSchema.nullable(), // null = noch nicht eingeschätzt
  evidence: z.string().max(2000).default(''),
});

export const BuilderFieldStateSchema = z.object({
  value: z.string().max(8000).default(''),
  markedOpen: z.boolean().default(false), // „offen – wird im Kollegium geklärt"
});

export const SectionStateSchema = z.object({
  templateId: z.string().nullable(), // gewähltes Gerüst, null = noch keins gewählt
  fields: z.record(z.string(), BuilderFieldStateSchema).default({}),
});

export const MeasureSchema = z.object({
  id: z.string(), // crypto.randomUUID()
  title: z.string().min(1).max(200),
  dimensionId: z.string(), // "d1".."d7"
  description: z.string().max(4000).default(''),
  role: z.string().max(200).default(''), // UI-Hinweis: Funktionsbezeichnung, keine Namen
  horizon: z.enum(['short', 'mid', 'long']),
  impact: z.union([z.literal(1), z.literal(2)]).nullable(), // 1 = gering, 2 = hoch
  effort: z.union([z.literal(1), z.literal(2)]).nullable(),
  deimplementation: z.string().max(2000).default(''),
  deimplementationWaived: z.boolean().default(false),
  linkedItemIds: z.array(z.string()).default([]), // optionale Verknüpfung zu Diagnose-Items
});

export const ProjectSchema = z.object({
  schemaVersion: z.number(),
  contentVersion: z.string(), // Stand des Referenzrahmens bei Erstellung
  id: z.string(),
  title: z.string().min(1).max(200),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  diagnosis: z.object({
    items: z.record(z.string(), DiagnosisItemStateSchema).default({}),
    completedAt: z.string().datetime().nullable().default(null),
  }),
  concept: z.object({
    sections: z.record(z.string(), SectionStateSchema).default({}),
  }),
  measures: z.array(MeasureSchema).default([]),
});

export type Level = z.infer<typeof LevelSchema>;
export type DiagnosisItemState = z.infer<typeof DiagnosisItemStateSchema>;
export type BuilderFieldState = z.infer<typeof BuilderFieldStateSchema>;
export type SectionState = z.infer<typeof SectionStateSchema>;
export type Measure = z.infer<typeof MeasureSchema>;
export type Project = z.infer<typeof ProjectSchema>;

/** Metadaten eines Projekts für die Startseite (kkw:index). */
export const ProjectMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
});
export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;
