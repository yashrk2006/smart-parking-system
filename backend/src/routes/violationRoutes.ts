import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// Get all violations
router.get('/', async (req, res) => {
    try {
        const { status, zone_id } = req.query;
        let sql = `
            SELECT v.*, z.name as zone_name
            FROM violations v
            JOIN parking_zones z ON v.zone_id = z.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (status) {
            params.push(status);
            sql += ` AND v.status = ?`;
        }

        if (zone_id) {
            params.push(zone_id);
            sql += ` AND v.zone_id = ?`;
        }

        sql += ' ORDER BY v.detected_at DESC';

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Resolve violation
router.post('/:id/resolve', async (req, res) => {
    try {
        const { notes } = req.body;
        await query(
            `UPDATE violations
             SET status = 'resolved', resolved_at = datetime('now'), notes = ?
             WHERE id = ?`,
            [notes, req.params.id]
        );

        const result = await query('SELECT * FROM violations WHERE id = ?', [req.params.id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Violation not found' });

        // Emit event
        const io = req.app.get('io');
        if (io) {
            io.emit('violation_resolved', { violation_id: req.params.id, status: 'resolved' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
