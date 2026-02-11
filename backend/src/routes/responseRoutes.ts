import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// Deploy response team
router.post('/deploy', async (req, res) => {
    try {
        const { zone_id, violation_id, team_size } = req.body;
        const id = `dep-${Date.now()}`;

        await query(
            `INSERT INTO response_deployments (id, zone_id, violation_id, deployed_by, team_size, status)
             VALUES (?, ?, ?, 'u1', ?, 'dispatched')`,
            [id, zone_id, violation_id, team_size || 2]
        );

        const result = await query('SELECT * FROM response_deployments WHERE id = ?', [id]);
        const deployment = result.rows[0] as any;

        // Get zone name for WebSocket event
        const zoneResult = await query('SELECT name FROM parking_zones WHERE id = ?', [zone_id]);
        const zone = zoneResult.rows[0] as any;

        // Emit event
        const io = req.app.get('io');
        if (io) {
            io.emit('team_deployed', {
                ...deployment,
                zone_name: zone?.name || 'Unknown'
            });
        }

        res.json(deployment);
    } catch (error) {
        console.error('Deploy error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all deployments
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT d.*, z.name as zone_name
            FROM response_deployments d
            LEFT JOIN parking_zones z ON d.zone_id = z.id
            ORDER BY d.deployed_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
