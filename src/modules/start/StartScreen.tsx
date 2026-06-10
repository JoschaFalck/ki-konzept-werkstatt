import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Banner } from '../../components/Banner';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { ProgressBar } from '../../components/ProgressBar';
import { TextField } from '../../components/TextField';
import { diagnoseContent } from '../../lib/content';
import { parseImportFile } from '../../lib/importValidation';
import { useAppStore } from '../../store';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function ProjectCard({ id, title, updatedAt }: { id: string; title: string; updatedAt: string }) {
  const project = useAppStore((s) => s.projects[id]);
  const ensureLoaded = useAppStore((s) => s.ensureLoaded);
  const removeProject = useAppStore((s) => s.removeProject);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => ensureLoaded(id), [id, ensureLoaded]);

  const totalItems = diagnoseContent.dimensions.reduce(
    (sum, d) => sum + d.items.filter((i) => !i.deprecated).length,
    0,
  );
  const doneItems = project
    ? Object.entries(project.diagnosis.items).filter(([, v]) => v.level !== null).length
    : 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{title}</h2>
          <p className="text-sm text-sekundaer">
            {ui.start.zuletztGeaendert}: {formatDate(updatedAt)}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <ProgressBar
          value={doneItems}
          max={totalItems}
          label={`${ui.dashboard.module.diagnose.titel}: ${doneItems} ${ui.diagnose.itemsBearbeitet} ${totalItems}`}
        />
        <p className="text-xs text-sekundaer">
          {ui.dashboard.module.diagnose.titel}: {doneItems} {ui.diagnose.itemsBearbeitet}{' '}
          {totalItems} {ui.diagnose.itemsEinheit}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/p/${id}`}>
          <Button>{ui.start.projektOeffnen}</Button>
        </Link>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          {ui.start.projektLoeschen}
        </Button>
      </div>
      <Modal
        open={confirmDelete}
        title={ui.start.loeschenTitel}
        onClose={() => setConfirmDelete(false)}
      >
        <p className="text-sekundaer">{ui.start.loeschenText.replace('{titel}', title)}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            {ui.app.abbrechen}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              removeProject(id);
              setConfirmDelete(false);
            }}
          >
            {ui.start.loeschenBestaetigen}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}

export function StartScreen() {
  const index = useAppStore((s) => s.index);
  const createProject = useAppStore((s) => s.createProject);
  const addImportedProject = useAppStore((s) => s.addImportedProject);
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [importMessage, setImportMessage] = useState<{
    kind: 'info' | 'error';
    text: string;
  } | null>(null);

  const handleCreate = () => {
    const title = newTitle.trim();
    if (title === '') return;
    const id = createProject(title);
    setCreateOpen(false);
    setNewTitle('');
    navigate(`/p/${id}`);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const existingIds = useAppStore.getState().index.map((m) => m.id);
    const result = parseImportFile(text, existingIds);
    if (!result.ok) {
      const messages = {
        'invalid-json': ui.start.importFehlerJson,
        'not-werkstatt': ui.start.importFehlerFremd,
        'newer-version': ui.start.importFehlerNeuer,
      } as const;
      setImportMessage({ kind: 'error', text: messages[result.reason] });
      return;
    }
    addImportedProject(result.project);
    setImportMessage({
      kind: 'info',
      text: result.wasCollision ? ui.start.importKopieHinweis : ui.start.importErfolg,
    });
  };

  return (
    <div className="space-y-8">
      <div className="max-w-prose">
        <h1 className="text-2xl font-semibold">{ui.app.titel}</h1>
        <p className="mt-2 text-sekundaer">{ui.app.claim}</p>
      </div>

      {importMessage && (
        <Banner kind={importMessage.kind} dismissible>
          {importMessage.text}
        </Banner>
      )}

      <div className="flex flex-wrap gap-3 print-hidden">
        <Button onClick={() => setCreateOpen(true)}>{ui.start.neuesProjekt}</Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          {ui.start.importieren}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = '';
          }}
        />
      </div>

      {index.length === 0 ? (
        <EmptyState
          title={ui.start.leerTitel}
          text={ui.start.leerText}
          action={<Button onClick={() => setCreateOpen(true)}>{ui.start.neuesProjekt}</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {index.map((meta) => (
            <ProjectCard key={meta.id} id={meta.id} title={meta.title} updatedAt={meta.updatedAt} />
          ))}
        </div>
      )}

      <Modal open={createOpen} title={ui.start.neuesProjekt} onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <TextField
            label={ui.start.titelLabel}
            value={newTitle}
            onChange={setNewTitle}
            maxLength={200}
            placeholder={ui.start.titelPlaceholder}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              {ui.app.abbrechen}
            </Button>
            <Button onClick={handleCreate} disabled={newTitle.trim() === ''}>
              {ui.start.anlegen}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
