// server.ts - Main Express server application
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { PORT } from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS and JSON parsing for incoming API requests.
app.use(cors());
app.use(express.json());

// Serve compiled frontend assets.
app.use(express.static(path.join(__dirname, '../../dist/frontend')));

// Register all API route groups under a common prefix.
app.use('/api', apiRoutes);

// Keep unknown API paths as JSON errors instead of SPA HTML fallback.
app.use('/api/*', (_req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});