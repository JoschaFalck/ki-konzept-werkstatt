import type { LinkEntry } from '../types/contentSchemas';
import { ui } from '../../content/ui-strings';
import { dateiUrl } from '../lib/assets';

const TYPE_LABEL: Record<LinkEntry['type'], string> = {
  artikel: ui.materialien.typArtikel,
  tool: ui.materialien.typTool,
  material: ui.materialien.typMaterial,
  download: ui.materialien.typDownload,
  grafik: ui.materialien.typGrafik,
};

/**
 * Karte der Materialbibliothek: externe Links (Artikel/Werkzeuge), Downloads
 * (lokale Dateien oder externe ZIPs) und Grafiken mit Vorschaubild.
 */
export function MaterialKarte({ eintrag }: { eintrag: LinkEntry }) {
  const href = eintrag.datei ? dateiUrl(eintrag.datei) : (eintrag.url ?? '#');
  const istLokalerDownload = eintrag.type === 'download' && !!eintrag.datei;
  const istGrafik = eintrag.type === 'grafik' && !!eintrag.datei;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      download={istLokalerDownload ? '' : undefined}
      className="hover-lift flex h-full flex-col overflow-hidden rounded-karte bg-karte shadow-schwebend"
    >
      {istGrafik && (
        <img
          src={href}
          alt=""
          loading="lazy"
          className="max-h-44 w-full bg-flaeche object-contain"
        />
      )}
      <span className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-sekundaer">
          {TYPE_LABEL[eintrag.type]}
        </span>
        <span className="mt-1 font-medium text-primaer">
          {eintrag.label} {eintrag.type === 'download' ? '↓' : '→'}
        </span>
        {eintrag.beschreibung && (
          <span className="mt-1 flex-1 text-sm text-sekundaer">{eintrag.beschreibung}</span>
        )}
        {eintrag.lizenz && (
          <span className="mt-2 text-xs text-sekundaer">
            {ui.materialien.lizenz}: {eintrag.lizenz}
          </span>
        )}
      </span>
    </a>
  );
}
