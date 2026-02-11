INSERT OR IGNORE INTO users (id, username, email, password_hash, role, department) VALUES
('u1', 'Administrator', 'admin@mcd.gov.in', '$2b$10$placeholder', 'admin', 'IT'),
('u2', 'Rajesh Kumar', 'officer@mcd.gov.in', '$2b$10$placeholder', 'officer', 'Enforcement'),
('u3', 'SecurePark Ltd', 'vendor@mcd.gov.in', '$2b$10$placeholder', 'contractor', 'Operations');

INSERT OR IGNORE INTO parking_zones (id, name, location_name, location_lat, location_lng, max_capacity, reserved_slots, grace_threshold, fine_per_excess, status) VALUES
('z1', 'Connaught Place', 'Central', 28.6328, 77.2197, 150, 5, 10, 500, 'active'),
('z2', 'Khan Market', 'South', 28.6001, 77.2270, 80, 2, 5, 1000, 'active'),
('z3', 'Lajpat Nagar', 'South East', 28.5677, 77.2433, 200, 10, 15, 300, 'active'),
('z4', 'Karol Bagh', 'West', 28.6441, 77.1884, 120, 0, 0, 0, 'active'),
('z5', 'Chandni Chowk', 'North', 28.6562, 77.2300, 300, 0, 0, 0, 'active'),
('z6', 'Saket', 'South', 28.5285, 77.2218, 400, 0, 0, 0, 'active');

INSERT OR IGNORE INTO live_occupancy (id, zone_id, current_count, reserved_count, last_updated) VALUES
('occ1', 'z1', 120, 3, datetime('now')),
('occ2', 'z2', 75, 1, datetime('now')),
('occ3', 'z3', 110, 5, datetime('now')),
('occ4', 'z4', 95, 0, datetime('now')),
('occ5', 'z5', 280, 0, datetime('now')),
('occ6', 'z6', 150, 0, datetime('now'));

INSERT OR IGNORE INTO violations (id, zone_id, vehicle_number, violation_type, excess_count, fine_amount, status, severity, detected_at) VALUES
('v1', 'z2', 'DL-3C-AB-1234', 'Overstay', 1, 500, 'pending', 'medium', datetime('now', '-15 minutes')),
('v2', 'z1', 'UP-16-Z-1002', 'No Parking', 0, 1000, 'pending', 'high', datetime('now', '-30 minutes')),
('v3', 'z5', 'DL-8S-CD-5678', 'Double Parking', 3, 1500, 'pending', 'critical', datetime('now', '-1 hour')),
('v4', 'z1', 'HR-26-L-9912', 'Overstay', 2, 1000, 'resolved', 'medium', datetime('now', '-3 hours')),
('v5', 'z3', 'DL-1R-EF-3344', 'Wrong Way', 0, 2000, 'pending', 'high', datetime('now', '-45 minutes'));

INSERT OR IGNORE INTO revenue_logs (id, date, zone_id, amount, source) VALUES
('r1', date('now'), 'z1', 15000, 'violation'),
('r2', date('now'), 'z2', 12000, 'violation'),
('r3', date('now'), 'z3', 8000, 'violation'),
('r4', date('now'), 'z5', 10200, 'violation');

INSERT OR IGNORE INTO system_health (id, uptime_percentage, ai_status, total_zones_active, total_violations_today) VALUES
('sh1', 99.9, 'online', 6, 5);

INSERT OR IGNORE INTO response_deployments (id, zone_id, violation_id, deployed_by, team_size, status, deployed_at) VALUES
('d1', 'z1', 'v2', 'u1', 2, 'arrived', datetime('now', '-20 minutes')),
('d2', 'z5', 'v3', 'u1', 3, 'dispatched', datetime('now', '-10 minutes'));
