import type { DashboardKPIs, ParkingZone, Violation, User } from '../types';
import { mockAPI } from '../data/mockData';

const API_BASE = '/api';
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Helper for fetch requests with Mock Fallback
async function fetchAPI<T>(endpoint: string, mockFn?: () => Promise<T>, options?: RequestInit): Promise<T> {
    // If mock mode is forced, return mock data immediately
    if (FORCE_MOCK && mockFn) {
        console.log(`[Mock] ${endpoint}`);
        await new Promise(r => setTimeout(r, 500)); // Simulate delay
        return mockFn();
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        // Fallback to mock data on error (e.g. Vercel deployment without backend)
        if (mockFn) {
            console.warn(`API failed for ${endpoint}, falling back to mock data.`, error);
            return mockFn();
        }
        throw error;
    }
}

// Authentication
export const authAPI = {
    login: async (email: string, password: string) => {
        return fetchAPI<{ token: string; user: User }>(
            '/auth/login',
            () => mockAPI.auth.login(email),
            {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }
        );
    },

    getCurrentUser: async () => {
        return fetchAPI<User>('/users/me', mockAPI.auth.getCurrentUser);
    },
};

// Dashboard
export const dashboardAPI = {
    getKPIs: async () => {
        return fetchAPI<DashboardKPIs>('/dashboard/kpis', mockAPI.dashboard.getKPIs);
    },

    getZonesLive: async () => {
        return fetchAPI<ParkingZone[]>('/dashboard/zones/live', mockAPI.dashboard.getZonesLive);
    },

    getActiveViolations: async () => {
        return fetchAPI<Violation[]>('/dashboard/violations/active', mockAPI.dashboard.getActiveViolations);
    },
};

// Zones
export const zonesAPI = {
    getAll: async () => {
        return fetchAPI<ParkingZone[]>('/zones', mockAPI.zones.getAll);
    },

    getById: async (id: string) => {
        return fetchAPI<ParkingZone>(`/zones/${id}`, () => mockAPI.zones.getById(id));
    },

    getOccupancy: async (id: string) => {
        return fetchAPI<{ current_count: number; reserved_count: number; last_updated: string }>(
            `/zones/${id}/occupancy`,
            () => mockAPI.zones.getOccupancy(id)
        );
    },
};

// Violations
export const violationsAPI = {
    getAll: async (filters?: { status?: string; zone_id?: string }) => {
        const params = new URLSearchParams(filters as any);
        return fetchAPI<Violation[]>(`/violations?${params}`, mockAPI.violations.getAll);
    },

    resolve: async (id: string, notes?: string) => {
        return fetchAPI<Violation>(
            `/violations/${id}/resolve`,
            () => mockAPI.violations.resolve(id),
            {
                method: 'POST',
                body: JSON.stringify({ notes }),
            }
        );
    },
};

// Response Teams
export const responseAPI = {
    deploy: async (zoneId: string, violationId?: string, teamSize: number = 2) => {
        return fetchAPI(
            '/response/deploy',
            mockAPI.response.deploy,
            {
                method: 'POST',
                body: JSON.stringify({ zone_id: zoneId, violation_id: violationId, team_size: teamSize }),
            }
        );
    },
};
