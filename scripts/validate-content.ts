// Prüft alle /content-Dateien gegen ihre zod-Verträge (Spezifikation
// Abschnitt 10). Aufruf: npm run validate:content — CI bricht bei Verstoß ab.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DiagnoseContentSchema,
  HebelContentSchema,
  KartenContentSchema,
  LinksContentSchema,
  MaterialienContentSchema,
  TextgeruesteContentSchema,
} from '../src/types/contentSchemas';
import { parseFrontmatter } from '../src/lib/markdown';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

let errors = 0;

function fail(file: string, message: string) {
  errors++;
  console.error(`FEHLER  ${file}\n        ${message}`);
}

function ok(file: string) {
  console.log(`ok      ${file}`);
}

function readJson(relPath: string): unknown {
  return JSON.parse(readFileSync(join(contentDir, relPath), 'utf-8'));
}

function validateJson(
  relPath: string,
  schema: {
    safeParse: (d: unknown) => {
      success: boolean;
      error?: { issues: { path: (string | number)[]; message: string }[] };
    };
  },
) {
  try {
    const result = schema.safeParse(readJson(relPath));
    if (!result.success) {
      const issues = result.error?.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      fail(relPath, issues ?? 'Schema-Verstoß');
      return null;
    }
    ok(relPath);
    return result;
  } catch (e) {
    fail(relPath, e instanceof Error ? e.message : String(e));
    return null;
  }
}

// JSON-Verträge
const diagnose = validateJson('diagnose-items.json', DiagnoseContentSchema);
validateJson('textgerueste.json', TextgeruesteContentSchema);
const hebel = validateJson('hebel-texte.json', HebelContentSchema);
const links = validateJson('links.json', LinksContentSchema);
validateJson('prozess/karten.json', KartenContentSchema);
validateJson('prozess/materialien.json', MaterialienContentSchema);

// Referenzrahmen: Frontmatter (title, leitfrage, version) für d1–d7
for (let i = 1; i <= 7; i++) {
  const file = `referenzrahmen/d${i}.md`;
  try {
    const { meta, body } = parseFrontmatter(readFileSync(join(contentDir, file), 'utf-8'));
    const missing = ['title', 'leitfrage', 'version'].filter((k) => !meta[k]);
    if (missing.length > 0) fail(file, `Frontmatter unvollständig: ${missing.join(', ')} fehlt`);
    else if (body.trim() === '') fail(file, 'Leerer Inhalt');
    else ok(file);
  } catch (e) {
    fail(file, e instanceof Error ? e.message : String(e));
  }
}

// Statische Seiten: Frontmatter mit title
for (const file of [
  'einfuehrung.md',
  'argumentationshilfe.md',
  'beispiel-grundschule.md',
  'beispiel-weiterfuehrend.md',
  'faq.md',
  'glossar.md',
  'moderation.md',
  'vorlagen.md',
  'hinweise.md',
  'herleitung.md',
]) {
  try {
    const { meta } = parseFrontmatter(readFileSync(join(contentDir, file), 'utf-8'));
    if (!meta.title) fail(file, 'Frontmatter: title fehlt');
    else ok(file);
  } catch (e) {
    fail(file, e instanceof Error ? e.message : String(e));
  }
}

// Querbezüge: linkIds aus hebel-texte.json müssen in links.json existieren
if (hebel && links) {
  const hebelData = HebelContentSchema.parse(readJson('hebel-texte.json'));
  const linkData = LinksContentSchema.parse(readJson('links.json'));
  const linkIds = new Set(linkData.links.map((l) => l.id));
  for (const regel of Object.values(hebelData.regeln)) {
    for (const linkId of regel.linkIds) {
      if (!linkIds.has(linkId)) {
        fail('hebel-texte.json', `linkId „${linkId}" (${regel.id}) existiert nicht in links.json`);
      }
    }
  }
}

// Querbezug: contentVersion von Diagnose und Gerüsten sollte übereinstimmen
if (diagnose) {
  const d = DiagnoseContentSchema.parse(readJson('diagnose-items.json'));
  const t = TextgeruesteContentSchema.parse(readJson('textgerueste.json'));
  if (d.contentVersion !== t.contentVersion) {
    fail(
      'textgerueste.json',
      `contentVersion (${t.contentVersion}) ≠ diagnose-items.json (${d.contentVersion})`,
    );
  }
}

if (errors > 0) {
  console.error(`\n${errors} Fehler in den Content-Dateien.`);
  process.exit(1);
}
console.log('\nAlle Content-Dateien sind gültig.');
