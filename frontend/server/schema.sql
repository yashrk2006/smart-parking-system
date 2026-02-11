CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'officer', 'contractor', 'user')),
    department TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parking_zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location_name TEXT,
    location_lat REAL,
    location_lng REAL,
    max_capacity INTEGER NOT NULL,
    reserved_slots INTEGER DEFAULT 0,
    contractor_id TEXT REFERENCES users(id),
    grace_threshold INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'locked', 'maintenance')),
    fine_per_excess INTEGER DEFAULT 500,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS live_occupancy (
    id TEXT PRIMARY KEY,
    zone_id TEXT UNIQUE REFERENCES parking_zones(id) ON DELETE CASCADE,
    current_count INTEGER DEFAULT 0,
    reserved_count INTEGER DEFAULT 0,
    last_vehicle_in TEXT,
    last_vehicle_out TEXT,
    last_updated TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS violations (
    id TEXT PRIMARY KEY,
    zone_id TEXT REFERENCES parking_zones(id),
    vehicle_number TEXT,
    violation_type TEXT,
    excess_count INTEGER NOT NULL DEFAULT 0,
    fine_amount REAL NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'cancelled', 'escalated')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    detected_at TEXT DEFAULT (datetime('now')),
    resolved_at TEXT,
    resolved_by TEXT REFERENCES users(id),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS revenue_logs (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    zone_id TEXT REFERENCES parking_zones(id),
    amount REAL NOT NULL,
    source TEXT DEFAULT 'violation',
    transaction_ref TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS system_health (
    id TEXT PRIMARY KEY,
    uptime_percentage REAL DEFAULT 99.9,
    ai_status TEXT DEFAULT 'online' CHECK (ai_status IN ('online', 'offline', 'degraded')),
    total_zones_active INTEGER DEFAULT 0,
    total_violations_today INTEGER DEFAULT 0,
    last_sync TEXT DEFAULT (datetime('now')),
    recorded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS response_deployments (
    id TEXT PRIMARY KEY,
    zone_id TEXT REFERENCES parking_zones(id),
    violation_id TEXT REFERENCES violations(id),
    deployed_by TEXT,
    team_size INTEGER DEFAULT 1,
    status TEXT DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'arrived', 'resolved', 'cancelled')),
    deployed_at TEXT DEFAULT (datetime('now')),
    arrived_at TEXT,
    resolved_at TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_violations_zone_status ON violations(zone_id, status);
CREATE INDEX IF NOT EXISTS idx_occupancy_zone ON live_occupancy(zone_id);
