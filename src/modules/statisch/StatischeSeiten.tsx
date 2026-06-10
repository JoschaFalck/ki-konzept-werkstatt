import { MarkdownView } from '../../components/MarkdownView';
import { herleitungSeite, hinweiseSeite } from '../../lib/content';

function StaticPage({ title, body }: { title: string; body: string }) {
  return (
    <article className="mx-auto max-w-prose rounded-karte bg-karte p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-5">
        <MarkdownView markdown={body} />
      </div>
    </article>
  );
}

export function HinweiseScreen() {
  return <StaticPage title={hinweiseSeite.meta.title ?? ''} body={hinweiseSeite.body} />;
}

export function HerleitungScreen() {
  return <StaticPage title={herleitungSeite.meta.title ?? ''} body={herleitungSeite.body} />;
}
