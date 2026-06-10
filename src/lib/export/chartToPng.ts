// SVG→PNG-Rasterung für den DOCX-Export (Stolperfalle 12.2: docx kann kein
// SVG einbetten). Feste Pixelmaße, weißer Hintergrund — sonst transparenter
// oder abgeschnittener Export.

const SIZE = 1200;

export function svgToPng(svgMarkup: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas-Kontext nicht verfügbar.');
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        canvas.toBlob((png) => {
          if (!png) {
            reject(new Error('PNG-Erzeugung fehlgeschlagen.'));
            return;
          }
          png
            .arrayBuffer()
            .then((buf) => resolve(new Uint8Array(buf)))
            .catch(reject);
        }, 'image/png');
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG konnte nicht geladen werden.'));
    };
    img.src = url;
  });
}
