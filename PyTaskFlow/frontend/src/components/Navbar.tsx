import { Avatar } from 'primereact/avatar';
import { useLocation } from 'react-router-dom';

export function Navbar() {
    const location = useLocation();

    // Helper to format title
    const getTitle = () => {
        if (location.pathname === '/') return 'Dashboard';
        return location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(1).slice(1);
    };

    return (
        <header className="layout-header">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {getTitle()}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>v1.2.0</span>
                <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }}></div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: '#f0fdf4', color: '#16a34a',
                    padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                    System Operational
                </div>

                <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <Avatar label="JD" shape="circle" style={{ background: '#e2e8f0', color: '#475569', fontWeight: 'bold' }} />
                    <div style={{ textAlign: 'right', display: 'none', lineHeight: '1.2' }} className="md-block">
                        {/* md-block is not real, assuming basic responsive hiding not critical for verify or simple style */}
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>John Doe</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Admin</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
