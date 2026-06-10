import { useState } from 'react';
import { ui } from '../../../content/ui-strings';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { MarkdownView } from '../../components/MarkdownView';
import { PrintButton } from '../../components/PrintButton';
import { kartenContent, materialienContent } from '../../lib/content';

// S10 Prozessbegleitung: vier Materialtypen (Diskussionskarten + drei
// Markdown-Materialien), jeweils Ansicht + Druck.

type Auswahl = 'karten' | string | null;

function KartenAnsicht() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 print-hidden">
        <h2 className="text-xl font-semibold">{ui.prozess.kartenTitel}</h2>
        <PrintButton />
      </div>
      <div className="print-karten grid gap-4 sm:grid-cols-2">
        {kartenContent.karten.map((karte) => (
          <div
            key={karte.id}
            className="print-karte flex flex-col rounded-karte bg-karte p-5 shadow-sm"
          >
            <p className="flex-1 text-lg font-medium leading-snug">{karte.these}</p>
            {karte.hinweis && (
              <p className="mt-4 border-t border-sekundaer/15 pt-3 text-xs text-sekundaer">
                {ui.prozess.kartenHinweisLabel}: {karte.hinweis}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProzessScreen() {
  const [auswahl, setAuswahl] = useState<Auswahl>(null);

  if (auswahl === 'karten') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setAuswahl(null)}
          className="text-sm text-sekundaer underline hover:text-text print-hidden"
        >
          {ui.app.zurueck}
        </button>
        <KartenAnsicht />
      </div>
    );
  }

  const material = materialienContent.materialien.find((m) => m.id === auswahl);
  if (material) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 print-hidden">
          <button
            type="button"
            onClick={() => setAuswahl(null)}
            className="text-sm text-sekundaer underline hover:text-text"
          >
            {ui.app.zurueck}
          </button>
          <PrintButton />
        </div>
        <article className="rounded-karte bg-karte p-6 shadow-sm print:p-0 print:shadow-none">
          <MarkdownView markdown={material.body} />
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-semibold">{ui.prozess.titel}</h1>
        <p className="mt-2 text-sekundaer">{ui.prozess.intro}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <h2 className="text-lg font-semibold">{ui.prozess.kartenTitel}</h2>
          <p className="mt-2 flex-1 text-sm text-sekundaer">{ui.prozess.kartenText}</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => setAuswahl('karten')}>
              {ui.prozess.ansehen}
            </Button>
          </div>
        </Card>
        {materialienContent.materialien.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <h2 className="text-lg font-semibold">{m.title}</h2>
            <p className="mt-2 flex-1 text-sm text-sekundaer">{m.description}</p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => setAuswahl(m.id)}>
                {ui.prozess.ansehen}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
