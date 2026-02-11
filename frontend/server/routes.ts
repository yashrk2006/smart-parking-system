import type { Express } from 'express';
import { query } from './db.js';

export function registerRoutes(app: Express) {
    // =================== AUTH ===================
    app.post('/api/auth/login', (req, res) => {
        const { email } = req.body;

        if (email === 'admin' || email === 'admin@mcd.gov.in') {
            return res.json({ token: 'token-admin', user: { id: 'u1', username: 'Administrator', email: 'admin@mcd.gov.in', role: 'admin', department: 'IT' } });
        }
        if (email === 'officer' || email === 'officer@mcd.gov.in') {
            return res.json({ token: 'token-officer', user: { id: 'u2', username: 'Rajesh Kumar', email: 'officer@mcd.gov.in', role: 'officer', department: 'Enforcement' } });
        }
        if (email === 'vendor' || email === 'contractor' || email === 'vendor@mcd.gov.in') {
            return res.json({ token: 'token-vendor', user: { id: 'u3', username: 'SecurePark Ltd', email: 'vendor@mcd.gov.in', role: 'contractor', department: 'Operations' } });
        }

        // DB lookup or demo fallback
        const result = query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const u = result.rows[0] as any;
            return res.json({ token: `token-${u.id}`, user: { id: u.id, username: u.username, email: u.email, role: u.role, department: u.department } });
        }
        // Allow any credentials for demo
        res.json({ token: 'token-demo', user: { id: 'demo-1', username: email.split('@')[0] || 'Demo', email, role: 'admin', department: 'Demo' } });
    });

    app.get('/api/auth/me', (_req, res) => {
        res.json({ id: 'u1', username: 'admin', email: 'admin@mcd.gov.in', role: 'admin', department: 'IT' });
    });

    // =================== DASHBOARD ===================
    app.get('/api/dashboard/kpis', (_req, res) => {
        try {
            const b = (query(`SELECT COUNT(*) as count FROM violations WHERE status = 'pending' AND date(detected_at) = date('now')`).rows[0] as any);
            const r = (query(`SELECT COALESCE(SUM(amount), 0) as total FROM revenue_logs WHERE date = date('now')`).rows[0] as any);
            const z = (query(`SELECT COUNT(*) as count FROM parking_zones WHERE status = 'active'`).rows[0] as any);
            const v = (query(`SELECT COALESCE(SUM(current_count), 0) as total FROM live_occupancy`).rows[0] as any);
            const h = (query(`SELECT uptime_percentage, ai_status FROM system_health ORDER BY recorded_at DESC LIMIT 1`).rows[0] as any);

            res.json({
                active_breaches: b?.count || 0,
                revenue_today: r?.total || 0,
                active_zones: z?.count || 0,
                total_zones: z?.count || 0,
                total_vehicles: v?.total || 0,
                total_spots: 1250,
                occupied_spots: v?.total || 0,
                avg_occupancy: 67,
                system_uptime: h?.uptime_percentage || 99.9,
                ai_status: h?.ai_status || 'offline',
                system_health: 'healthy',
            });
        } catch (error) {
            console.error('KPI Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    app.get('/api/dashboard/zones/live', (_req, res) => {
        try {
            const result = query(`
                SELECT z.*, COALESCE(o.current_count, 0) as current_count,
                    COALESCE(o.reserved_count, 0) as reserved_count, o.last_updated
                FROM parking_zones z
                LEFT JOIN live_occupancy o ON z.id = o.zone_id
                WHERE z.status = 'active' ORDER BY z.name
            `);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    app.get('/api/dashboard/violations/active', (_req, res) => {
        try {
            const result = query(`
                SELECT v.*, z.name as zone_name FROM violations v
                JOIN parking_zones z ON v.zone_id = z.id
                WHERE v.status = 'pending' ORDER BY v.detected_at DESC LIMIT 10
            `);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // =================== ZONES ===================
    app.get('/api/zones', (_req, res) => {
        res.json(query('SELECT * FROM parking_zones ORDER BY name').rows);
    });

    app.get('/api/zones/:id', (req, res) => {
        const result = query('SELECT * FROM parking_zones WHERE id = ?', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Zone not found' });
        res.json(result.rows[0]);
    });

    app.get('/api/zones/:id/occupancy', (req, res) => {
        const result = query('SELECT * FROM live_occupancy WHERE zone_id = ?', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    });

    app.post('/api/zones', (req, res) => {
        const { name, location_name, location_lat, location_lng, max_capacity, reserved_slots, grace_threshold, fine_per_excess } = req.body;
        const id = `z${Date.now()}`;
        query('INSERT INTO parking_zones (id, name, location_name, location_lat, location_lng, max_capacity, reserved_slots, grace_threshold, fine_per_excess) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, location_name, location_lat, location_lng, max_capacity, reserved_slots || 0, grace_threshold || 0, fine_per_excess || 500]);
        query('INSERT INTO live_occupancy (id, zone_id, current_count) VALUES (?, ?, 0)', [`occ-${id}`, id]);
        res.json(query('SELECT * FROM parking_zones WHERE id = ?', [id]).rows[0]);
    });

    // =================== VIOLATIONS ===================
    app.get('/api/violations', (req, res) => {
        const { status, zone_id } = req.query;
        let sql = 'SELECT v.*, z.name as zone_name FROM violations v JOIN parking_zones z ON v.zone_id = z.id WHERE 1=1';
        const params: any[] = [];
        if (status) { params.push(status); sql += ' AND v.status = ?'; }
        if (zone_id) { params.push(zone_id); sql += ' AND v.zone_id = ?'; }
        sql += ' ORDER BY v.detected_at DESC';
        res.json(query(sql, params).rows);
    });

    app.post('/api/violations/:id/resolve', (req, res) => {
        const { notes } = req.body;
        query(`UPDATE violations SET status = 'resolved', resolved_at = datetime('now'), notes = ? WHERE id = ?`, [notes, req.params.id]);
        const result = query('SELECT * FROM violations WHERE id = ?', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    });

    // =================== RESPONSE TEAMS ===================
    app.post('/api/response/deploy', (req, res) => {
        const { zone_id, violation_id, team_size } = req.body;
        const id = `dep-${Date.now()}`;
        query(`INSERT INTO response_deployments (id, zone_id, violation_id, deployed_by, team_size, status) VALUES (?, ?, ?, 'u1', ?, 'dispatched')`,
            [id, zone_id, violation_id, team_size || 2]);
        const result = query('SELECT * FROM response_deployments WHERE id = ?', [id]);
        res.json(result.rows[0]);
    });

    app.get('/api/deployments', (_req, res) => {
        res.json(query('SELECT d.*, z.name as zone_name FROM response_deployments d LEFT JOIN parking_zones z ON d.zone_id = z.id ORDER BY d.deployed_at DESC').rows);
    });

    // =================== HEALTH ===================
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });
}
