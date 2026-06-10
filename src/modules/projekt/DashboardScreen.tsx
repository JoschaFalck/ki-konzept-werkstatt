import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { StatusBadge, type ModuleStatus } from '../../components/StatusBadge';
import { TextField } from '../../components/TextField';
import { isDiagnosisComplete } from '../../lib/auswertung';
import { diagnoseContent, textgeruesteContent } from '../../lib/content';
import { builderModuleStatus } from '../../lib/exportGate';
import { exportFilename, serializeProject } from '../../lib/persistence';
import { useAppStore } from '../../store';
import type { Project } from '../../types/schemas';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadProjectJson(project: Project) {
  const blob = new Blob([serializeProject(project)], { type: 'application/json' });
  downloadBlob(blob, exportFilename(project.title, new Date()));
}

function diagnoseStatus(project: Project): ModuleStatus {
  if (isDiagnosisComplete(diagnoseContent, project)) return 'done';
  const anyAnswered = Object.values(project.diagnosis.items).some((i) => i.level !== null);
  return anyAnswered ? 'in-progress' : 'none';
}

export function DashboardScreen() {
  const { id } = useParams<{ id: string }>();
  const project = useAppStore((s) => (id ? s.projects[id] : undefined));
  const renameProject = useAppStore((s) => s.renameProject);
  const markExported = useAppStore((s) => s.markExported);
  const storageOk = useAppStore((s) => s.storageOk);
  const [renameOpen, setRenameOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  if (!project) {
    return <p className="text-sekundaer">{ui.app.laden}</p>;
  }

  const massnahmenStatus: ModuleStatus = project.measures.length > 0 ? 'in-progress' : 'none';
  const builderStatus = builderModuleStatus(textgeruesteContent.sections, project);

  const moduleCards: {
    key: string;
    to: string;
    titel: string;
    text: string;
    status: ModuleStatus;
  }[] = [
    {
      key: 'diagnose',
      to: `/p/${project.id}/diagnose`,
      titel: ui.dashboard.module.diagnose.titel,
      text: ui.dashboard.module.diagnose.text,
      status: diagnoseStatus(project),
    },
    {
      key: 'referenz',
      to: `/p/${project.id}/referenz`,
      titel: ui.dashboard.module.referenz.titel,
      text: ui.dashboard.module.referenz.text,
      status: 'none',
    },
    {
      key: 'builder',
      to: `/p/${project.id}/builder`,
      titel: ui.dashboard.module.builder.titel,
      text: ui.dashboard.module.builder.text,
      status: builderStatus,
    },
    {
      key: 'massnahmen',
      to: `/p/${project.id}/massnahmen`,
      titel: ui.dashboard.module.massnahmen.titel,
      text: ui.dashboard.module.massnahmen.text,
      status: massnahmenStatus,
    },
    {
      key: 'prozess',
      to: `/p/${project.id}/prozess`,
      titel: ui.dashboard.module.prozess.titel,
      text: ui.dashboard.module.prozess.text,
      status: 'none',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.title}</h1>
          <button
            type="button"
            className="text-sm text-sekundaer underline hover:text-text"
            onClick={() => {
              setTitleDraft(project.title);
              setRenameOpen(true);
            }}
          >
            {ui.start.umbenennen}
          </button>
        </div>
        <Button
          className={!storageOk ? 'animate-pulse' : ''}
          onClick={() => {
            downloadProjectJson(project);
            markExported();
          }}
        >
          {ui.dashboard.sichern}
        </Button>
      </div>

      <p className="max-w-prose text-sm text-sekundaer">{ui.dashboard.geraetebindung}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {moduleCards.map((mod) => (
          <Card key={mod.key} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{mod.titel}</h2>
              {mod.key !== 'referenz' && mod.key !== 'prozess' && (
                <StatusBadge status={mod.status} />
              )}
            </div>
            <p className="mt-2 flex-1 text-sm text-sekundaer">{mod.text}</p>
            <div className="mt-4">
              <Link to={mod.to}>
                <Button variant="secondary">{ui.start.projektOeffnen}</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={renameOpen} title={ui.start.umbenennen} onClose={() => setRenameOpen(false)}>
        <div className="space-y-4">
          <TextField
            label={ui.start.titelLabel}
            value={titleDraft}
            onChange={setTitleDraft}
            maxLength={200}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRenameOpen(false)}>
              {ui.app.abbrechen}
            </Button>
            <Button
              disabled={titleDraft.trim() === ''}
              onClick={() => {
                renameProject(project.id, titleDraft.trim());
                setRenameOpen(false);
              }}
            >
              {ui.start.umbenennen}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
