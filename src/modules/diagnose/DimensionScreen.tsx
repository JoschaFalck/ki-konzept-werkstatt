import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { StufenAuswahl } from '../../components/StufenKarte';
import { TextArea } from '../../components/TextField';
import { activeItems, isDimensionComplete } from '../../lib/auswertung';
import { diagnoseContent, dimensionById } from '../../lib/content';
import { useAppStore } from '../../store';

export function DimensionScreen() {
  const { id, dim } = useParams<{ id: string; dim: string }>();
  const project = useAppStore((s) => (id ? s.projects[id] : undefined));
  const setItemLevel = useAppStore((s) => s.setItemLevel);
  const setItemEvidence = useAppStore((s) => s.setItemEvidence);
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  // Beim Wechsel der Dimension wieder beim ersten Item beginnen.
  useEffect(() => setIndex(0), [dim]);

  const dimension = dim ? dimensionById(dim) : undefined;
  if (!project || !dimension) return <p className="text-sekundaer">{ui.app.laden}</p>;

  const items = activeItems(dimension);
  const item = items[Math.min(index, items.length - 1)];
  const state = project.diagnosis.items[item.id] ?? { level: null, evidence: '' };
  const done = items.filter((i) => project.diagnosis.items[i.id]?.level != null).length;
  const complete = isDimensionComplete(dimension, project);

  const dimIndex = diagnoseContent.dimensions.findIndex((d) => d.id === dimension.id);
  const nextDimension = diagnoseContent.dimensions[dimIndex + 1];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={`/p/${project.id}/diagnose`}
          className="text-sm text-sekundaer underline hover:text-text"
        >
          {ui.diagnose.zurUebersicht}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{dimension.title}</h1>
        <p className="text-sekundaer">{dimension.leitfrage}</p>
      </div>

      <div className="space-y-1">
        <ProgressBar value={done} max={items.length} label={`${done} von ${items.length}`} />
        <p className="text-xs text-sekundaer">
          {ui.diagnose.itemVon
            .replace('{aktuell}', String(index + 1))
            .replace('{gesamt}', String(items.length))}{' '}
          · {done} {ui.diagnose.itemsBearbeitet} {items.length} {ui.diagnose.itemsEinheit}
        </p>
      </div>

      <section aria-label={item.text} className="space-y-4">
        <h2 className="text-lg font-semibold">{item.text}</h2>
        <StufenAuswahl
          item={item}
          value={state.level}
          onChange={(level) => setItemLevel(project.id, item.id, level)}
        />
        <TextArea
          label={ui.diagnose.evidenzLabel}
          value={state.evidence}
          onChange={(v) => setItemEvidence(project.id, item.id, v)}
          maxLength={2000}
          placeholder={ui.diagnose.evidenzPlaceholder}
          rows={3}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          {ui.app.zurueck}
        </Button>
        {index < items.length - 1 ? (
          <Button onClick={() => setIndex(index + 1)}>{ui.app.weiter}</Button>
        ) : nextDimension ? (
          <Button onClick={() => navigate(`/p/${project.id}/diagnose/${nextDimension.id}`)}>
            {ui.diagnose.naechsteDimension}: {nextDimension.title}
          </Button>
        ) : (
          <Button onClick={() => navigate(`/p/${project.id}/diagnose`)}>
            {ui.diagnose.zurUebersicht}
          </Button>
        )}
      </div>
      {complete && <p className="text-sm text-erfolg">{ui.diagnose.dimensionAbgeschlossen}</p>}
    </div>
  );
}
