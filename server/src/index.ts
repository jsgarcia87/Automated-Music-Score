import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Montar rutas de API
app.use('/api', apiRouter);

// Ruta de comprobación de salud (Health check)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cadenza-studio-server', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎶 Cadenza Studio Server API escuchando en http://localhost:${PORT}`);
});
