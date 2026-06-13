import { MarkdownView } from '../../components/MarkdownView';
import { bild } from '../../lib/bilder';
import {
  datenschutzSeite,
  herleitungSeite,
  hinweiseSeite,
  impressumSeite,
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
