import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { StufenAuswahl } from '../../components/StufenKarte';
import { activeItems } from '../../lib/auswertung';
import { diagnoseContent } from '../../lib/content';
import { useAppStore } from '../../store';
import type { Level } from '../../types/schemas';

// Workshop-Modus (S6): Vollbild, ein Item groß, Tastatursteuerung,
// kein sonstiges App-Chrome.

export function WorkshopScreen() {
  const { id } = useParams<{ id: string }>();
  const project = useAppStore((s) => (id ? s.projects[id] : undefined));
  const setItemLevel = useAppStore((s) => s.setItemLevel);
  const [index, setIndex] = useState(0);

  const flatItems = useMemo(
    () =>
      diagnoseContent.dimensions.flatMap((dim) => activeItems(dim).map((item) => ({ dim, item }))),
    [],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, flatItems.length - 1));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
      else if (['0', '1', '2', '3'].includes(e.key) && project) {
        const { item } = flatItems[index];
        setItemLevel(project.id, item.id, Number(e.key) as Level);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flatItems, index, project, setItemLevel]);

  if (!project) return <p className="p-8 text-sekundaer">{ui.app.laden}</p>;

  const { dim, item } = flatItems[index];
  const state = project.diagnosis.items[item.id] ?? { level: null, evidence: '' };

  return (
    <div className="flex min-h-screen flex-col bg-flaeche px-6 py-6 md:px-12">
      <div className="flex items-center justify-between text-sm text-sekundaer">
        <span>
          {dim.title} ·{' '}
          {ui.diagnose.itemVon
            .replace('{aktuell}', String(index + 1))
            .replace('{gesamt}', String(flatItems.length))}
        </span>
        <Link to={`/p/${project.id}/diagnose`} className="underline hover:text-text">
          {ui.workshop.beenden}
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-8">
        <h1 className="text-3xl font-semibold leading-snug">{item.text}</h1>
        <div className="mt-8">
          <StufenAuswahl
            item={item}
            value={state.level}
            onChange={(level) => setItemLevel(project.id, item.id, level)}
            large
          />
        </div>
      </div>

      <p className="text-center text-sm text-sekundaer">{ui.workshop.tastatur}</p>
    </div>
  );
}
