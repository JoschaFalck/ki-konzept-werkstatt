import { Link, useParams } from 'react-router-dom';
import { ui } from '../../../content/ui-strings';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { dimensionProgress } from '../../lib/auswertung';
import { diagnoseContent, DIM_CHIP_CLASSES } from '../../lib/content';
import { useAppStore } from '../../store';

export function DiagnoseUebersicht() {
  const { id } = useParams<{ id: string }>();
  const project = useAppStore((s) => (id ? s.projects[id] : undefined));

  if (!project) return <p className="text-sekundaer">{ui.app.laden}</p>;

  const anyComplete = diagnoseContent.dimensions.some((d) => {
    const { done, total } = dimensionProgress(d, project);
    return total > 0 && done === total;
  });
  const allComplete = diagnoseContent.dimensions.every((d) => {
    const { done, total } = dimensionProgress(d, project);
    return total > 0 && done === total;
  });

  return (
    <div className="space-y-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-semibold">{ui.diagnose.titel}</h1>
        <p className="mt-2 text-sekundaer">{ui.diagnose.intro}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {anyComplete ? (
          <Link to={`/p/${project.id}/diagnose/auswertung`}>
            <Button>
              {allComplete ? ui.diagnose.auswertungAnzeigen : ui.diagnose.auswertungTeilweise}
            </Button>
          </Link>
        ) : (
          <Button disabled title={ui.diagnose.auswertungGesperrt}>
            {ui.diagnose.auswertungAnzeigen}
          </Button>
        )}
        <Link to={`/p/${project.id}/diagnose/workshop`}>
          <Button variant="secondary">{ui.diagnose.workshopStarten}</Button>
        </Link>
      </div>
      {!anyComplete && <p className="text-sm text-sekundaer">{ui.diagnose.auswertungGesperrt}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {diagnoseContent.dimensions.map((dim) => {
          const { done, total } = dimensionProgress(dim, project);
          return (
            <Link key={dim.id} to={`/p/${project.id}/diagnose/${dim.id}`} className="group">
              <Card className="h-full transition-colors group-hover:ring-1 group-hover:ring-primaer">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`h-3 w-3 rounded-full ${DIM_CHIP_CLASSES[dim.id]}`}
                  />
                  <h2 className="font-semibold">{dim.title}</h2>
                </div>
                <p className="mt-1 text-sm text-sekundaer">{dim.leitfrage}</p>
                <div className="mt-4 space-y-1">
                  <ProgressBar
                    value={done}
                    max={total}
                    label={`${dim.title}: ${done} von ${total}`}
                  />
                  <p className="text-xs text-sekundaer">
                    {done} {ui.diagnose.itemsBearbeitet} {total} {ui.diagnose.itemsEinheit}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
