import type { ScoreData } from '../types/index.js';
import { getVexFlowCanvasImage } from './svgToCanvas.js';

export async function exportToPng(score: ScoreData): Promise<void> {
  const container = document.getElementById('vexflow-canvas-export');
  if (!container) {
    alert('No se encontró el elemento de la partitura para exportar.');
    return;
  }

  try {
    const { dataUrl } = await getVexFlowCanvasImage(container, 2);

    const link = document.createElement('a');
    link.href = dataUrl;
    const safeTitle = score.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `${safeTitle || 'partitura'}_cadenza.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error al exportar PNG:', err);
    alert('Ocurrió un error al generar la imagen PNG con todos los símbolos musicales.');
  }
}
