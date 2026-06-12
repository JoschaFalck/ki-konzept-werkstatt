import { Link, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { MaterialKarte } from '../../components/MaterialKarte';
import { MarkdownView } from '../../components/MarkdownView';
import {
  diagnoseContent,
  DIM_CHIP_CLASSES,
  linksForContext,
  referenzrahmen,
} from '../../lib/content';

export function ReferenzScreen() {
  const { id, dim } = useParams<{ id: string; dim?: string }>();
  const activeDim = dim ?? diagnoseContent.dimensions[0].id;
  const seite = referenzrahmen[activeDim];
  const vertiefung = linksForContext(activeDim);

  return (
    <div className="space-y-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-semibold">{ui.referenz.titel}</h1>
        <p className="mt-2 text-sekundaer">{ui.referenz.intro}</p>
        <Link to="/herleitung" className="text-sm text-sekundaer underline hover:text-text">
          {ui.referenz.herleitung}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label={ui.referenz.titel} className="lg:sticky lg:top-4 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {diagnoseContent.dimensions.map((d) => (
              <li key={d.id}>
                <Link
                  to={`/p/${id}/referenz/${d.id}`}
                  aria-current={d.id === activeDim ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                    d.id === activeDim
                      ? 'bg-karte font-semibold text-primaer shadow-sm'
                      : 'text-sekundaer hover:text-text'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${DIM_CHIP_CLASSES[d.id]}`}
                  />
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="rounded-karte bg-karte p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{seite?.meta.title}</h2>
          {seite?.meta.leitfrage && <p className="mt-1 text-sekundaer">{seite.meta.leitfrage}</p>}
          <div className="mt-5">
            <MarkdownView markdown={seite?.body ?? ''} />
          </div>
          {vertiefung.length > 0 && (
            <div className="mt-6 border-t border-sekundaer/15 pt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-sekundaer">
                {ui.referenz.vertiefung}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {vertiefung.map((l) => (
                  <MaterialKarte key={l.id} eintrag={l} />
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
