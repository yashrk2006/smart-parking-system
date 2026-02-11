import { useState, useEffect } from 'react';
import { Shield, MapPin, Truck, Bike, Clock, CheckCircle, AlertTriangle, User, Navigation, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Violation, ParkingZone, ResponseDeployment } from '../types';

interface ResponseTeamProps {
    violations: Violation[];
    zones: ParkingZone[];
}

export default function ResponseTeam({ violations, zones }: ResponseTeamProps) {
    const [deployments, setDeployments] = useState<ResponseDeployment[]>([]);

    // Mock Data for Demo if API fails
    const MOCK_DEPLOYMENTS: ResponseDeployment[] = [
        { id: 'd1', zone_id: 'z1', deployed_by: 'Admin', team_size: 2, status: 'arrived', deployed_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { id: 'd2', zone_id: 'z3', deployed_by: 'Auto-Dispatch', team_size: 1, status: 'dispatched', deployed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() }
    ];

    useEffect(() => {
        loadDeployments();
    }, []);

    const loadDeployments = async () => {
        // Mock Data since API methods don't exist yet
        setDeployments(MOCK_DEPLOYMENTS);
    };

    const handleDispatch = async (violation: Violation) => {
        const newDeployment: ResponseDeployment = {
            id: `temp-${Date.now()}`,
            zone_id: violation.zone_id,
            deployed_by: 'Admin Command',
            team_size: 2,
            status: 'dispatched',
            deployed_at: new Date().toISOString()
        };

        // Optimistic UI Update
        setDeployments(prev => [newDeployment, ...prev]);

        // Simulate API call success
        setTimeout(() => toast.success(`Team dispatched to ${violation.vehicle_number}`), 500);
    };

    const updateStatus = async (id: string, status: string) => {
        setDeployments(prev => prev.map(d => d.id === id ? { ...d, status: status as any } : d));
    };

    const getZoneName = (id: string) => zones.find(z => z.id === id)?.name || 'Unknown Zone';

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Shield} label="Total Units" value="12" sub="Active Shift" color="text-blue-400" />
                <StatCard icon={Bike} label="Bike Squads" value="8" sub="Rapid Response" color="text-emerald-400" />
                <StatCard icon={Truck} label="Tow Trucks" value="4" sub="Heavy Duty" color="text-amber-400" />
                <StatCard icon={CheckCircle} label="Available" value="5" sub="Ready to Deploy" color="text-gray-300" />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Active Violations (Dispatch Source) */}
                <div className="col-span-1 bg-tactical-card border border-tactical-border rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-tactical-border bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            Active Violations
                        </h3>
                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{violations.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                        {violations.map(v => (
                            <div key={v.id} className="bg-slate-900 border border-tactical-border rounded-lg p-3 hover:border-red-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{getZoneName(v.zone_id)}</span>
                                    <span className="text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">{v.violation_type}</span>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-500">
                                        <CarIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-mono text-sm">{v.vehicle_number}</p>
                                        <p className="text-xs text-gray-500">{new Date(v.detected_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDispatch(v)}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Shield size={14} /> Dispatch Team
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Deployments (Tracking) */}
                <div className="col-span-2 bg-tactical-card border border-tactical-border rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-tactical-border bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Truck size={18} className="text-blue-500" />
                            Live Deployments
                        </h3>
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{deployments.filter(d => d.status !== 'resolved').length} Active</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                        {deployments.filter(d => d.status !== 'resolved').map(d => (
                            <div key={d.id} className="bg-slate-900 border border-tactical-border rounded-xl p-4 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${getStatusColor(d.status)}`}>
                                    {d.status === 'dispatched' && <Bike size={20} />}
                                    {d.status === 'arrived' && <MapPin size={20} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-white">{getZoneName(d.zone_id)}</span>
                                        <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${getStatusBadge(d.status)}`}>{d.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><User size={12} /> Team Size: {d.team_size}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {getTimeSince(d.deployed_at)} ago</span>
                                        <span>By: {d.deployed_by}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-tactical-border">
                                    {d.status === 'dispatched' && (
                                        <button
                                            onClick={() => updateStatus(d.id, 'arrived')}
                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Navigation size={14} />
                                            Active Deploy
                                        </button>
                                    )}
                                    <button className="px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg border border-tactical-border transition-colors">
                                        <Phone size={14} />
                                    </button>
                                    <button
                                        onClick={() => updateStatus(d.id, 'resolved')}
                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-200 text-xs font-bold rounded transition-colors"
                                    >
                                        Resolve
                                    </button>
                                </div>
                            </div>
                        ))}
                        {deployments.filter(d => d.status !== 'resolved').length === 0 && (
                            <div className="text-center text-gray-500 py-10 italic">
                                No active teams deployed. Systems nominal.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className="bg-tactical-card border border-tactical-border rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-900 ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-white leading-none">{value}</p>
                <p className="text-[10px] text-gray-500 mt-1">{sub}</p>
            </div>
        </div>
    );
}

const CarIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M14 17h2" />
    </svg>
);

function getStatusColor(status: string) {
    switch (status) {
        case 'dispatched': return 'border-amber-500 text-amber-500 bg-amber-500/10';
        case 'arrived': return 'border-emerald-500 text-emerald-500 bg-emerald-500/10';
        default: return 'border-gray-500';
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'dispatched': return 'bg-amber-500/20 text-amber-500';
        case 'arrived': return 'bg-emerald-500/20 text-emerald-500';
        default: return 'bg-gray-700 text-gray-300';
    }
}

function getTimeSince(dateString: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
}
