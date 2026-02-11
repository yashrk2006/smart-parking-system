import type { Plugin } from 'vite';
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import { initDB } from './db.js';
import { registerRoutes } from './routes.js';

export function smartParkingServer(): Plugin {
    return {
        name: 'smart-parking-api',
        configureServer(server) {
            // Initialize database
            initDB();

            // Create Express app for API routes
            const app = express();
            app.use(express.json());

            // Register all API routes
            registerRoutes(app);

            // Mount Express as Vite middleware (runs BEFORE Vite's own middleware)
            server.middlewares.use(app);

            // Setup Socket.io on the same HTTP server
            server.httpServer?.once('listening', () => {
                const io = new SocketServer(server.httpServer!, {
                    cors: { origin: '*' },
                });

                io.on('connection', (socket) => {
                    console.log('🔌 Client connected:', socket.id);
                    socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
                    socket.on('subscribe_zones', () => socket.join('zones_room'));
                    socket.on('deploy_response_team', (data) => {
                        io.emit('team_deployed', { ...data, deployed_at: new Date(), status: 'dispatched' });
                    });
                });

                // Live data simulation (mock IoT sensors)
                const MOCK_ZONES = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6'];
                setInterval(() => {
                    const zoneId = MOCK_ZONES[Math.floor(Math.random() * MOCK_ZONES.length)];
                    io.emit('occupancy_update', {
                        zone_id: zoneId,
                        current_count: Math.floor(Math.random() * 100) + 20,
                        timestamp: new Date().toISOString(),
                    });

                    if (Math.random() > 0.7) {
                        const types = ['Overstay', 'No Parking', 'Double Parking', 'Wrong Way'];
                        io.emit('violation_detected', {
                            id: `v-live-${Date.now()}`,
                            zone_id: zoneId,
                            zone_name: 'Simulated Zone',
                            vehicle_number: `DL-${Math.floor(Math.random() * 99)}C-${Math.floor(Math.random() * 9999)}`,
                            violation_type: types[Math.floor(Math.random() * types.length)],
                            status: 'pending',
                            detected_at: new Date().toISOString(),
                        });
                    }
                }, 3000);

                console.log('⚡ Socket.io attached to Vite server');
            });

            console.log('🚀 API routes mounted on Vite dev server');
        },
    };
}
