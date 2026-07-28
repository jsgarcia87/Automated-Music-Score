import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';

export const apiRouter = Router();

// ==================== RUTAS DE HISTORIAL DE PARTITURAS ====================

// Obtener todas las partituras generadas ordenadas por fecha reciente
apiRouter.get('/scores', (_req: Request, res: Response) => {
  try {
    const scores = db.prepare('SELECT * FROM scores ORDER BY created_at DESC LIMIT 100').all();
    res.json({
      success: true,
      data: scores.map((score: any) => ({
        ...score,
        is_favorite: Boolean(score.is_favorite),
        config: JSON.parse(score.config_json),
        notes: JSON.parse(score.notes_json),
      })),
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Guardar una nueva partitura en el historial
apiRouter.post('/scores', (req: Request, res: Response) => {
  try {
    const { id, title, seed, config, notes } = req.body;
    if (!id || !title || !seed || !config || !notes) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos' });
    }

    const insert = db.prepare(`
      INSERT INTO scores (id, title, seed, config_json, notes_json, is_favorite, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `);

    const now = new Date().toISOString();
    insert.run(id, title, seed, JSON.stringify(config), JSON.stringify(notes), now);

    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error al guardar partitura:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Alternar favorito (is_favorite)
apiRouter.put('/scores/:id/favorite', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const current = db.prepare('SELECT is_favorite FROM scores WHERE id = ?').get(id) as { is_favorite: number } | undefined;
    if (!current) {
      return res.status(404).json({ success: false, error: 'Partitura no encontrada' });
    }

    const newFav = current.is_favorite === 1 ? 0 : 1;
    db.prepare('UPDATE scores SET is_favorite = ? WHERE id = ?').run(newFav, id);

    res.json({ success: true, is_favorite: Boolean(newFav) });
  } catch (error) {
    console.error('Error al actualizar favorito:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Eliminar una partitura del historial
apiRouter.delete('/scores/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM scores WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar partitura:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ==================== RUTAS DE PRESETS ====================

// Obtener todos los presets
apiRouter.get('/presets', (_req: Request, res: Response) => {
  try {
    const presets = db.prepare('SELECT * FROM presets ORDER BY is_default DESC, name ASC').all();
    res.json({
      success: true,
      data: presets.map((preset: any) => ({
        ...preset,
        is_default: Boolean(preset.is_default),
        config: JSON.parse(preset.config_json),
      })),
    });
  } catch (error) {
    console.error('Error al obtener presets:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Guardar un preset personalizado de usuario
apiRouter.post('/presets', (req: Request, res: Response) => {
  try {
    const { id, name, description, category, config } = req.body;
    if (!id || !name || !config) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros del preset' });
    }

    const insert = db.prepare(`
      INSERT INTO presets (id, name, description, category, config_json, is_default)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    insert.run(
      id,
      name,
      description || 'Preset personalizado por usuario',
      category || 'Personalizado',
      JSON.stringify(config)
    );

    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error al guardar preset:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});
