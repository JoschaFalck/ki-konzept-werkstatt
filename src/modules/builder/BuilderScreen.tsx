import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Banner } from '../../components/Banner';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { TextArea, TextField } from '../../components/TextField';
import { computeAuswertung } from '../../lib/auswertung';
import {
  CONTENT_VERSION,
  diagnoseContent,
  hebelContent,
  linksForContext,
  textgeruesteContent,
} from '../../lib/content';
import { exportConcept } from '../../lib/export/docx';
import { exportConceptMarkdown } from '../../lib/export/markdown';
import { svgToPng } from '../../lib/export/chartToPng';
import { checkExportGate, sectionStatus, type SectionStatus } from '../../lib/exportGate';
import { slugify } from '../../lib/persistence';
import { radarSvg } from '../../lib/radarSvg';
import { MaterialKarte } from '../../components/MaterialKarte';
import { useAppStore } from '../../store';
import type { BuilderSection, Template } from '../../types/contentSchemas';
import type { Project, SectionState } from '../../types/schemas';
import { downloadBlob } from '../projekt/DashboardScreen';

const STATUS_LABEL: Record<SectionStatus, string> = {
  leer: ui.builder.statusLeer,
  entwurf: ui.builder.statusEntwurf,
  offen: ui.builder.statusOffen,
  fertig: ui.builder.statusFertig,
};

const STATUS_CLASS: Record<SectionStatus, string> = {
  leer: 'text-sekundaer',
  entwurf: 'text-akzent',
  offen: 'text-akzent',
  fertig: 'text-erfolg',
};

function exportDeps() {
  return {
    diagnose: diagnoseContent,
    gerueste: textgeruesteContent,
    hebel: hebelContent,
    contentVersion: CONTENT_VERSION,
  };
}

function TemplateForm({
  project,
  section,
  template,
  state,
}: {
  project: Project;
  section: BuilderSection;
  template: Template;
  state: SectionState;
}) {
  const setFieldValue = useAppStore((s) => s.setFieldValue);
  const setFieldOpen = useAppStore((s) => s.setFieldOpen);

  return (
    <div className="space-y-4">
      {template.segments.map((segment, i) => {
        if (segment.type === 'text') {
          return (
            <p key={i} className="max-w-prose text-text">
              {segment.value}
            </p>
          );
        }
        if (segment.type === 'hint') {
          return (
            <p
              key={i}
              className="max-w-prose border-l-4 border-akzent/60 pl-3 text-sm text-sekundaer"
            >
              {segment.value}
            </p>
          );
        }
        const fieldState = state.fields[segment.id] ?? { value: '', markedOpen: false };
        const fieldProps = {
          label: segment.label,
          value: fieldState.value,
          onChange: (v: string) => setFieldValue(project.id, section.id, segment.id, v),
          maxLength: 8000,
          placeholder: segment.placeholder,
          required: segment.required,
        };
        return (
          <div
            key={segment.id}
            id={`feld-${section.id}-${segment.id}`}
            className="max-w-prose space-y-1"
          >
            {segment.multiline ? <TextArea {...fieldProps} /> : <TextField {...fieldProps} />}
            <label className="flex items-center gap-2 text-sm text-sekundaer">
              <input
                type="checkbox"
                checked={fieldState.markedOpen}
                onChange={(e) => setFieldOpen(project.id, section.id, segment.id, e.target.checked)}
                className="h-4 w-4 accent-akzent"
              />
              {ui.builder.markedOpenLabel}
            </label>
          </div>
        );
      })}
    </div>
  );
}

