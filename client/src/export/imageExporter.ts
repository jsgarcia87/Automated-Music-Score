import html2canvas from 'html2canvas';
import type { ScoreData } from '../types/index.js';

export async function exportToPng(score: ScoreData): Promise<void> {
  const container = document.getElementById('vexflow-canvas-export');
  if (!container) {
    alert('No se encontró el elemento de la partitura para exportar.');
    return;
  }

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#fcfbf7',
      scale: 2, // 2x alta resolución
      logging: false,
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    const safeTitle = score.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `${safeTitle || 'partitura'}_cadenza.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error al exportar PNG:', err);
    alert('Ocurrió un error al generar la imagen PNG.');
  }
}
