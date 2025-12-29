import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { CreateWorkflowSidebar } from '../components/CreateWorkflowSidebar';

export function AppLayout() {
    const [createVisible, setCreateVisible] = useState(false);

    return (
        <div className="layout-container">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="layout-main">
                {/* Fixed Navbar with Action */}
                <Navbar onNewWorkflow={() => setCreateVisible(true)} />

                {/* Content Area */}
                <main className="layout-content">
                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>

                {/* Global Creation Sidebar */}
                <CreateWorkflowSidebar
                    visible={createVisible}
                    onHide={() => setCreateVisible(false)}
                    onSuccess={() => {
                        // Optional: Refresh logic or Navigation
                        // For now, simple close. User can refresh list manually.
                        setCreateVisible(false);
                        // If we are on workflows page, a reload makes sense to show new item
                        if (window.location.pathname === '/workflows') {
                            window.location.reload();
                        }
                    }}
                />
            </div>
        </div>
    );
}
