import type { LinkEntry } from '../types/contentSchemas';
import { ui } from '../../content/ui-strings';

const TYPE_LABEL: Record<LinkEntry['type'], string> = {
  artikel: 'Artikel',
  tool: 'Werkzeug',
  material: 'Material',
};

export function LinkCard({ link }: { link: LinkEntry }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      className="hover-lift block rounded-karte bg-karte p-4 shadow-schwebend"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-sekundaer">
        {ui.referenz.vertiefung} · {TYPE_LABEL[link.type]}
      </p>
      <p className="mt-1 font-medium text-primaer">{link.label} →</p>
    </a>
  );
}
