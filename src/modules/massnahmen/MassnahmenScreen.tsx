import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Banner } from '../../components/Banner';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { PrintButton } from '../../components/PrintButton';
import { Select } from '../../components/Select';
import { Tabs } from '../../components/Tabs';
import { TextArea, TextField } from '../../components/TextField';
import { diagnoseContent, DIM_CHIP_CLASSES } from '../../lib/content';
import { useAppStore } from '../../store';
import type { Measure } from '../../types/schemas';

const HORIZON_OPTIONS = [
  { value: 'short', label: ui.massnahmen.horizontShort },
  { value: 'mid', label: ui.massnahmen.horizontMid },
  { value: 'long', label: ui.massnahmen.horizontLong },
];

const LEVEL_OPTIONS = [
  { value: '', label: ui.massnahmen.nichtEingeordnet },
  { value: '2', label: ui.massnahmen.wirkungHoch },
  { value: '1', label: ui.massnahmen.wirkungGering },
];

function emptyMeasure(): Measure {
  return {
    id: crypto.randomUUID(),
    title: '',
    dimensionId: diagnoseContent.dimensions[0].id,
    description: '',
    role: '',
    horizon: 'short',
    impact: null,
    effort: null,
    deimplementation: '',
    deimplementationWaived: false,
    linkedItemIds: [],
  };
}

function MeasureForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Measure;
  onSave: (m: Measure) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Measure>(initial);
  const [showErrors, setShowErrors] = useState(false);

  const entlastungOk = draft.deimplementationWaived || draft.deimplementation.trim() !== '';
  const titleOk = draft.title.trim() !== '';

  const handleSave = () => {
    // M4: Maßnahme ohne De-Implementierungs-Antwort (oder Waiver) kann nicht
    // gespeichert werden.
    if (!titleOk || !entlastungOk) {
      setShowErrors(true);
      return;
    }
    onSave(draft);
  };

  return (
    <div className="space-y-4">
      <TextField
        label={ui.massnahmen.formTitel}
        value={draft.title}
        onChange={(v) => setDraft({ ...draft, title: v })}
        maxLength={200}
        required
      />
      <Select
        label={ui.massnahmen.formDimension}
        value={draft.dimensionId}
        onChange={(v) => setDraft({ ...draft, dimensionId: v })}
        options={diagnoseContent.dimensions.map((d) => ({ value: d.id, label: d.title }))}
      />
      <TextArea
        label={ui.massnahmen.formBeschreibung}
        value={draft.description}
        onChange={(v) => setDraft({ ...draft, description: v })}
        maxLength={4000}
        rows={3}
      />
      <TextField
        label={ui.massnahmen.formRolle}
        value={draft.role}
        onChange={(v) => setDraft({ ...draft, role: v })}
        maxLength={200}
        hint={ui.massnahmen.formRolleHinweis}
      />
      <Select
        label={ui.massnahmen.formHorizont}
        value={draft.horizon}
        onChange={(v) => setDraft({ ...draft, horizon: v as Measure['horizon'] })}
        options={HORIZON_OPTIONS}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={ui.massnahmen.formWirkung}
          value={draft.impact === null ? '' : String(draft.impact)}
          onChange={(v) => setDraft({ ...draft, impact: v === '' ? null : (Number(v) as 1 | 2) })}
          options={LEVEL_OPTIONS}
        />
        <Select
          label={ui.massnahmen.formAufwand}
          value={draft.effort === null ? '' : String(draft.effort)}
          onChange={(v) => setDraft({ ...draft, effort: v === '' ? null : (Number(v) as 1 | 2) })}
          options={LEVEL_OPTIONS}
        />
      </div>
      <TextArea
        label={ui.massnahmen.formEntlastung}
        value={draft.deimplementation}
        onChange={(v) => setDraft({ ...draft, deimplementation: v })}
        maxLength={2000}
        placeholder={ui.massnahmen.formEntlastungPlaceholder}
        rows={2}
        required
      />
      <label className="flex items-start gap-2 text-sm text-sekundaer">
        <input
          type="checkbox"
          checked={draft.deimplementationWaived}
          onChange={(e) => setDraft({ ...draft, deimplementationWaived: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-akzent"
        />
        {ui.massnahmen.formEntlastungWaiver}
      </label>
      {showErrors && !entlastungOk && (
        <p className="text-sm text-fehler">{ui.massnahmen.formEntlastungFehler}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {ui.app.abbrechen}
        </Button>
        <Button onClick={handleSave}>{ui.massnahmen.speichern}</Button>
      </div>
    </div>
  );
}

function MeasureCard({
  measure,
  onEdit,
  onDelete,
  onSelect,
  selected,
  compact = false,
}: {
  measure: Measure;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  selected?: boolean;
  compact?: boolean;
}) {
  const dim = diagnoseContent.dimensions.find((d) => d.id === measure.dimensionId);
  const horizonLabel = HORIZON_OPTIONS.find((h) => h.value === measure.horizon)?.label ?? '';
  const body = (
    <>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${DIM_CHIP_CLASSES[measure.dimensionId]}`}
        />
        <span className="font-semibold">{measure.title}</span>
      </div>
      <p className="mt-1 text-xs text-sekundaer">
        {dim?.title} · {horizonLabel}
        {measure.role && <> · {measure.role}</>}
      </p>
      {!compact && measure.description && (
        <p className="mt-2 text-sm text-sekundaer">{measure.description}</p>
      )}
      {!compact && (
        <p className="mt-2 text-sm">
          <span className="font-medium">{ui.massnahmen.formEntlastung}</span>{' '}
          <span className="text-sekundaer">
            {measure.deimplementationWaived
              ? ui.massnahmen.formEntlastungWaiver
              : measure.deimplementation || '—'}
          </span>
        </p>
      )}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`w-full rounded-karte border bg-karte p-3 text-left shadow-sm ${
          selected
            ? 'border-primaer ring-2 ring-primaer'
            : 'border-sekundaer/20 hover:border-sekundaer/50'
        }`}
      >
        {body}
      </button>
    );
  }

  return (
    <Card>
      {body}
      <div className="mt-3 flex gap-2 print-hidden">
        {onEdit && (
          <Button variant="secondary" onClick={onEdit}>
            {ui.massnahmen.bearbeiten}
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>
            {ui.massnahmen.loeschen}
          </Button>
        )}
      </div>
    </Card>
  );
}

function MatrixView({ projectId, measures }: { projectId: string; measures: Measure[] }) {
  const saveMeasure = useAppStore((s) => s.saveMeasure);
  const [activeId, setActiveId] = useState<string | null>(null);

  const place = (impact: 1 | 2, effort: 1 | 2) => {
    if (!activeId) return;
    const m = measures.find((x) => x.id === activeId);
    if (m) saveMeasure(projectId, { ...m, impact, effort });
    setActiveId(null);
  };

  const quadrants: { impact: 1 | 2; effort: 1 | 2; label: string; highlight: boolean }[] = [
    {
      impact: 2,
      effort: 1,
      label: ui.massnahmen.quadrantWirkungHochAufwandGering,
      highlight: true,
    },
    { impact: 2, effort: 2, label: ui.massnahmen.quadrantWirkungHochAufwandHoch, highlight: false },
    {
      impact: 1,
      effort: 1,
      label: ui.massnahmen.quadrantWirkungGeringAufwandGering,
      highlight: false,
    },
    {
      impact: 1,
      effort: 2,
      label: ui.massnahmen.quadrantWirkungGeringAufwandHoch,
      highlight: false,
    },
  ];

  const unplaced = measures.filter((m) => m.impact === null || m.effort === null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-sekundaer print-hidden">{ui.massnahmen.matrixHinweis}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {quadrants.map((q) => {
          const inQuadrant = measures.filter((m) => m.impact === q.impact && m.effort === q.effort);
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => place(q.impact, q.effort)}
              disabled={!activeId}
              className={`min-h-36 rounded-karte border p-3 text-left align-top ${
                q.highlight ? 'border-primaer bg-karte' : 'border-sekundaer/25 bg-karte'
              } ${activeId ? 'cursor-pointer ring-1 ring-primaer/40 hover:ring-primaer' : 'cursor-default'}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sekundaer">
                {q.label}
                {q.highlight && (
                  <span className="ml-2 rounded bg-flaeche px-1.5 py-0.5 text-primaer">
                    {ui.massnahmen.matrixHierZuerst}
                  </span>
                )}
              </p>
              <div className="mt-2 space-y-2">
                {inQuadrant.map((m) => (
                  <div key={m.id} className="rounded border border-sekundaer/20 p-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className={`h-2 w-2 shrink-0 rounded-full ${DIM_CHIP_CLASSES[m.dimensionId]}`}
                      />
                      {m.title}
                    </div>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sekundaer">
          {ui.massnahmen.einordnenLeiste}
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {unplaced.map((m) => (
            <div key={m.id} className="space-y-2">
              <MeasureCard
                measure={m}
                compact
                selected={activeId === m.id}
                onSelect={() => setActiveId(activeId === m.id ? null : m.id)}
              />
              <div className="grid grid-cols-2 gap-2 print-hidden">
                <Select
                  label={ui.massnahmen.formWirkung}
                  value={m.impact === null ? '' : String(m.impact)}
                  onChange={(v) =>
                    saveMeasure(projectId, { ...m, impact: v === '' ? null : (Number(v) as 1 | 2) })
                  }
                  options={LEVEL_OPTIONS}
                />
                <Select
                  label={ui.massnahmen.formAufwand}
                  value={m.effort === null ? '' : String(m.effort)}
                  onChange={(v) =>
                    saveMeasure(projectId, { ...m, effort: v === '' ? null : (Number(v) as 1 | 2) })
                  }
                  options={LEVEL_OPTIONS}
                />
              </div>
            </div>
          ))}
          {unplaced.length === 0 && <p className="text-sm text-sekundaer">—</p>}
        </div>
      </div>
    </div>
  );
}

export function MassnahmenScreen() {
  const { id } = useParams<{ id: string }>();
  const project = useAppStore((s) => (id ? s.projects[id] : undefined));
  const saveMeasure = useAppStore((s) => s.saveMeasure);
  const removeMeasure = useAppStore((s) => s.removeMeasure);

  const [tab, setTab] = useState('liste');
  const [editing, setEditing] = useState<Measure | null>(null);
  const [deleting, setDeleting] = useState<Measure | null>(null);

  if (!project) return <p className="text-sekundaer">{ui.app.laden}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-prose">
          <h1 className="text-2xl font-semibold">{ui.massnahmen.titel}</h1>
          <p className="mt-2 text-sekundaer">{ui.massnahmen.intro}</p>
        </div>
        <PrintButton />
      </div>

      {project.measures.length >= 8 && (
        <Banner kind="warn">
          {ui.massnahmen.warnungViele.replace('{anzahl}', String(project.measures.length))}
        </Banner>
      )}

      <div className="print-hidden">
        <Button onClick={() => setEditing(emptyMeasure())}>{ui.massnahmen.neueMassnahme}</Button>
      </div>

      {project.measures.length === 0 ? (
        <EmptyState
          title={ui.massnahmen.leerTitel}
          text={ui.massnahmen.leerText}
          action={
            <Button onClick={() => setEditing(emptyMeasure())}>
              {ui.massnahmen.neueMassnahme}
            </Button>
          }
        />
      ) : (
        <>
          <div className="print-hidden">
            <Tabs
              tabs={[
                { id: 'liste', label: ui.massnahmen.tabListe },
                { id: 'matrix', label: ui.massnahmen.tabMatrix },
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>
          {tab === 'liste' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {project.measures.map((m) => (
                <MeasureCard
                  key={m.id}
                  measure={m}
                  onEdit={() => setEditing(m)}
                  onDelete={() => setDeleting(m)}
                />
              ))}
            </div>
          ) : (
            <MatrixView projectId={project.id} measures={project.measures} />
          )}
        </>
      )}

      <Modal
        open={editing !== null}
        title={
          editing && project.measures.some((m) => m.id === editing.id)
            ? ui.massnahmen.bearbeiten
            : ui.massnahmen.neueMassnahme
        }
        onClose={() => setEditing(null)}
      >
        {editing && (
          <MeasureForm
            key={editing.id}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={(m) => {
              saveMeasure(project.id, m);
              setEditing(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={deleting !== null}
        title={ui.massnahmen.loeschenTitel}
        onClose={() => setDeleting(null)}
      >
        {deleting && (
          <>
            <p className="text-sm text-sekundaer">
              {ui.massnahmen.loeschenText.replace('{titel}', deleting.title)}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                {ui.app.abbrechen}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  removeMeasure(project.id, deleting.id);
                  setDeleting(null);
                }}
              >
                {ui.massnahmen.loeschen}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
