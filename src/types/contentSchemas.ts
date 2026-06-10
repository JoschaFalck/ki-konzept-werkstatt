import { z } from 'zod';

// Verträge für alle /content-Dateien (Spezifikation Abschnitt 10).
// Geprüft beim Build durch `npm run validate:content`.

export const DiagnosisLevelSchema = z.object({
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  description: z.string().min(1),
});

export const DiagnosisItemSchema = z.object({
  id: z.string().regex(/^d[1-7]-i\d+$/),
  text: z.string().min(1),
  deprecated: z.boolean(),
  levels: z.array(DiagnosisLevelSchema).length(4),
});

export const DimensionSchema = z.object({
  id: z.string().regex(/^d[1-7]$/),
  title: z.string().min(1),
  leitfrage: z.string().min(1),
  items: z.array(DiagnosisItemSchema).min(1),
});

export const DiagnoseContentSchema = z.object({
  $comment: z.string().optional(),
  contentVersion: z.string(),
  dimensions: z.array(DimensionSchema).length(7),
});

export const TemplateSegmentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), value: z.string().min(1) }),
  z.object({
    type: z.literal('field'),
    id: z.string().min(1),
    label: z.string().min(1),
    placeholder: z.string().default(''),
    required: z.boolean(),
    multiline: z.boolean(),
  }),
  z.object({ type: z.literal('hint'), value: z.string().min(1) }),
]);

export const TemplateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  segments: z.array(TemplateSegmentSchema).min(1),
});

export const BuilderSectionSchema = z.object({
  id: z.string().regex(/^sec-[a-z-]+$/),
  title: z.string().min(1),
  leitfragen: z.array(z.string().min(1)).min(1),
  templates: z.array(TemplateSchema).min(1),
});

export const TextgeruesteContentSchema = z.object({
  $comment: z.string().optional(),
  contentVersion: z.string(),
  sections: z.array(BuilderSectionSchema).min(1),
});

export const HebelTextSchema = z.object({
  id: z.string().min(1),
  titel: z.string().min(1),
  text: z.string().min(1),
  linkIds: z.array(z.string()).default([]),
});

export const HebelContentSchema = z.object({
  $comment: z.string().optional(),
  regeln: z.object({
    fundament: HebelTextSchema,
    pruefung: HebelTextSchema,
    governance: HebelTextSchema,
    spreizung: HebelTextSchema,
    default: HebelTextSchema,
  }),
  irritation: z.object({
    titel: z.string().min(1),
    text: z.string().min(1),
  }),
});

export const LinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['artikel', 'tool', 'material']),
  contexts: z.array(z.string()).default([]),
});

export const LinksContentSchema = z.object({
  $comment: z.string().optional(),
  links: z.array(LinkSchema),
});

export const DiskussionsKarteSchema = z.object({
  id: z.string().min(1),
  these: z.string().min(1),
  hinweis: z.string().optional(),
});

export const KartenContentSchema = z.object({
  $comment: z.string().optional(),
  karten: z.array(DiskussionsKarteSchema).min(1),
});

export const ProzessMaterialSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  body: z.string().min(1), // Markdown
});

export const MaterialienContentSchema = z.object({
  $comment: z.string().optional(),
  materialien: z.array(ProzessMaterialSchema).length(3),
});

export type DiagnoseContent = z.infer<typeof DiagnoseContentSchema>;
export type Dimension = z.infer<typeof DimensionSchema>;
export type DiagnosisItem = z.infer<typeof DiagnosisItemSchema>;
export type TextgeruesteContent = z.infer<typeof TextgeruesteContentSchema>;
export type BuilderSection = z.infer<typeof BuilderSectionSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type TemplateSegment = z.infer<typeof TemplateSegmentSchema>;
export type HebelContent = z.infer<typeof HebelContentSchema>;
export type HebelText = z.infer<typeof HebelTextSchema>;
export type LinksContent = z.infer<typeof LinksContentSchema>;
export type LinkEntry = z.infer<typeof LinkSchema>;
export type KartenContent = z.infer<typeof KartenContentSchema>;
export type MaterialienContent = z.infer<typeof MaterialienContentSchema>;
export type ProzessMaterial = z.infer<typeof ProzessMaterialSchema>;
