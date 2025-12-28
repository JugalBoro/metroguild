import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { getWorkflows, getExecutions, WS_URL } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Box, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
    const [stats, setStats] = useState({ workflows: 0, executions: 0, active: 0 });
    const [recentExecutions, setRecentExecutions] = useState([]);
    const [chartData, setChartData] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [wfs, execs] = await Promise.all([getWorkflows(), getExecutions()]);

            const active = execs.filter((e: any) => e.status === 'running').length;
            setStats({
                workflows: wfs.length,
                executions: execs.length,
                active
            });

            setChartData([
                { name: 'Mon', value: 4 },
                { name: 'Tue', value: 7 },
                { name: 'Wed', value: 5 },
                { name: 'Thu', value: 12 },
                { name: 'Fri', value: 8 },
                { name: 'Sat', value: 3 },
                { name: 'Sun', value: 6 },
            ]);

            setRecentExecutions(execs.slice(0, 5));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        const ws = new WebSocket(WS_URL);
        ws.onmessage = () => { };
        return () => {
            clearInterval(interval);
            ws.close();
        };
    }, []);

    const statusBodyTemplate = (rowData: any) => {
        const severity = rowData.status === 'completed' ? 'success' :
            rowData.status === 'failed' ? 'danger' :
                rowData.status === 'running' ? 'info' : 'warning';
        return <Tag value={rowData.status} severity={severity} rounded />;
    };

    // Styling helpers
    const statCardStyle = {
        background: 'white', borderRadius: '12px', padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    };

    const iconBoxStyle = (bg: string, color: string) => ({
        width: '48px', height: '48px', borderRadius: '12px',
        background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={statCardStyle}>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Workflows</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.workflows}</div>
                    </div>
                    <div style={iconBoxStyle('#eff6ff', '#2563eb')}><Box size={24} /></div>
                </div>
                <div style={statCardStyle}>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Executions</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.executions}</div>
                    </div>
                    <div style={iconBoxStyle('#f3e8ff', '#9333ea')}><Activity size={24} /></div>
                </div>
                <div style={statCardStyle}>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Active Now</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.active}</div>
                    </div>
                    <div style={iconBoxStyle('#f0fdf4', '#16a34a')}><Zap size={24} /></div>
                </div>
                <div style={statCardStyle}>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Avg Duration</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.25rem' }}>1.2s</div>
                    </div>
                    <div style={iconBoxStyle('#fff7ed', '#ea580c')}><Clock size={24} /></div>
                </div>
            </div>

            {/* Charts & Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card-premium" style={{ flex: 2 }}>
                    <h3 className="header-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Execution Trend</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#cf2e2e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#cf2e2e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#cf2e2e" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-premium" style={{ flex: 1 }}>
                    <h3 className="header-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Runs</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentExecutions.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No executions yet.</p>
                        ) : (
                            recentExecutions.map((exec: any) => (
                                <div key={exec.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: '#f8fafc' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: exec.status === 'running' ? '#3b82f6' : exec.status === 'completed' ? '#22c55e' : '#ef4444' }} />
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{exec.workflowName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{format(new Date(exec.startTime), 'HH:mm:ss')}</div>
                                    </div>
                                    <Tag value={exec.status} severity={exec.status === 'completed' ? 'success' : 'danger'} style={{ fontSize: '0.7rem' }} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="card-premium">
                <h3 className="header-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Execution History</h3>
                <DataTable value={recentExecutions} stripedRows>
                    <Column field="id" header="Run ID"></Column>
                    <Column field="workflowName" header="Workflow"></Column>
                    <Column field="status" header="Status" body={statusBodyTemplate}></Column>
                    <Column field="startTime" header="Started At" body={(r) => r.startTime && format(new Date(r.startTime), 'MMM dd, HH:mm')}></Column>
                    <Column field="duration" header="Duration (s)" body={(r) => r.duration ? r.duration.toFixed(2) + 's' : '-'}></Column>
                </DataTable>
            </div>
        </div>
    );
}