export function BuilderScreen() {
  const { id, section: sectionParam } = useParams<{ id: string; section?: string }>();
  const project = useAppStore((s) => (id ? s.projects[id] : undefined));
  const chooseTemplate = useAppStore((s) => s.chooseTemplate);
  const markExported = useAppStore((s) => s.markExported);

  const [gateOpen, setGateOpen] = useState(false);
  const [docxError, setDocxError] = useState(false);
  const [switchTo, setSwitchTo] = useState<string | null>(null);

  if (!project) return <p className="text-sekundaer">{ui.app.laden}</p>;

  const sections = textgeruesteContent.sections;
  const active = sections.find((s) => s.id === sectionParam) ?? sections[0];
  const state = project.concept.sections[active.id] ?? { templateId: null, fields: {} };
  const template = active.templates.find((t) => t.id === state.templateId) ?? null;
  const gate = checkExportGate(sections, project.concept.sections);
  const vertiefung = linksForContext(active.id);

  const hasInput = Object.values(state.fields).some((f) => f.value.trim() !== '');

  const handleChoose = (templateId: string) => {
    if (state.templateId && state.templateId !== templateId && hasInput) {
      setSwitchTo(templateId);
    } else if (state.templateId !== templateId) {
      chooseTemplate(project.id, active.id, templateId);
    }
  };

  const buildRadarPng = async () => {
    const auswertung = computeAuswertung(diagnoseContent, project);
    const anyComplete = diagnoseContent.dimensions.some((d) => auswertung.means[d.id] !== null);
    if (!anyComplete) return null;
    try {
      return await svgToPng(
        radarSvg(
          diagnoseContent.dimensions.map((d) => ({
            id: d.id,
            title: d.title,
            mean: auswertung.means[d.id],
          })),
        ),
      );
    } catch {
      return null;
    }
  };

  const handleExportDocx = async () => {
    if (!gate.ok) {
      setGateOpen(true);
      return;
    }
    try {
      const png = await buildRadarPng();
      const blob = await exportConcept(project, exportDeps(), png);
      downloadBlob(blob, `${slugify(project.title)}_konzept.docx`);
      markExported();
    } catch {
      setDocxError(true);
    }
  };

  const handleExportMd = () => {
    if (!gate.ok) {
      setGateOpen(true);
      return;
    }
    const md = exportConceptMarkdown(project, exportDeps());
    downloadBlob(new Blob([md], { type: 'text/markdown' }), `${slugify(project.title)}_konzept.md`);
    markExported();
  };

  return (
    <div className="space-y-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-semibold">{ui.builder.titel}</h1>
        <p className="mt-2 text-sekundaer">{ui.builder.intro}</p>
      </div>

      {docxError && (
        <Banner kind="error" dismissible>
          {ui.builder.docxFehler}
        </Banner>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void handleExportDocx()}>{ui.builder.exportDocx}</Button>
        <Button variant="secondary" onClick={handleExportMd}>
          {ui.builder.exportMd}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav aria-label={ui.builder.titel} className="lg:sticky lg:top-4 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {sections.map((sec) => {
              const status = sectionStatus(sec, project.concept.sections[sec.id]);
              return (
                <li key={sec.id}>
                  <Link
                    to={`/p/${project.id}/builder/${sec.id}`}
                    aria-current={sec.id === active.id ? 'page' : undefined}
                    className={`block rounded px-3 py-2 text-sm ${
                      sec.id === active.id
                        ? 'bg-karte font-semibold text-primaer shadow-sm'
                        : 'text-sekundaer hover:text-text'
                    }`}
                  >
                    {sec.title}
                    <span className={`block text-xs ${STATUS_CLASS[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-5">
          <Card>
            <h2 className="text-xl font-semibold">{active.title}</h2>
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-sekundaer">
              {ui.builder.leitfragen}
            </h3>
            <ul className="mt-2 list-disc pl-5 text-sekundaer">
              {active.leitfragen.map((frage, i) => (
                <li key={i}>{frage}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sekundaer">
              {ui.builder.geruestWaehlen}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {active.templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleChoose(tpl.id)}
                  aria-pressed={state.templateId === tpl.id}
                  className={`rounded-karte border p-4 text-left ${
                    state.templateId === tpl.id
                      ? 'border-primaer ring-1 ring-primaer'
                      : 'border-sekundaer/20 hover:border-sekundaer/50'
                  }`}
                >
                  <span className="font-medium">{tpl.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-sekundaer">{ui.builder.gremienHinweis}</p>
          </Card>

          {template && (
            <Card>
              <TemplateForm project={project} section={active} template={template} state={state} />
            </Card>
          )}
        </div>
      </div>

      <Modal open={gateOpen} title={ui.builder.exportGateTitel} onClose={() => setGateOpen(false)}>
        <p className="text-sm text-sekundaer">{ui.builder.exportGateText}</p>
        <ul className="mt-4 space-y-2">
          {gate.blocking.map((b) => (
            <li key={`${b.sectionId}-${b.fieldId}`} className="text-sm">
              <span className="font-medium">{b.sectionTitle}:</span> {b.fieldLabel}{' '}
              <Link
                to={`/p/${project.id}/builder/${b.sectionId}`}
                onClick={() => setGateOpen(false)}
                className="text-primaer underline"
              >
                {ui.builder.exportGateLink}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={() => setGateOpen(false)}>
            {ui.app.schliessen}
          </Button>
        </div>
      </Modal>

      <Modal
        open={switchTo !== null}
        title={ui.builder.geruestWechselTitel}
        onClose={() => setSwitchTo(null)}
      >
        <p className="text-sm text-sekundaer">{ui.builder.geruestWechselText}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSwitchTo(null)}>
            {ui.app.abbrechen}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (switchTo) chooseTemplate(project.id, active.id, switchTo);
              setSwitchTo(null);
            }}
          >
            {ui.builder.geruestWechselBestaetigen}
          </Button>
        </div>
      </Modal>

      {vertiefung.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
          {vertiefung.map((l) => (
            <MaterialKarte key={l.id} eintrag={l} />
          ))}
        </div>
      )}
    </div>
  );
}
