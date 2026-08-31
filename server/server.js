import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database.js';
import { initWebSocketServer } from './services/websocketService.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database & WebSockets
await initDatabase();
initWebSocketServer(server);

// API Routes
app.use('/api', apiRouter);

// Serve static frontend files if client is built
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Fallback for Single-Page Application (SPA) routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff;">
            <h1>🍽️ QRMate Server Running</h1>
            <p>API is active on <a href="/api/settings" style="color: #f97316;">/api/settings</a></p>
            <p>To view the React UI, run <code>npm run dev</code> inside the <code>client</code> folder or build the client.</p>
          </body>
        </html>
      `);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 QRMate Restaurant & Cafe System Server is LIVE!`);
  console.log(`📍 Local URL:    http://localhost:${PORT}`);
  console.log(`🌐 Network URL:  http://0.0.0.0:${PORT}`);
  console.log(`⚡ WebSockets:   ws://0.0.0.0:${PORT}/ws`);
  console.log(`======================================================\n`);
});
