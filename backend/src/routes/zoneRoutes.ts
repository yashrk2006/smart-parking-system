import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// Get all zones
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM parking_zones ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific zone
router.get('/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM parking_zones WHERE id = ?', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Zone not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get occupancy
router.get('/:id/occupancy', async (req, res) => {
    try {
        const result = await query('SELECT * FROM live_occupancy WHERE zone_id = ?', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Occupancy data not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create zone
router.post('/', async (req, res) => {
    try {
        const { name, location_name, location_lat, location_lng, max_capacity, reserved_slots, grace_threshold, fine_per_excess } = req.body;
        const id = `z${Date.now()}`;

        await query(
            `INSERT INTO parking_zones (id, name, location_name, location_lat, location_lng, max_capacity, reserved_slots, grace_threshold, fine_per_excess)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, location_name, location_lat, location_lng, max_capacity, reserved_slots || 0, grace_threshold || 0, fine_per_excess || 500]
        );

        // Also create occupancy entry
        await query(
            'INSERT INTO live_occupancy (id, zone_id, current_count) VALUES (?, ?, 0)',
            [`occ-${id}`, id]
        );

        const result = await query('SELECT * FROM parking_zones WHERE id = ?', [id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Create zone error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
