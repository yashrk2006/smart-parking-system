import type { DashboardKPIs, ParkingZone, Violation, ParkingSession } from '../types';

export const MOCK_KPI_DATA: DashboardKPIs = {
    total_zones: 6,
    total_spots: 1250,
    occupied_spots: 840,
    avg_occupancy: 67,
    active_breaches: 5,
    ai_status: 'online',
    system_health: 'healthy',
    active_zones: 6,
    revenue_today: 45000,
    total_vehicles: 840,
    system_uptime: 99.9,
};

export const MOCK_ZONES_DATA: ParkingZone[] = [
    { id: 'z1', name: 'Connaught Place', max_capacity: 150, current_count: 120, status: 'active', capacity_status: 'over_capacity', location_name: 'Central', location_lat: 28.6328, location_lng: 77.2197, reserved_slots: 5, grace_threshold: 10, fine_per_excess: 500 },
    { id: 'z2', name: 'Khan Market', max_capacity: 80, current_count: 75, status: 'active', capacity_status: 'near_capacity', location_name: 'South', location_lat: 28.6001, location_lng: 77.2270, reserved_slots: 2, grace_threshold: 5, fine_per_excess: 1000 },
    { id: 'z3', name: 'Lajpat Nagar', max_capacity: 200, current_count: 110, status: 'active', capacity_status: 'normal', location_name: 'South East', location_lat: 28.5677, location_lng: 77.2433, reserved_slots: 10, grace_threshold: 15, fine_per_excess: 300 },
    { id: 'z4', name: 'Karol Bagh', max_capacity: 120, current_count: 95, status: 'active', capacity_status: 'near_capacity', location_name: 'West', location_lat: 28.6441, location_lng: 77.1884, reserved_slots: 0, grace_threshold: 0, fine_per_excess: 0 },
    { id: 'z5', name: 'Chandni Chowk', max_capacity: 300, current_count: 280, status: 'active', capacity_status: 'over_capacity', location_name: 'North', location_lat: 28.6562, location_lng: 77.2300, reserved_slots: 0, grace_threshold: 0, fine_per_excess: 0 },
    { id: 'z6', name: 'Saket', max_capacity: 400, current_count: 150, status: 'active', capacity_status: 'normal', location_name: 'South', location_lat: 28.5285, location_lng: 77.2218, reserved_slots: 0, grace_threshold: 0, fine_per_excess: 0 },
];

export const MOCK_VIOLATIONS_DATA: Violation[] = [
    { id: 'v1', zone_id: 'z2', zone_name: 'Khan Market', vehicle_number: 'DL-3C-AB-1234', violation_type: 'Overstay', status: 'pending', severity: 'medium', excess_count: 1, fine_amount: 500, detected_at: new Date().toISOString() },
    { id: 'v2', zone_id: 'z1', zone_name: 'Connaught Place', vehicle_number: 'UP-16-Z-1002', violation_type: 'No Parking', status: 'pending', severity: 'high', excess_count: 0, fine_amount: 1000, detected_at: new Date(Date.now() - 900000).toISOString() },
];

export const MOCK_USER_HISTORY: ParkingSession[] = [
    { id: 's1', zone_id: 'z1', zone_name: 'Connaught Place', vehicle_number: 'DL-3C-AB-1234', start_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), cost: 45, status: 'active' },
    { id: 's2', zone_id: 'z3', zone_name: 'Lajpat Nagar', vehicle_number: 'DL-3C-AB-1234', start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), end_time: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), cost: 120, status: 'completed' },
    { id: 's3', zone_id: 'z2', zone_name: 'Khan Market', vehicle_number: 'DL-3C-AB-1234', start_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), end_time: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(), cost: 80, status: 'completed' },
];
