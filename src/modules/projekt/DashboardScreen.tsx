import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { StatusBadge, type ModuleStatus } from '../../components/StatusBadge';
import { TextField } from '../../components/TextField';
import { isDiagnosisComplete } from '../../lib/auswertung';
import { bild } from '../../lib/bilder';
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

function ModulMotiv({ name }: { name: string }) {
  const bildUrl = bild(`modul-${name}`);
  if (bildUrl) {
    return (
      <div className="flex justify-center rounded-t-karte bg-flaeche">
        <img src={bildUrl} alt="" className="h-44 w-auto object-contain" />
      </div>
    );
  }
  const glyphs: Record<string, React.ReactNode> = {
    diagnose: (
      <polygon
        points="22,6 38,14 35,32 9,32 6,14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    ),
    referenz: (
      <path
        d="M8 8 H22 V32 H8 Z M22 8 H36 V32 H22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    ),
    builder: (
      <path
        d="M10 8 H34 V32 H10 Z M15 15 H29 M15 21 H29 M15 27 H23"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    ),
    massnahmen: (
      <path
        d="M8 8 H20 V20 H8 Z M24 8 H36 V20 H24 Z M8 24 H20 V36 H8 Z M24 24 H36 V36 H24 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    ),
    prozess: (
      <path
        d="M7 12 H27 V34 H7 Z M14 8 H34 V30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    ),
  };
  return (
    <div className="flex h-28 items-center justify-center rounded-t-karte bg-aurora-hero text-bernstein">
      <svg viewBox="0 0 44 40" width="56" height="51" aria-hidden="true">
        {glyphs[name]}
      </svg>
    </div>
  );
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
    status: ModuleStatus | null;
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
      status: null,
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
      status: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="anim-auf flex flex-wrap items-center justify-between gap-3">
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

      <p className="anim-auf anim-auf-1 max-w-prose text-sm text-sekundaer">
        {ui.dashboard.geraetebindung}
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {moduleCards.map((mod, i) => (
          <Link
            key={mod.key}
            to={mod.to}
            className={`anim-auf anim-auf-${Math.min(i + 1, 4)} group`}
          >
            <Card interaktiv className="flex h-full flex-col overflow-hidden !p-0">
              <ModulMotiv name={mod.key} />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold group-hover:text-primaer">{mod.titel}</h2>
                  {mod.status !== null && <StatusBadge status={mod.status} />}
                </div>
                <p className="mt-2 flex-1 text-sm text-sekundaer">{mod.text}</p>
                <p className="mt-4 text-sm font-medium text-primaer">{ui.start.projektOeffnen} →</p>
              </div>
            </Card>
          </Link>
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
