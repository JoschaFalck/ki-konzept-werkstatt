// Handgerolltes Radar-SVG (Spezifikation Abschnitt 1: keine Chart-Bibliothek).
// Als pure String-Funktion, damit dieselbe Grafik im UI angezeigt und für den
// DOCX-Export gerastert werden kann (chartToPng.ts).

export interface RadarDatum {
  id: string;
  title: string;
  mean: number | null; // null = Dimension unvollständig
}

const SIZE = 880;
const CENTER = SIZE / 2;
const RADIUS = 235;
const MAX = 3;

function point(index: number, total: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (value / MAX) * RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function wrapTitle(title: string, maxLen = 16): string[] {
  const words = title.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current && (current + ' ' + word).length > maxLen) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function radarSvg(data: RadarDatum[]): string {
  const n = data.length;
  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">`,
    `<rect width="${SIZE}" height="${SIZE}" fill="#FFFFFF"/>`,
  );

  // Gitterringe für Stufen 1–3
  for (let ring = 1; ring <= MAX; ring++) {
    const ringPoints = data
      .map((_, i) =>
        point(i, n, ring)
          .map((v) => v.toFixed(1))
          .join(','),
      )
      .join(' ');
    parts.push(`<polygon points="${ringPoints}" fill="none" stroke="#D5D9DD" stroke-width="1.5"/>`);
    const [, ly] = point(0, n, ring);
    parts.push(
      `<text x="${CENTER + 8}" y="${(ly - 4).toFixed(1)}" font-size="18" fill="#52606D" font-family="system-ui, sans-serif">${ring}</text>`,
    );
  }

  // Achsen und Beschriftungen
  data.forEach((d, i) => {
    const [x, y] = point(i, n, MAX);
    parts.push(
      `<line x1="${CENTER}" y1="${CENTER}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#D5D9DD" stroke-width="1.5"/>`,
    );
    const [lx, ly] = point(i, n, MAX + 0.55);
    const anchor = Math.abs(lx - CENTER) < 20 ? 'middle' : lx > CENTER ? 'start' : 'end';
    const lines = wrapTitle(d.title);
    const color = d.mean === null ? '#9AA2A9' : '#1F2933';
    const startY = ly - ((lines.length - 1) * 20) / 2;
    lines.forEach((line, li) => {
      parts.push(
        `<text x="${lx.toFixed(1)}" y="${(startY + li * 20).toFixed(1)}" font-size="19" font-weight="600" fill="${color}" text-anchor="${anchor}" font-family="system-ui, sans-serif">${escapeXml(line)}</text>`,
      );
    });
    if (d.mean !== null) {
      parts.push(
        `<text x="${lx.toFixed(1)}" y="${(startY + lines.length * 20).toFixed(1)}" font-size="17" fill="#52606D" text-anchor="${anchor}" font-family="system-ui, sans-serif">${d.mean.toFixed(2).replace('.', ',')}</text>`,
      );
    }
  });

  // Wertepolygon über vollständige Dimensionen
  const valuePoints = data
    .map((d, i) => (d.mean === null ? null : point(i, n, d.mean)))
    .filter((p): p is [number, number] => p !== null);
  if (valuePoints.length >= 3) {
    const pts = valuePoints.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
    parts.push(
      `<polygon points="${pts}" fill="#0F6B6B" fill-opacity="0.18" stroke="#0F6B6B" stroke-width="3"/>`,
    );
  }
  for (const [x, y] of valuePoints) {
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#0F6B6B"/>`);
  }

  parts.push('</svg>');
  return parts.join('');
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
