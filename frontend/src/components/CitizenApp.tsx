import { useState } from 'react';
import { MapPin, Navigation, Clock, Info, User, List, LogOut, Car, CreditCard, ChevronRight, Bike, Shield, Zap, Umbrella } from 'lucide-react';
import type { ParkingZone, ParkingSession, User as UserType } from '../types';
import CityMap from './CityMap';

interface CitizenAppProps {
    zones: ParkingZone[];
    user?: UserType | null;
    history?: ParkingSession[];
    onLogout?: () => void;
}

export default function CitizenApp({ zones, user, history = [], onLogout }: CitizenAppProps) {
    const [activeTab, setActiveTab] = useState<'find' | 'history' | 'profile'>('find');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);

    // State for interactive features
    const [vehicles, setVehicles] = useState<any[]>(() => {
        try {
            const saved = localStorage.getItem('citizen_vehicles');
            return saved ? JSON.parse(saved) : [
                { id: 'v1', number: 'DL-01-AB-1234', type: 'Car', model: 'Honda City', default: true },
                { id: 'v2', number: 'DL-02-XY-9876', type: 'Bike', model: 'Royal Enfield', default: false }
            ];
        } catch { return []; }
    });

    const [payments, setPayments] = useState<any[]>(() => {
        try {
            const saved = localStorage.getItem('citizen_payments');
            return saved ? JSON.parse(saved) : [
                { id: 'p1', type: 'card', last4: '4242', brand: 'Visa', default: true }
            ];
        } catch { return []; }
    });

    const [profile, setProfile] = useState({
        name: user?.username || 'Amit Sharma',
        email: user?.email || 'amit.sharma@example.com',
        phone: '+91 98765 43210'
    });

    // Handle Navigation
    const handleNavigate = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    // Actions
    const addVehicle = () => {
        const num = prompt("Enter Vehicle Number (e.g., DL-10-CE-0000):");
        if (!num) return;
        const newV = { id: Date.now().toString(), number: num.toUpperCase(), type: 'Car', model: 'New Vehicle', default: false };
        const updated = [...vehicles, newV];
        setVehicles(updated);
        localStorage.setItem('citizen_vehicles', JSON.stringify(updated));
    };

    const removeVehicle = (id: string) => {
        if (window.confirm("Remove this vehicle?")) {
            const updated = vehicles.filter(v => v.id !== id);
            setVehicles(updated);
            localStorage.setItem('citizen_vehicles', JSON.stringify(updated));
        }
    };

    const addPayment = () => {
        const type = prompt("Enter 'card' or 'upi':", 'upi');
        if (type === 'upi') {
            const vpa = prompt("Enter UPI ID (e.g., name@upi):");
            if (vpa) {
                const newP = { id: Date.now().toString(), type: 'upi', vpa, default: false };
                const updated = [...payments, newP];
                setPayments(updated);
                localStorage.setItem('citizen_payments', JSON.stringify(updated));
            }
        } else if (type === 'card') {
            const last4 = prompt("Enter last 4 digits:");
            if (last4) {
                const newP = { id: Date.now().toString(), type: 'card', last4, brand: 'Card', default: false };
                const updated = [...payments, newP];
                setPayments(updated);
                localStorage.setItem('citizen_payments', JSON.stringify(updated));
            }
        }
    };

    const handleSignOut = () => {
        if (onLogout) {
            onLogout();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="max-w-md mx-auto bg-slate-900 min-h-screen border-x border-tactical-border shadow-2xl flex flex-col relative overflow-hidden font-inter">

            {/* Find Parking View */}
            {activeTab === 'find' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    {!selectedZone && (
                        <div className="bg-blue-600 p-6 pb-8 rounded-b-3xl shadow-lg relative z-20 flex-shrink-0">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="relative z-10">
                                <h1 className="text-2xl font-bold text-white mb-1">MCD Parking</h1>
                                <p className="text-blue-100 text-sm">Find spots in New Delhi</p>

                                <div className="mt-6 bg-white/20 backdrop-blur rounded-full p-2 flex items-center shadow-inner">
                                    <MapPin className="text-white ml-2" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Where are you going?"
                                        className="bg-transparent border-none focus:ring-0 outline-none text-white placeholder-blue-200 text-sm w-full ml-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Zone Details Modal/View */}
                    {selectedZone ? (
                        <div className="flex-1 bg-slate-900 flex flex-col relative animate-in fade-in slide-in-from-bottom-10 duration-300">
                            {/* Hero Image / Area */}
                            <div className="h-48 bg-slate-800 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                                <div className="absolute top-4 left-4 z-20">
                                    <button
                                        onClick={() => setSelectedZone(null)}
                                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-all"
                                    >
                                        <ChevronRight className="rotate-180" size={24} />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4 z-20">
                                    <h2 className="text-2xl font-bold text-white shadow-black drop-shadow-md">{selectedZone.name}</h2>
                                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                                        <MapPin size={14} /> {selectedZone.location_name}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
                                {/* Stats Row */}
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-tactical-card border border-tactical-border rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Rate</p>
                                        <p className="text-lg font-bold text-white">₹20<span className="text-xs font-normal text-gray-400">/hr</span></p>
                                    </div>
                                    <div className="flex-1 bg-tactical-card border border-tactical-border rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Type</p>
                                        <p className="text-lg font-bold text-white">Surface</p>
                                    </div>
                                    <div className="flex-1 bg-tactical-card border border-tactical-border rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Spots</p>
                                        <p className={`text-lg font-bold ${(selectedZone.max_capacity - (selectedZone.current_count || 0)) < 10 ? 'text-red-500' : 'text-emerald-500'
                                            }`}>
                                            {selectedZone.max_capacity - (selectedZone.current_count || 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleNavigate(selectedZone.location_lat, selectedZone.location_lng)}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <Navigation size={20} />
                                    Navigate Now
                                </button>

                                {/* Features */}
                                <div>
                                    <h3 className="text-white font-bold mb-3">Amenities</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                            <Shield size={18} className="text-emerald-500" />
                                            <span className="text-sm text-gray-300">24/7 Security</span>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                            <Zap size={18} className="text-yellow-500" />
                                            <span className="text-sm text-gray-300">EV Charging</span>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                            <Umbrella size={18} className="text-blue-500" />
                                            <span className="text-sm text-gray-300">Covered</span>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                            <CreditCard size={18} className="text-purple-500" />
                                            <span className="text-sm text-gray-300">Online Pay</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Information */}
                                <div className="bg-slate-800/30 rounded-xl p-4 border border-tactical-border">
                                    <div className="flex items-start gap-3">
                                        <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Parking Rules</h4>
                                            <ul className="text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
                                                <li>Park only in designated spots.</li>
                                                <li>First 15 mins free for pickup/drop.</li>
                                                <li>Penalty applicable for wrong parking.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Default List View */
                        <div className="flex-1 flex flex-col min-h-0 bg-slate-900 relative -mt-4 pt-4 rounded-t-3xl z-10 transition-all">
                            <div className="px-4 mb-2 flex justify-between items-center">
                                <h2 className="font-bold text-white text-lg">Nearby Zones</h2>
                                <button
                                    onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                                    className="flex items-center gap-1 text-blue-400 text-sm font-medium bg-blue-900/30 px-3 py-1 rounded-full hover:bg-blue-900/50 transition-colors"
                                >
                                    {viewMode === 'list' ? <MapPin size={14} /> : <List size={14} />}
                                    {viewMode === 'list' ? 'View Map' : 'List View'}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 scrollbar-thin">
                                {viewMode === 'map' ? (
                                    <div className="h-full w-full rounded-xl overflow-hidden border border-tactical-border mx-4 mb-4" style={{ height: '500px' }}>
                                        <CityMap zones={zones} />
                                    </div>
                                ) : (
                                    <div className="px-4 space-y-4 pb-4">
                                        {zones.map((zone) => {
                                            const occupancy = (zone.current_count || 0) / zone.max_capacity * 100;
                                            const statusColor = occupancy > 90 ? 'bg-red-500' : occupancy > 70 ? 'bg-amber-500' : 'bg-emerald-500';
                                            const distance = (Math.random() * 5 + 0.5).toFixed(1);

                                            return (
                                                <div key={zone.id} className="bg-tactical-card border border-tactical-border rounded-2xl p-4 active:scale-[0.98] transition-all duration-300">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-bold text-white text-lg">{zone.name}</h3>
                                                            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                                                <Navigation size={12} />
                                                                <span>{distance} km away</span>
                                                                <span className="mx-1">•</span>
                                                                <Clock size={12} />
                                                                <span>~{Math.ceil(Number(distance) * 3)} min</span>
                                                            </div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold text-white shadow-lg ${statusColor}`}>
                                                            {Math.max(0, zone.max_capacity - (zone.current_count || 0))} SPOTS
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${statusColor}`}
                                                                style={{ width: `${Math.min(occupancy, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-400">{Math.round(occupancy)}% Full</span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleNavigate(zone.location_lat, zone.location_lng)}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                                        >
                                                            <Navigation size={16} />
                                                            Navigate
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedZone(zone)}
                                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Info size={16} />
                                                            Details
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Parking History View */}
            {activeTab === 'history' && (
                <div className="flex-1 overflow-y-auto p-4 bg-slate-900 pb-24">
                    <h2 className="text-xl font-bold text-white mb-6">Parking History</h2>
                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">
                                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No parking history found.</p>
                            </div>
                        ) : (
                            history.map(session => (
                                <div key={session.id} className="bg-tactical-card border border-tactical-border rounded-xl p-4">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-bold text-white">{session.zone_name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-500`}>
                                            completed
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-400 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Date</span>
                                            <span className="text-white">{new Date(session.start_time).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Duration</span>
                                            <span className="text-white">2h 15m</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-white mt-2 pt-2 border-t border-gray-700">
                                            <span>Total</span>
                                            <span>₹{session.cost}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Profile View (INTERACTIVE) */}
            {activeTab === 'profile' && (
                <div className="flex-1 overflow-y-auto bg-slate-900 pb-24">
                    <div className="p-4 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-blue-500/30">
                                {profile.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                            <p className="text-gray-400">{profile.email}</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">Account Settings</h3>

                            <div className="bg-slate-900 rounded-xl overflow-hidden border border-tactical-border divide-y divide-tactical-border/50">

                                {/* Personal Details */}
                                <button className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors" onClick={() => {
                                    const n = prompt("Edit Name:", profile.name);
                                    if (n) setProfile(p => ({ ...p, name: n }));
                                }}>
                                    <div className="flex items-center gap-3">
                                        <User size={20} className="text-blue-500" />
                                        <div className="text-left">
                                            <p className="text-white font-medium">Personal Details</p>
                                            <p className="text-xs text-gray-500">{profile.phone}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-500" />
                                </button>

                                {/* My Vehicles Section */}
                                <div className="p-4 bg-slate-800/50">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="flex items-center gap-2 text-white font-medium">
                                            <Car size={20} className="text-emerald-500" /> My Vehicles
                                        </h4>
                                        <button onClick={addVehicle} className="text-xs bg-emerald-600 px-2 py-1 rounded text-white hover:bg-emerald-500">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {vehicles.map(v => (
                                            <div key={v.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-tactical-border">
                                                <div className="flex items-center gap-3">
                                                    {v.type === 'Bike' ? <Bike size={16} className="text-gray-400" /> : <Car size={16} className="text-gray-400" />}
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-200">{v.number}</p>
                                                        <p className="text-[10px] text-gray-500">{v.model}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeVehicle(v.id)} className="text-red-400 p-1 hover:text-red-300"><LogOut size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Methods Section */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="flex items-center gap-2 text-white font-medium">
                                            <CreditCard size={20} className="text-purple-500" /> Payment Methods
                                        </h4>
                                        <button onClick={addPayment} className="text-xs bg-purple-600 px-2 py-1 rounded text-white hover:bg-purple-500">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {payments.map(p => (
                                            <div key={p.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-tactical-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs text-gray-500 font-bold w-8">{p.type === 'upi' ? 'UPI' : 'CARD'}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-200">{p.type === 'upi' ? p.vpa : `•••• ${p.last4}`}</p>
                                                        <p className="text-[10px] text-gray-500">{p.brand || 'Linked'}</p>
                                                    </div>
                                                </div>
                                                {p.default && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">Default</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={20} />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-xs text-gray-600 mt-8 pb-8">
                            App Version 2.5.0 (Live)
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-tactical-border py-4 px-6 flex justify-between z-50">
                <button
                    onClick={() => setActiveTab('find')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'find' ? 'text-blue-500' : 'text-gray-500'}`}
                >
                    <MapPin size={24} />
                    <span className="text-[10px] font-medium">Find Spot</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-blue-500' : 'text-gray-500'}`}
                >
                    <Clock size={24} />
                    <span className="text-[10px] font-medium">History</span>
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'}`}
                >
                    <User size={24} />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </div>
        </div>
    );
}
