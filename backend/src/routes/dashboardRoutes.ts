import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// Get Dashboard KPIs
router.get('/kpis', async (req, res) => {
    try {
        // Composed query instead of PostgreSQL view
        const breaches = await query(`SELECT COUNT(*) as count FROM violations WHERE status = 'pending' AND date(detected_at) = date('now')`);
        const revenue = await query(`SELECT COALESCE(SUM(amount), 0) as total FROM revenue_logs WHERE date = date('now')`);
        const zones = await query(`SELECT COUNT(*) as count FROM parking_zones WHERE status = 'active'`);
        const vehicles = await query(`SELECT COALESCE(SUM(current_count), 0) as total FROM live_occupancy`);
        const health = await query(`SELECT uptime_percentage, ai_status FROM system_health ORDER BY recorded_at DESC LIMIT 1`);

        const b = breaches.rows[0] as any;
        const r = revenue.rows[0] as any;
        const z = zones.rows[0] as any;
        const v = vehicles.rows[0] as any;
        const h = health.rows[0] as any;

        const kpis = {
            active_breaches: b?.count || 0,
            revenue_today: r?.total || 0,
            active_zones: z?.count || 0,
            total_zones: z?.count || 0,
            total_vehicles: v?.total || 0,
            system_uptime: h?.uptime_percentage || 99.9,
            ai_status: h?.ai_status || 'offline',
            total_spots: 1250,
            occupied_spots: v?.total || 0,
            avg_occupancy: 67,
            system_health: 'healthy',
        };

        res.json(kpis);
    } catch (error) {
        console.error('KPI Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Live Zone Data (replaces zone_summary view)
router.get('/zones/live', async (req, res) => {
    try {
        const result = await query(`
            SELECT
                z.id,
                z.name,
                z.location_name,
                z.location_lat,
                z.location_lng,
                z.max_capacity,
                z.reserved_slots,
                z.grace_threshold,
                z.fine_per_excess,
                z.status,
                COALESCE(o.current_count, 0) as current_count,
                COALESCE(o.reserved_count, 0) as reserved_count,
                CASE
                    WHEN COALESCE(o.current_count, 0) > z.max_capacity + z.grace_threshold THEN 'over_capacity'
                    WHEN COALESCE(o.current_count, 0) > z.max_capacity * 0.9 THEN 'near_capacity'
                    ELSE 'normal'
                END as capacity_status,
                o.last_updated
            FROM parking_zones z
            LEFT JOIN live_occupancy o ON z.id = o.zone_id
            WHERE z.status = 'active'
            ORDER BY z.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Zones Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Active Violations
router.get('/violations/active', async (req, res) => {
    try {
        const result = await query(`
            SELECT v.*, z.name as zone_name
            FROM violations v
            JOIN parking_zones z ON v.zone_id = z.id
            WHERE v.status = 'pending'
            ORDER BY v.detected_at DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Violations Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
