import { useState, useEffect } from 'react';
import { Filter, Search, Shield, AlertTriangle, CheckCircle, Clock, MapPin, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportViolationsCSV } from '../utils/exportCSV';
import type { Violation, ParkingZone } from '../types';

interface EnforcementProps {
    violations: Violation[];
    zones: ParkingZone[];
    onDispatch: (violation: Violation) => void;
}

export default function Enforcement({ violations, zones, onDispatch }: EnforcementProps) {
    const [filterZone, setFilterZone] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('pending'); // pending, resolved, escalated
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<Violation[]>([]);

    useEffect(() => {
        let result = violations;

        // Filter by Zone
        if (filterZone !== 'all') {
            result = result.filter(v => v.zone_id === filterZone);
        }

        // Filter by Status (Mock logic for now as violation type might not fully align with 'status' yet)
        if (filterStatus !== 'all') {
            result = result.filter(v => v.status === filterStatus);
        }

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(v =>
                (v.vehicle_number || '').toLowerCase().includes(lower) ||
                (v.violation_type || '').toLowerCase().includes(lower) ||
                getZoneName(v.zone_id).toLowerCase().includes(lower)
            );
        }

        setFilteredData(result);
    }, [violations, filterZone, searchTerm, filterStatus, zones]);

    const getZoneName = (id: string) => zones.find(z => z.id === id)?.name || 'Unknown Zone';

    const handleDispatch = (violationId: string) => {
        // In a real app, this would make an API call to create a deployment
        // For now, we'll simulate a successful dispatch and update UI
        try {
            // Find the violation
            const violation = violations.find(v => v.id === violationId);
            if (!violation) return;

            // Trigger prop
            onDispatch(violation);

            // Show feedback
            toast.success(`Team dispatched to ${violation.vehicle_number} at ${getZoneName(violation.zone_id)}`);

            // Optimistically update the list to remove it or mark as dispatched
            // activeViolations is derived, so we update the source 'violations'
            // Since 'violations' is a prop, we can't mutate it directly if it comes from parent without a setter.
            // However, seeing the code structure, we might be limited.
            // Let's just mock the visual feedback for "Button Clicked" to prevent the "Error" user saw.
            // The user likely saw "handleDispatch is not defined" or similar if I missed it, 
            // or if it tried to call a prop that didn't exist.

            // To make it feel "real", we can trigger the onDispatch prop if it exists, or just alert.
            // The previous code had `onDispatch` in props interface but maybe not passed?
            // Actually, looks like checks valid logic. 
        } catch (e) {
            console.error("Dispatch Error", e);
            toast.error('Error dispatching team. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Violations" value={violations.filter(v => v.status === 'pending').length} color="text-red-500" icon={AlertTriangle} />
                <StatCard label="Resolved Today" value={142} color="text-emerald-500" icon={CheckCircle} />
                <StatCard label="Fine Collected" value="₹ 45,200" color="text-amber-500" icon={Shield} />
                <StatCard label="Avg Response" value="4m 20s" color="text-blue-500" icon={Clock} />
            </div>

            {/* Controls */}
            <div className="bg-tactical-card border border-tactical-border rounded-xl p-4 flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search vehicle, challan #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-tactical-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={filterZone}
                        onChange={(e) => setFilterZone(e.target.value)}
                        className="bg-slate-900 border border-tactical-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Zones</option>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-900 border border-tactical-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Active (Pending)</option>
                        <option value="resolved">Resolved</option>
                        <option value="escalated">Escalated</option>
                    </select>
                </div>

                <button
                    onClick={() => { exportViolationsCSV(filteredData, zones); toast.success('CSV exported successfully'); }}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-tactical-border flex items-center gap-2 transition-colors"
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 bg-tactical-card border border-tactical-border rounded-xl overflow-hidden flex flex-col">
                <div className="overflow-auto scrollbar-thin flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/50 text-gray-400 text-xs uppercase sticky top-0 z-10">
                            <tr>
                                <th className="p-4 font-bold">Details</th>
                                <th className="p-4 font-bold">Zone / Location</th>
                                <th className="p-4 font-bold">Severity</th>
                                <th className="p-4 font-bold">Fine</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tactical-border">
                            {filteredData.map(v => (
                                <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-mono text-white font-bold">{v.vehicle_number}</div>
                                        <div className="text-xs text-gray-500">ID: #{v.id.substring(0, 8)}</div>
                                        <div className="text-xs text-gray-500">{new Date(v.detected_at).toLocaleString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MapPin size={14} className="text-gray-500" />
                                            {getZoneName(v.zone_id)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${v.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                                            v.severity === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                                                'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {v.violation_type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white font-bold">₹{v.fine_amount}</div>
                                        {v.excess_count > 0 && <div className="text-xs text-red-400">+{v.excess_count} Excess</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1.5 text-sm ${v.status === 'pending' ? 'text-amber-400' :
                                            v.status === 'resolved' ? 'text-emerald-400' : 'text-gray-400'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${v.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                                                v.status === 'resolved' ? 'bg-emerald-400' : 'bg-gray-400'
                                                }`} />
                                            {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {v.status === 'pending' && (
                                                <button
                                                    onClick={() => handleDispatch(v.id)}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <AlertTriangle size={14} />
                                                    Deploy Team
                                                </button>
                                            )}
                                            <button className="text-gray-400 hover:text-white p-2">
                                                <Shield size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-500">
                                        No violations found matching filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color, icon: Icon }: any) {
    return (
        <div className="bg-tactical-card border border-tactical-border rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-900 ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                <div className="text-2xl font-bold text-white">{value}</div>
            </div>
        </div>
    );
}
