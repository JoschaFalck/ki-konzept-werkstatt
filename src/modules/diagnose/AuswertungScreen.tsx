import { Link, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Banner } from '../../components/Banner';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { MaterialKarte } from '../../components/MaterialKarte';
import { PrintButton } from '../../components/PrintButton';
import { RadarChart } from '../../components/RadarChart';
import { ZahlAnimation } from '../../components/ZahlAnimation';
import { computeAuswertung } from '../../lib/auswertung';
import {
  diagnoseContent,
  DIM_CHIP_CLASSES,
  hebelContent,
  linksContent,
  linksForContext,
} from '../../lib/content';
import type { LinkEntry } from '../../types/contentSchemas';
import { useAppStore } from '../../store';
import type { HebelText } from '../../types/contentSchemas';

/** Bis zu drei eindeutige Materialien für eine Menge von Dimensionen. */
function materialsForDims(dimIds: string[]): LinkEntry[] {
  const seen = new Set<string>();
  const result: LinkEntry[] = [];
  for (const dimId of dimIds) {
    for (const link of linksForContext(dimId)) {
      if (!seen.has(link.id)) {
        seen.add(link.id);
        result.push(link);
      }
    }
  }
  return result.slice(0, 3);
}

function HebelBox({ haupt, zusatz }: { haupt: HebelText; zusatz: HebelText[] }) {
  const linksFor = (h: HebelText) => linksContent.links.filter((l) => h.linkIds.includes(l.id));
  return (
    <Card>
      <h2 className="text-lg font-semibold text-primaer">{ui.auswertung.hebelTitel}</h2>
      <h3 className="mt-3 font-semibold">{haupt.titel}</h3>
      <p className="mt-1 max-w-prose text-sekundaer">{haupt.text}</p>
      {linksFor(haupt).length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {linksFor(haupt).map((l) => (
            <MaterialKarte key={l.id} eintrag={l} />
          ))}
        </div>
      )}
      {zusatz.length > 0 && (
        <div className="mt-5 border-t border-sekundaer/15 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-sekundaer">
            {ui.auswertung.zusatzHinweise}
          </h3>
          {zusatz.map((regel) => (
            <div key={regel.id} className="mt-3">
              <h4 className="font-semibold">{regel.titel}</h4>
              <p className="mt-1 max-w-prose text-sm text-sekundaer">{regel.text}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function AuswertungScreen() {
  const { id } = useParams<{ id: string }>();
  const project = useAppStore((s) => (id ? s.projects[id] : undefined));

  if (!project) return <p className="text-sekundaer">{ui.app.laden}</p>;

  const auswertung = computeAuswertung(diagnoseContent, project);
  const anyComplete = diagnoseContent.dimensions.some((d) => auswertung.means[d.id] !== null);

  if (!anyComplete) {
    return (
      <EmptyState
        title={ui.auswertung.leerTitel}
        text={ui.auswertung.leerText}
        action={
          <Link to={`/p/${project.id}/diagnose`}>
            <Button>{ui.auswertung.zurDiagnose}</Button>
          </Link>
        }
      />
    );
  }

  const radarData = diagnoseContent.dimensions.map((d) => ({
    id: d.id,
    title: d.title,
    mean: auswertung.means[d.id],
  }));

  const changedSinceComplete =
    project.diagnosis.completedAt !== null && project.updatedAt > project.diagnosis.completedAt;

  const dimTitle = (dimId: string) =>
    diagnoseContent.dimensions.find((d) => d.id === dimId)?.title ?? dimId;

  const staerkenMaterial = materialsForDims(auswertung.staerken);
  const feldMaterial = materialsForDims(auswertung.entwicklungsfelder);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{ui.auswertung.titel}</h1>
        <PrintButton />
      </div>

      {!auswertung.complete && <Banner kind="info">{ui.auswertung.unvollstaendigHinweis}</Banner>}
      {auswertung.complete && changedSinceComplete && project.diagnosis.completedAt && (
        <Banner kind="info">
          {ui.auswertung.standHinweis.replace(
            '{datum}',
            new Date(project.diagnosis.completedAt).toLocaleDateString('de-DE'),
          )}
        </Banner>
      )}
      {auswertung.irritation.triggered && (
        <Banner kind="warn" title={hebelContent.irritation.titel}>
          {hebelContent.irritation.text}{' '}
          {ui.auswertung.ohneEvidenz
            .replace('{ohne}', String(auswertung.irritation.ohneEvidenz))
            .replace('{gesamt}', String(auswertung.irritation.gesamt))}
        </Banner>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="anim-auf anim-auf-1">
          <RadarChart data={radarData} />
        </Card>
        <Card className="anim-auf anim-auf-2">
          <h2 className="text-lg font-semibold">{ui.auswertung.mittelwerte}</h2>
          <table className="mt-3 w-full text-left">
            <thead>
              <tr className="border-b border-sekundaer/20 text-sm text-sekundaer">
                <th scope="col" className="py-2 font-medium">
                  {ui.auswertung.dimension}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {ui.auswertung.mittelwert}
                </th>
              </tr>
            </thead>
            <tbody>
              {diagnoseContent.dimensions.map((d) => {
                const mean = auswertung.means[d.id];
                return (
                  <tr
                    key={d.id}
                    className={`border-b border-sekundaer/10 ${mean === null ? 'opacity-50' : ''}`}
                  >
                    <td className="flex items-center gap-2 py-2">
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 rounded-full ${DIM_CHIP_CLASSES[d.id]}`}
                      />
                      {d.title}
                    </td>
                    <td className="py-2 font-medium tabular-nums">
                      {mean === null ? (
                        ui.auswertung.nichtVollstaendig
                      ) : (
                        <ZahlAnimation wert={mean} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {auswertung.hauptRegel && (
        <div className="anim-auf anim-auf-3">
          <HebelBox
            haupt={hebelContent.regeln[auswertung.hauptRegel]}
            zusatz={auswertung.zusatzRegeln.map((r) => hebelContent.regeln[r])}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-erfolg">{ui.auswertung.staerken}</h2>
          {auswertung.staerken.length === 0 ? (
            <p className="mt-2 text-sm text-sekundaer">—</p>
          ) : (
            <>
              <ul className="mt-2 list-disc pl-5 text-sekundaer">
                {auswertung.staerken.map((dimId) => (
                  <li key={dimId}>{dimTitle(dimId)}</li>
                ))}
              </ul>
              {staerkenMaterial.length > 0 && (
                <div className="mt-4 border-t border-sekundaer/15 pt-4 print-hidden">
                  <p className="text-sm text-sekundaer">{ui.auswertung.staerkenMaterial}</p>
                  <div className="mt-3 grid gap-3">
                    {staerkenMaterial.map((l) => (
                      <MaterialKarte key={l.id} eintrag={l} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold text-akzent">{ui.auswertung.entwicklungsfelder}</h2>
          <ul className="mt-2 list-disc pl-5 text-sekundaer">
            {auswertung.entwicklungsfelder.map((dimId) => (
              <li key={dimId}>{dimTitle(dimId)}</li>
            ))}
          </ul>
          {feldMaterial.length > 0 && (
            <div className="mt-4 border-t border-sekundaer/15 pt-4 print-hidden">
              <p className="text-sm text-sekundaer">{ui.auswertung.entwicklungsfelderMaterial}</p>
              <div className="mt-3 grid gap-3">
                {feldMaterial.map((l) => (
                  <MaterialKarte key={l.id} eintrag={l} />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 print-hidden">
        <Link to={`/p/${project.id}/massnahmen`}>
          <Button>{ui.auswertung.weiterMassnahmen}</Button>
        </Link>
        <Link to={`/p/${project.id}/builder`}>
          <Button variant="secondary">{ui.auswertung.weiterBuilder}</Button>
        </Link>
      </div>
    </div>
  );
}
