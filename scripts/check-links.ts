// Linkcheck für links.json (Abnahmekriterium M5): jeder Link erreichbar.
// Aufruf: npx tsx scripts/check-links.ts (benötigt Internetzugang).

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LinksContentSchema } from '../src/types/contentSchemas';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = LinksContentSchema.parse(
  JSON.parse(readFileSync(join(root, 'content', 'links.json'), 'utf-8')),
);

let failures = 0;
for (const link of data.links) {
  try {
    const response = await fetch(link.url, { method: 'GET', redirect: 'follow' });
    if (response.ok) {
      console.log(`ok      ${link.id} → ${link.url}`);
    } else {
      failures++;
      console.error(`FEHLER  ${link.id} → ${link.url} (HTTP ${response.status})`);
    }
  } catch (e) {
    failures++;
    console.error(`FEHLER  ${link.id} → ${link.url} (${e instanceof Error ? e.message : e})`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} Link(s) nicht erreichbar.`);
  process.exit(1);
}
console.log('\nAlle Links erreichbar.');
