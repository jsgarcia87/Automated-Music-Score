"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_js_1 = require("./routes/api.js");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Montar rutas de API
app.use('/api', api_js_1.apiRouter);
// Ruta de comprobación de salud (Health check)
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'cadenza-studio-server', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🎶 Cadenza Studio Server API escuchando en http://localhost:${PORT}`);
});
