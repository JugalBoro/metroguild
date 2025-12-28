import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export function AppLayout() {
    return (
        <div className="layout-container">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="layout-main">
                {/* Fixed Navbar */}
                <Navbar />

                {/* Content Area */}
                <main className="layout-content">
                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
