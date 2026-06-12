import { useState } from 'react';
import { ui } from '../../../content/ui-strings';
import { MaterialKarte } from '../../components/MaterialKarte';
import { linksContent } from '../../lib/content';
import type { LinkEntry } from '../../types/contentSchemas';

// S13 Materialbibliothek: alle Einträge aus links.json, filterbar nach Typ.

type Filter = 'alle' | LinkEntry['type'];

const FILTER: { id: Filter; label: string }[] = [
  { id: 'alle', label: ui.materialien.filterAlle },
  { id: 'artikel', label: ui.materialien.filterArtikel },
  { id: 'tool', label: ui.materialien.filterWerkzeuge },
  { id: 'download', label: ui.materialien.filterDownloads },
  { id: 'grafik', label: ui.materialien.filterGrafiken },
];

export function MaterialienScreen() {
  const [filter, setFilter] = useState<Filter>('alle');
  const eintraege = linksContent.links.filter((l) => filter === 'alle' || l.type === filter);

  return (
    <div className="space-y-6">
      <div className="anim-auf max-w-prose">
        <h1 className="text-2xl font-semibold">{ui.materialien.titel}</h1>
        <p className="mt-2 text-sekundaer">{ui.materialien.intro}</p>
      </div>

      <div
        role="tablist"
        className="anim-auf anim-auf-1 inline-flex flex-wrap gap-1 rounded-full bg-primaer/10 p-1 print-hidden"
      >
        {FILTER.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primaer text-white shadow-schwebend'
                : 'text-sekundaer hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="anim-auf anim-auf-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eintraege.map((eintrag) => (
          <MaterialKarte key={eintrag.id} eintrag={eintrag} />
        ))}
      </div>
    </div>
  );
}
