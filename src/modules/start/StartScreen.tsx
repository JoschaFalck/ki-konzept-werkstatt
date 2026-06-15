import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Banner } from '../../components/Banner';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { ProgressBar } from '../../components/ProgressBar';
import { TextField } from '../../components/TextField';
import { bild } from '../../lib/bilder';
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

function HeroMotiv() {
  const heroBild = bild('hero');
  if (heroBild) {
    return (
      <img
        src={heroBild}
        alt=""
        className="w-full rounded-karte object-cover shadow-schwebend-lg"
      />
    );
  }
  return (
    <svg viewBox="0 0 220 200" width="100%" aria-hidden="true" className="w-full">
      <polygon
        points="110,20 192,60 177,156 43,156 28,60"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      />
      <polygon
        points="110,55 163,80 154,140 66,140 57,80"
        fill="rgba(250,199,117,0.22)"
        stroke="#FAC775"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="110" cy="55" r="7" fill="#FAC775" />
      <circle cx="163" cy="80" r="7" fill="#9FE1CB" />
      <circle cx="154" cy="140" r="7" fill="#FFFFFF" />
      <circle cx="66" cy="140" r="7" fill="#9FE1CB" />
      <circle cx="57" cy="80" r="7" fill="#FFFFFF" />
    </svg>
  );
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
    <Card interaktiv className="flex flex-wrap items-center gap-x-5 gap-y-3 p-4">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{title}</h3>
        <p className="text-xs text-sekundaer">
          {ui.start.zuletztGeaendert}: {formatDate(updatedAt)} · {doneItems}/{totalItems}{' '}
          {ui.diagnose.itemsEinheit}
        </p>
        <div className="mt-2">
          <ProgressBar
            value={doneItems}
            max={totalItems}
            label={`${ui.dashboard.module.diagnose.titel}: ${doneItems} ${ui.diagnose.itemsBearbeitet} ${totalItems}`}
          />
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
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

  // Jüngstes Projekt für den Schnellzugriff unter dem Hero-Bild.
  const letztesProjekt = index[0] ?? null;

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
    <div className="space-y-10">
      <section className="anim-auf relative overflow-hidden rounded-karte bg-aurora-hero px-7 py-10 text-white shadow-schwebend-lg md:px-12 md:py-14">
        <div
          aria-hidden
          className="anim-schweben pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-bernstein/20"
        />
        <div
          aria-hidden
          className="anim-schweben-2 pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-himmel/20"
        />
        <div className="relative flex items-center justify-between gap-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bernstein">
              {ui.start.heroEyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              {ui.start.heroTitel1}
              <br />
              {ui.start.heroTitel2}
            </h1>
            <p className="mt-4 max-w-prose text-white/80">{ui.app.claim}</p>
            <div className="mt-7 flex flex-wrap gap-3 print-hidden">
              <Button variant="hero" onClick={() => setCreateOpen(true)}>
                {ui.start.neuesProjekt}
              </Button>
              <Button
                className="border border-white/50 bg-transparent text-white hover:bg-white/10"
                variant="ghost"
                onClick={() => fileInput.current?.click()}
              >
                {ui.start.importieren}
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/60">{ui.start.heroHinweis}</p>
            <Link
              to="/einfuehrung"
              className="mt-3 inline-block text-sm text-white/80 underline underline-offset-2 hover:text-white print-hidden"
            >
              {ui.start.warumLink} →
            </Link>
          </div>
          <div className="hidden w-[44%] shrink-0 flex-col gap-3 md:flex">
            <HeroMotiv />
            {letztesProjekt && (
              <Link to={`/p/${letztesProjekt.id}`} className="print-hidden">
                <Button variant="hero" className="w-full justify-center">
                  {ui.start.projektFortsetzen}
                </Button>
              </Link>
            )}
          </div>
        </div>
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
      </section>

      {importMessage && (
        <Banner kind={importMessage.kind} dismissible>
          {importMessage.text}
        </Banner>
      )}

      {index.length > 0 && (
        <section className="anim-auf anim-auf-1">
          <h2 className="text-xl font-semibold">{ui.start.projekteTitel}</h2>
          <div className="mt-4 flex flex-col gap-3">
            {index.map((meta) => (
              <ProjectCard
                key={meta.id}
                id={meta.id}
                title={meta.title}
                updatedAt={meta.updatedAt}
              />
            ))}
          </div>
        </section>
      )}

      <section className="anim-auf anim-auf-2">
        <h2 className="text-xl font-semibold">{ui.start.soFunktioniertTitel}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ui.start.schritte.map((schritt, i) => (
            <Card key={schritt.titel} className="flex flex-col">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full bg-aurora-balken text-base font-semibold text-white"
              >
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{schritt.titel}</h3>
              <p className="mt-1 text-sm text-sekundaer">{schritt.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="anim-auf anim-auf-3">
        <h2 className="text-xl font-semibold">{ui.start.stoebernTitel}</h2>
        <p className="mt-1 max-w-prose text-sm text-sekundaer">{ui.start.stoebernText}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link to="/referenz">
            <Card interaktiv className="h-full">
              <h3 className="font-semibold text-primaer">{ui.start.stoebernReferenz} →</h3>
              <p className="mt-1 text-sm text-sekundaer">{ui.start.stoebernReferenzText}</p>
            </Card>
          </Link>
          <Link to="/materialien">
            <Card interaktiv className="h-full">
              <h3 className="font-semibold text-primaer">{ui.start.stoebernMaterial} →</h3>
              <p className="mt-1 text-sm text-sekundaer">{ui.start.stoebernMaterialText}</p>
            </Card>
          </Link>
          <Link to="/prozess">
            <Card interaktiv className="h-full">
              <h3 className="font-semibold text-primaer">{ui.start.stoebernProzess} →</h3>
              <p className="mt-1 text-sm text-sekundaer">{ui.start.stoebernProzessText}</p>
            </Card>
          </Link>
        </div>
      </section>

      <section className="anim-auf anim-auf-4 flex flex-col items-start gap-3 rounded-karte bg-primaer/5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-prose">
          <h2 className="text-lg font-semibold">{ui.start.eigenesProjekt}</h2>
          <p className="mt-1 text-sm text-sekundaer">{ui.start.eigenesProjektText}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>{ui.start.neuesProjekt}</Button>
      </section>

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
