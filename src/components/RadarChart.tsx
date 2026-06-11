import { radarSvg, type RadarDatum } from '../lib/radarSvg';
import { ui } from '../../content/ui-strings';

interface RadarChartProps {
  data: RadarDatum[];
}

export function RadarChart({ data }: RadarChartProps) {
  const werte = data
    .map(
      (d) =>
        `${d.title}: ${d.mean === null ? ui.auswertung.nichtVollstaendig : d.mean.toFixed(2).replace('.', ',')}`,
    )
    .join('; ');
  return (
    <div
      role="img"
      aria-label={ui.auswertung.radarLabel.replace('{werte}', werte)}
      className="radar-animiert mx-auto w-full max-w-xl [&_svg]:h-auto [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: radarSvg(data) }}
    />
  );
}
