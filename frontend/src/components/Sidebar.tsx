import {
    LayoutDashboard,
    Map as MapIcon,
    ShieldAlert,
    Users,
    FileText,
    Menu,
    Activity,
    LogOut
} from 'lucide-react';

interface SidebarProps {
    currentView: string;
    setView: (view: string) => void;
    onLogout: () => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ currentView, setView, onLogout, collapsed, setCollapsed }: SidebarProps) {
    // const [collapsed, setCollapsed] = useState(false); // Lifted to App.tsx

    const menuItems = [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'map', label: 'Live City Map', icon: MapIcon },
        { id: 'violations', label: 'Enforcement', icon: ShieldAlert },
        { id: 'response', label: 'Response Teams', icon: Users },
        { id: 'ledger', label: 'Security Ledger', icon: FileText },
        { id: 'citizen', label: 'Citizen Portal', icon: Activity },
    ];

    return (
        <div className={`h-screen bg-tactical-card border-r border-tactical-border transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
            <div className="p-4 flex items-center justify-between border-b border-tactical-border">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">MCD</div>
                        <span className="font-bold text-gray-100 tracking-tight">SMART PARKING</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-slate-700 rounded text-gray-400 hover:text-white"
                >
                    <Menu size={20} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${currentView === item.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-tactical-border">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="font-medium">Sign Out</span>}
                </button>
            </div>
        </div>
    );
}
