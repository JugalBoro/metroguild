import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Activity, Settings, LogOut } from 'lucide-react';
import { Ripple } from 'primereact/ripple';

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Workflows', icon: List, path: '/workflows' },
        { label: 'Executions', icon: Activity, path: '/executions' },
    ];

    return (
        <aside className="layout-sidebar">
            {/* Logo */}
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold'
                }}>
                    PT
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111' }}>PyTaskFlow</div>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', padding: '0 1.5rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Main Menu</div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`nav-item p-ripple ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} color={isActive ? 'var(--primary-600)' : 'currentColor'} />
                            <span>{item.label}</span>
                            <Ripple />
                        </button>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button className="nav-item p-ripple">
                    <Settings size={20} />
                    <span>Settings</span>
                    <Ripple />
                </button>
                <button className="nav-item p-ripple" style={{ color: '#ef4444' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                    <Ripple />
                </button>
            </div>
        </aside>
    );
}
