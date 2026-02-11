import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CityMap from './components/CityMap';
import AuditLedger from './components/AuditLedger';
import CitizenApp from './components/CitizenApp';
import LoginPage from './components/LoginPage';
import ZoneWizard from './components/ZoneWizard';
import ResponseTeam from './components/ResponseTeam';
import Enforcement from './components/Enforcement';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import { useWebSocket } from './hooks/useWebSocket';
import { dashboardAPI } from './services/api';
import { MOCK_KPI_DATA, MOCK_ZONES_DATA, MOCK_VIOLATIONS_DATA, MOCK_USER_HISTORY } from './data/mockData';
import type { DashboardKPIs, ParkingZone, Violation, User } from './types';

// View title map for browser tab
const VIEW_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    map: 'City Map',
    violations: 'Enforcement',
    response: 'Response Team',
    ledger: 'Audit Ledger',
    wizard: 'Create Zone',
    citizen: 'Citizen Portal',
};

function App() {
    // Navigation History State
    const [history, setHistory] = useState<string[]>(['dashboard']);
    const [currentIndex, setCurrentIndex] = useState(0);
    const view = history[currentIndex];

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string>('guest');

    // Data State
    const [zones, setZones] = useState<ParkingZone[]>([]);
    const [kpis, setKpis] = useState<DashboardKPIs | undefined>(undefined);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { connected, subscribe } = useWebSocket();

    // Update page title based on view
    useEffect(() => {
        const title = VIEW_TITLES[view] || 'Dashboard';
        document.title = `${title} — Smart Parking`;
    }, [view]);

    // Custom View Navigation Handler
    const handleViewChange = (newView: string) => {
        if (newView === view) return;

        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(newView);
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
    };

    const goBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const goForward = () => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    // Load initial data on login
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [liveZones, liveKPIs, activeViolations] = await Promise.all([
                    dashboardAPI.getZonesLive().catch(() => null),
                    dashboardAPI.getKPIs().catch(() => null),
                    dashboardAPI.getActiveViolations().catch(() => [])
                ]);

                if (liveZones && liveZones.length > 0) {
                    setZones(liveZones);
                } else {
                    console.warn('Using Mock Zones (API empty)');
                    setZones(MOCK_ZONES_DATA);
                }

                if (liveKPIs) {
                    setKpis(liveKPIs);
                } else {
                    console.warn('Using Mock KPIs (API empty)');
                    setKpis(MOCK_KPI_DATA);
                }

                if (activeViolations && activeViolations.length > 0) {
                    setViolations(activeViolations);
                } else {
                    setViolations(MOCK_VIOLATIONS_DATA);
                }
            } catch (err) {
                console.warn('Backend Critical Failure, using absolute fallback');
                setKpis(MOCK_KPI_DATA);
                setZones(MOCK_ZONES_DATA);
                setViolations(MOCK_VIOLATIONS_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    // Handle Real-time Updates
    useEffect(() => {
        if (!connected || !isAuthenticated) return;

        const unsubOccupancy = subscribe('occupancy_update', (data) => {
            setZones(prev => prev.map(z =>
                z.id === data.zone_id
                    ? { ...z, current_count: data.current_count, last_updated: data.timestamp }
                    : z
            ));

            if (kpis) {
                setKpis(prev => prev ? ({
                    ...prev,
                    total_vehicles: zones.reduce((acc, z) =>
                        z.id === data.zone_id ? acc + data.current_count : acc + (z.current_count || 0), 0)
                }) : undefined);
            }
        });

        const unsubViolation = subscribe('violation_detected', (data) => {
            setViolations(prev => [data, ...prev]);
            if (kpis) {
                setKpis(prev => prev ? ({ ...prev, active_breaches: prev.active_breaches + 1 }) : undefined);
            }

            new Audio('/alert.mp3').play().catch(() => { });
        });

        return () => {
            unsubOccupancy();
            unsubViolation();
        };
    }, [connected, subscribe, zones, isAuthenticated, kpis]);

    const handleLoginSuccess = (user: User, role: string) => {
        setUser(user);
        setUserRole(role);
        setIsAuthenticated(true);

        if (role === 'user') {
            setHistory(['citizen']);
            setCurrentIndex(0);
        } else {
            setHistory(['dashboard']);
            setCurrentIndex(0);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole('guest');
        setHistory(['dashboard']);
        setCurrentIndex(0);
        localStorage.removeItem('token');
    };

    const handleZoneCreated = (newZone: ParkingZone) => {
        setZones(prev => [...prev, newZone]);
        setHistory(prev => [...prev, 'dashboard']);
        setCurrentIndex(prev => prev + 1);
        console.log(`Zone created: ${newZone.name}`);
    };

    const handleEnforcementDispatch = (_violation: Violation) => {
        handleViewChange('response');
    };

    if (!isAuthenticated) {
        return (
            <>
                <Toaster position="top-right" toastOptions={{
                    style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
                }} />
                <LoginPage onLogin={handleLoginSuccess} />
            </>
        );
    }

    if (view === 'citizen' && userRole === 'user') {
        return <CitizenApp zones={zones} user={user} history={MOCK_USER_HISTORY} />;
    }

    return (
        <div className="flex h-screen bg-tactical-bg text-gray-100 overflow-hidden font-inter">
            <Toaster position="top-right" toastOptions={{
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
                success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
            }} />

            <Sidebar
                currentView={view}
                setView={handleViewChange}
                onLogout={handleLogout}
                collapsed={!sidebarOpen}
                setCollapsed={(c) => setSidebarOpen(!c)}
            />

            <main className="flex-1 flex flex-col min-w-0">
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    kpis={kpis}
                    onBack={goBack}
                    onForward={goForward}
                    canBack={currentIndex > 0}
                    canForward={currentIndex < history.length - 1}
                    zones={zones}
                    violations={violations}
                    onNavigate={handleViewChange}
                >
                    {userRole !== 'user' && view === 'dashboard' && (
                        <button
                            onClick={() => handleViewChange('wizard')}
                            className="ml-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                        >
                            <span>+ Create Zone</span>
                        </button>
                    )}
                </Header>

                <div className="flex-1 overflow-auto p-4 md:p-6 scrollbar-thin">
                    <div className="view-transition">
                        <ErrorBoundary fallbackMessage="Dashboard failed to load.">
                            {isLoading && view === 'dashboard' && <LoadingSkeleton />}
                            {!isLoading && view === 'dashboard' && kpis && (
                                <Dashboard
                                    kpis={kpis}
                                    zones={zones}
                                    violations={violations}
                                    onBack={goBack}
                                    onNext={goForward}
                                />
                            )}
                        </ErrorBoundary>
                        <ErrorBoundary fallbackMessage="Zone Wizard encountered an error.">
                            {view === 'wizard' && (
                                <ZoneWizard
                                    onCancel={() => goBack()}
                                    onComplete={handleZoneCreated}
                                />
                            )}
                        </ErrorBoundary>
                        <ErrorBoundary fallbackMessage="Map failed to load.">
                            {view === 'map' && <div className="h-[calc(100vh-120px)]"><CityMap zones={zones} /></div>}
                        </ErrorBoundary>
                        <ErrorBoundary fallbackMessage="Audit Ledger failed to load.">
                            {view === 'ledger' && <AuditLedger />}
                        </ErrorBoundary>
                        {view === 'citizen' && (
                            <div className="h-full border border-tactical-border rounded-xl overflow-hidden shadow-2xl relative">
                                <CitizenApp zones={zones} user={user || { id: 'admin-sim', username: 'Admin Simulator', email: 'admin@mcd.gov.in', role: 'admin' }} history={MOCK_USER_HISTORY} />
                            </div>
                        )}
                        <ErrorBoundary fallbackMessage="Enforcement module failed.">
                            {view === 'violations' && (
                                <Enforcement
                                    violations={violations}
                                    zones={zones}
                                    onDispatch={handleEnforcementDispatch}
                                />
                            )}
                        </ErrorBoundary>
                        <ErrorBoundary fallbackMessage="Response Team module failed.">
                            {view === 'response' && (
                                <ResponseTeam violations={violations} zones={zones} />
                            )}
                        </ErrorBoundary>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
