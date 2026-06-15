import { Link } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Card } from '../../components/Card';
import { MarkdownView } from '../../components/MarkdownView';
import { PrintButton } from '../../components/PrintButton';
import { bild } from '../../lib/bilder';
import {
  argumentationshilfeSeite,
  beispielGrundschuleSeite,
  beispielWeiterfuehrendSeite,
  datenschutzSeite,
  einfuehrungSeite,
  faqSeite,
  glossarSeite,
  herleitungSeite,
  hinweiseSeite,
  impressumSeite,
  moderationSeite,
  vorlagenSeite,
} from '../../lib/content';

function StaticPage({ title, body, bildName }: { title: string; body: string; bildName?: string }) {
  const bildUrl = bildName ? bild(bildName) : null;
  return (
    <article className="anim-auf rounded-karte bg-karte p-6 shadow-schwebend md:p-8">
      {bildUrl && (
        <img
          src={bildUrl}
          alt=""
          className="mb-6 max-h-72 w-full rounded-karte object-cover shadow-schwebend"
        />
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-5">
        <MarkdownView markdown={body} wide />
      </div>
    </article>
  );
}

/** Statische Seite mit Zurück-Link und Druck-Button (im Druck ausgeblendet). */
function PrintableStaticPage({
  title,
  body,
  backTo,
}: {
  title: string;
  body: string;
  backTo: string;
}) {
  return (
    <article className="anim-auf rounded-karte bg-karte p-6 shadow-schwebend md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print-hidden">
        <Link to={backTo} className="text-sm text-sekundaer underline hover:text-text">
          {ui.app.zurueck}
        </Link>
        <PrintButton />
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-5">
        <MarkdownView markdown={body} wide />
      </div>
    </article>
  );
}

export function EinfuehrungScreen() {
  return <StaticPage title={einfuehrungSeite.meta.title ?? ''} body={einfuehrungSeite.body} />;
}

export function ArgumentationshilfeScreen() {
  return (
    <PrintableStaticPage
      title={argumentationshilfeSeite.meta.title ?? ''}
      body={argumentationshilfeSeite.body}
      backTo="/einfuehrung"
    />
  );
}

export function HilfeScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{ui.hilfe.titel}</h1>
        <p className="mt-2 max-w-prose text-sekundaer">{ui.hilfe.intro}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ui.hilfe.eintraege.map((eintrag) => (
          <Link key={eintrag.to} to={eintrag.to}>
            <Card interaktiv className="h-full">
              <h2 className="font-semibold text-primaer">{eintrag.titel} →</h2>
              <p className="mt-1 text-sm text-sekundaer">{eintrag.text}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BeispielGrundschuleScreen() {
  return (
    <PrintableStaticPage
      title={beispielGrundschuleSeite.meta.title ?? ''}
      body={beispielGrundschuleSeite.body}
      backTo="/hilfe"
    />
  );
}

export function BeispielWeiterfuehrendScreen() {
  return (
    <PrintableStaticPage
      title={beispielWeiterfuehrendSeite.meta.title ?? ''}
      body={beispielWeiterfuehrendSeite.body}
      backTo="/hilfe"
    />
  );
}

export function FaqScreen() {
  return (
    <PrintableStaticPage title={faqSeite.meta.title ?? ''} body={faqSeite.body} backTo="/hilfe" />
  );
}

export function GlossarScreen() {
  return (
    <PrintableStaticPage
      title={glossarSeite.meta.title ?? ''}
      body={glossarSeite.body}
      backTo="/hilfe"
    />
  );
}

export function ModerationScreen() {
  return (
    <PrintableStaticPage
      title={moderationSeite.meta.title ?? ''}
      body={moderationSeite.body}
      backTo="/hilfe"
    />
  );
}

export function VorlagenScreen() {
  return (
    <PrintableStaticPage
      title={vorlagenSeite.meta.title ?? ''}
      body={vorlagenSeite.body}
      backTo="/hilfe"
    />
  );
}

export function HinweiseScreen() {
  return (
    <StaticPage
      title={hinweiseSeite.meta.title ?? ''}
      body={hinweiseSeite.body}
      bildName="team-hinweise"
    />
  );
}

export function HerleitungScreen() {
  return <StaticPage title={herleitungSeite.meta.title ?? ''} body={herleitungSeite.body} />;
}

export function ImpressumScreen() {
  return <StaticPage title={impressumSeite.meta.title ?? ''} body={impressumSeite.body} />;
}

export function DatenschutzScreen() {
  return <StaticPage title={datenschutzSeite.meta.title ?? ''} body={datenschutzSeite.body} />;
}
