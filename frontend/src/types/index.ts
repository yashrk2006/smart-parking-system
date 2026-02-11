// Core Types
export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'officer' | 'contractor' | 'user';
    department?: string;
}

export interface ParkingZone {
    id: string;
    name: string;
    location_name: string;
    location_lat: number;
    location_lng: number;
    max_capacity: number;
    reserved_slots: number;
    contractor_id?: string;
    grace_threshold: number;
    status: 'active' | 'locked' | 'maintenance';
    fine_per_excess: number;
    current_count?: number;
    reserved_count?: number;
    capacity_status?: 'normal' | 'near_capacity' | 'over_capacity';
    last_updated?: string;
}

export interface Violation {
    id: string;
    zone_id: string;
    zone_name?: string;
    vehicle_number?: string; // Added
    violation_type?: string; // Added
    excess_count: number;
    fine_amount: number;
    status: 'pending' | 'resolved' | 'cancelled';
    challan_number?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detected_at: string;
    resolved_at?: string;
}

export interface DashboardKPIs {
    total_zones?: number; // Added
    total_spots?: number; // Added
    occupied_spots?: number; // Added
    avg_occupancy?: number; // Added
    active_breaches: number;
    revenue_today: number;
    active_zones: number;
    total_vehicles: number;
    system_uptime: number;
    ai_status: 'online' | 'offline' | 'degraded';
    system_health?: 'healthy' | 'degraded' | 'critical'; // Added
    enforcement_efficiency?: number;
    efficiency?: number; // Added
}

export interface VehicleEvent {
    id: string;
    zone_id: string;
    event_type: 'vehicle_in' | 'vehicle_out';
    camera_id: string;
    confidence_score: number;
    detected_at: string;
}

export interface ResponseDeployment {
    id: string;
    zone_id: string;
    violation_id?: string;
    deployed_by: string;
    team_size: number;
    status: 'dispatched' | 'arrived' | 'resolved' | 'cancelled';
    deployed_at: string;
    arrived_at?: string;
    resolved_at?: string;
}

// WebSocket event types
export interface WSEvents {
    occupancy_update: {
        zone_id: string;
        current_count: number;
        reserved_count: number;
        timestamp: string;
    };
    violation_detected: Violation & { zone_name: string };
    violation_resolved: { violation_id: string; zone_id: string };
    ai_status_change: { status: 'online' | 'offline' | 'degraded'; timestamp: string };
    system_alert: { level: 'info' | 'warning' | 'critical'; message: string; timestamp: string };
}

export interface ParkingSession {
    id: string;
    zone_id: string;
    zone_name: string;
    vehicle_number: string;
    start_time: string;
    end_time?: string;
    cost: number;
    status: 'active' | 'completed';
}
