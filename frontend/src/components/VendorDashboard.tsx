import { useState } from 'react';
import {
    LayoutDashboard, MapPin, IndianRupee, AlertTriangle, TrendingUp,
    Settings, LogOut, Car, Users
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { ParkingZone, Violation, DashboardKPIs } from '../types';

interface VendorDashboardProps {
    vendorId: string;
    zones: ParkingZone[];
    violations: Violation[];
    kpis?: DashboardKPIs;
    onLogout: () => void;
}

export default function VendorDashboard({ vendorId, zones, violations, kpis: _kpis, onLogout }: VendorDashboardProps) {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Filter data for this vendor (Mock logic: assume all assigned if id matches or just specific ones)
    // For demo, let's say Vendor owns 'z1' and 'z2'
    const myZones = zones.filter(z => ['z1', 'z2'].includes(z.id));
    const myViolations = violations.filter(v => ['z1', 'z2'].includes(v.zone_id));

    // Calculate Vendor Specific KPIs
    const totalCapacity = myZones.reduce((acc, z) => acc + z.max_capacity, 0);
    const currentOccupancy = myZones.reduce((acc, z) => acc + (z.current_count || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;
    const revenue = 12500; // Mock derived revenue

    return (
        <div className="flex h-screen bg-tactical-bg text-gray-100 font-inter">
            {/* Vendor Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-tactical-border flex flex-col">
                <div className="p-6 border-b border-tactical-border">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Vendor Portal
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Contractor ID: {vendorId}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavButton icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavButton icon={MapPin} label="My Zones" active={activeTab === 'zones'} onClick={() => setActiveTab('zones')} />
                    <NavButton icon={IndianRupee} label="Revenue" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} />
                    <NavButton icon={AlertTriangle} label="Violations" active={activeTab === 'violations'} onClick={() => setActiveTab('violations')} />
                    <NavButton icon={TrendingUp} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                </nav>

                <div className="p-4 border-t border-tactical-border">
                    <NavButton icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors mt-2"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h1>
                        <p className="text-sm text-gray-400">Real-time monitoring for assigned zones</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-tactical-border flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${occupancyRate > 90 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-sm font-bold text-gray-300">Status: {occupancyRate > 90 ? 'CRITICAL' : 'NORMAL'}</span>
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-4 gap-6">
                            <MetricCard label="My Zones" value={myZones.length} icon={MapPin} color="bg-blue-500/10 text-blue-500" />
                            <MetricCard label="Occupancy" value={`${occupancyRate}%`} sub={`${currentOccupancy} / ${totalCapacity}`} icon={Users} color="bg-purple-500/10 text-purple-500" />
                            <MetricCard label="Today's Revenue" value={`₹${revenue.toLocaleString()}`} icon={IndianRupee} color="bg-emerald-500/10 text-emerald-500" />
                            <MetricCard label="Active Breaches" value={myViolations.length} icon={AlertTriangle} color="bg-red-500/10 text-red-500" />
                        </div>

                        {/* Live Zones Row */}
                        <div className="grid grid-cols-2 gap-6">
                            {myZones.map(zone => (
                                <div key={zone.id} className="bg-tactical-card border border-tactical-border rounded-xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-50">
                                        <Car size={100} className="text-slate-800" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{zone.name}</h3>
                                                <p className="text-xs text-gray-400">{zone.location_name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${(zone.capacity_status || 'normal') === 'over_capacity' ? 'bg-red-500/20 text-red-500' :
                                                (zone.capacity_status || 'normal') === 'near_capacity' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                                                }`}>
                                                {(zone.capacity_status || 'normal').replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1 text-gray-400">
                                                <span>Live Occupancy</span>
                                                <span className="text-white font-bold">{Math.round(((zone.current_count || 0) / zone.max_capacity) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${(zone.capacity_status || 'normal') === 'over_capacity' ? 'bg-red-500' :
                                                        (zone.capacity_status || 'normal') === 'near_capacity' ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${((zone.current_count || 0) / zone.max_capacity) * 100}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 text-xs flex justify-between text-gray-500">
                                                <span>{zone.current_count || 0} Vehicles</span>
                                                <span>{zone.max_capacity} Max</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                                                View Details
                                            </button>
                                            {((zone.capacity_status || 'normal') === 'over_capacity') && (
                                                <button className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-bold transition-colors animate-pulse">
                                                    Resolve Breach
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Revenue & Violations Split */}
                        <div className="grid grid-cols-3 gap-6 h-80">
                            {/* Revenue Chart */}
                            <div className="col-span-2 bg-tactical-card border border-tactical-border rounded-xl p-6 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-6">Revenue Trend (7 Days)</h3>
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[
                                            { name: 'Mon', val: 4000 }, { name: 'Tue', val: 3000 }, { name: 'Wed', val: 5500 },
                                            { name: 'Thu', val: 4500 }, { name: 'Fri', val: 8000 }, { name: 'Sat', val: 12000 }, { name: 'Sun', val: 15000 }
                                        ]}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#64748b" />
                                            <YAxis stroke="#64748b" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="val" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="col-span-1 bg-tactical-card border border-tactical-border rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <ActionButton label="Generate Revenue Report" icon={DownloadIcon} />
                                    <ActionButton label="Dispute Violation" icon={AlertTriangle} />
                                    <ActionButton label="Update Staffing" icon={Users} />
                                    <ActionButton label="Contact Support" icon={PhoneIcon} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );
}

function MetricCard({ label, value, sub, icon: Icon, color }: any) {
    return (
        <div className="bg-tactical-card border border-tactical-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} />
                </div>
                {sub && <span className="text-xs font-bold text-gray-500 bg-slate-800 px-2 py-1 rounded-full">{sub}</span>}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
    );
}

function ActionButton({ label, icon: Icon }: any) {
    return (
        <button className="w-full bg-slate-800 hover:bg-slate-700 border border-tactical-border text-gray-300 hover:text-white p-3 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium">
            <Icon size={16} />
            {label}
        </button>
    );
}

const DownloadIcon = ({ size }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const PhoneIcon = ({ size }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
