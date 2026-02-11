import express from 'express';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './server/db.js';
import { registerRoutes } from './server/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Initialize Database
initDB();

const app = express();
app.use(express.json());

// Serve Static Frontend (Vite Build)
app.use(express.static(path.resolve(__dirname, 'dist')));

// Register API Routes
registerRoutes(app);

// Handle SPA Routing (Send all non-API requests to index.html)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API Endpoint Not Found' });
    }
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Start Server with Socket.io
const server = app.listen(PORT, () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
});

const io = new SocketServer(server, {
    cors: { origin: '*' },
});

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    socket.on('subscribe_zones', () => socket.join('zones_room'));
    socket.on('deploy_response_team', (data) => {
        io.emit('team_deployed', { ...data, deployed_at: new Date(), status: 'dispatched' });
    });
});

// Live Data Simulation (Same as dev plugin)
const MOCK_ZONES = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6'];
setInterval(() => {
    const zoneId = MOCK_ZONES[Math.floor(Math.random() * MOCK_ZONES.length)];
    io.emit('occupancy_update', {
        zone_id: zoneId,
        current_count: Math.floor(Math.random() * 100) + 20,
        timestamp: new Date().toISOString(),
    });
}, 3000);
