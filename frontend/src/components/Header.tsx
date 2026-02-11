import { Bell, Search, ShieldCheck, ChevronLeft, ChevronRight, Menu, Check, X, MapPin, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { DashboardKPIs, ParkingZone, Violation } from '../types';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    kpis?: DashboardKPIs;
    onBack?: () => void;
    onForward?: () => void;
    canBack?: boolean;
    canForward?: boolean;
    children?: React.ReactNode;
    zones?: ParkingZone[];
    violations?: Violation[];
    onNavigate?: (view: string) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen, kpis, onBack, onForward, canBack, canForward, children, zones = [], violations = [], onNavigate }: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState([
        { id: 1, text: "Connaught Place Zone A is 95% full", time: "2 min ago", unread: true },
        { id: 2, text: "Illegal parking reported in Sector 4", time: "10 min ago", unread: true },
        { id: 3, text: "Shift handover requested by Team Alpha", time: "1 hour ago", unread: false },
        { id: 4, text: "System health check passed", time: "2 hours ago", unread: false },
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    // Real search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return { zones: [], violations: [] };
        const q = searchQuery.toLowerCase();
        return {
            zones: zones.filter(z => z.name.toLowerCase().includes(q) || z.location_name.toLowerCase().includes(q)).slice(0, 3),
            violations: violations.filter(v =>
                (v.vehicle_number || '').toLowerCase().includes(q) ||
                (v.violation_type || '').toLowerCase().includes(q) ||
                (v.zone_name || '').toLowerCase().includes(q)
            ).slice(0, 3),
        };
    }, [searchQuery, zones, violations]);

    const hasResults = searchResults.zones.length > 0 || searchResults.violations.length > 0;

    // Close search when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <header className="h-16 bg-tactical-card border-b border-tactical-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Navigation Controls */}
                <div className="hidden md:flex items-center gap-1 mr-2 border-r border-tactical-border pr-4">
                    <button
                        onClick={onBack}
                        disabled={!canBack}
                        className={`p-1.5 rounded-md transition-colors ${canBack ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-700 cursor-not-allowed'}`}
                        title="Go Back"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={onForward}
                        disabled={!canForward}
                        className={`p-1.5 rounded-md transition-colors ${canForward ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-700 cursor-not-allowed'}`}
                        title="Go Forward"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Search with live results */}
                <div className="relative hidden md:block" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search zones, vehicles..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                        onFocus={() => setShowSearch(true)}
                        className="bg-slate-900 border border-tactical-border rounded-full pl-10 pr-8 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500 w-72 transition-colors"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                            <X size={14} />
                        </button>
                    )}

                    {/* Search dropdown */}
                    {showSearch && searchQuery.trim() && (
                        <div className="absolute left-0 top-full mt-2 w-80 bg-tactical-card border border-tactical-border rounded-xl shadow-2xl z-50 overflow-hidden slide-up">
                            {!hasResults ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No results for "{searchQuery}"</div>
                            ) : (
                                <>
                                    {searchResults.zones.length > 0 && (
                                        <div>
                                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-slate-900/50">Zones</div>
                                            {searchResults.zones.map(z => (
                                                <button
                                                    key={z.id}
                                                    onClick={() => { onNavigate?.('map'); setShowSearch(false); setSearchQuery(''); }}
                                                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                                                >
                                                    <MapPin size={14} className="text-blue-400 shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-white">{z.name}</p>
                                                        <p className="text-[10px] text-gray-500">{z.location_name} · {z.current_count}/{z.max_capacity}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.violations.length > 0 && (
                                        <div>
                                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-slate-900/50">Violations</div>
                                            {searchResults.violations.map(v => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => { onNavigate?.('violations'); setShowSearch(false); setSearchQuery(''); }}
                                                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                                                >
                                                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-white">{v.vehicle_number || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-500">{v.violation_type} · {v.zone_name}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {children}
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Status Indicators */}
                <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded border border-tactical-border">
                        <div className={`w-2 h-2 rounded-full ${kpis?.ai_status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-gray-400">AI: {kpis?.ai_status?.toUpperCase() || 'OFFLINE'}</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded border border-tactical-border">
                        <ShieldCheck size={14} className="text-blue-500" />
                        <span className="text-gray-400">SYSTEM: ONLINE</span>
                    </div>
                </div>

                <div className="h-8 w-px bg-tactical-border hidden md:block" />

                <div className="flex items-center gap-4">
                    {/* Notification Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors relative"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white border-2 border-tactical-card">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-80 bg-tactical-card border border-tactical-border rounded-xl shadow-2xl z-50 overflow-hidden slide-up">
                                    <div className="p-3 border-b border-tactical-border flex justify-between items-center bg-slate-900/50">
                                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                <Check size={12} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto scrollbar-thin">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-gray-500 text-xs">No notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-3 border-b border-tactical-border/50 hover:bg-white/5 transition-colors cursor-pointer ${n.unread ? 'bg-blue-500/5' : ''}`}>
                                                    <div className="flex gap-2">
                                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${n.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                        <div>
                                                            <p className={`text-sm ${n.unread ? 'text-white font-medium' : 'text-gray-400'}`}>{n.text}</p>
                                                            <p className="text-[10px] text-gray-500 mt-1">{n.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-2 text-center border-t border-tactical-border bg-slate-900/30">
                                        <button className="text-xs text-gray-400 hover:text-white transition-colors">View All History</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-tactical-border">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-white">Admin Officer</p>
                            <p className="text-xs text-gray-500">MCD Infrastructure</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-slate-700">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
