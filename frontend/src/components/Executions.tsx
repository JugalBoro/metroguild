import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { getExecutions } from '../services/api';
import { format } from 'date-fns';
import { RefreshCcw } from 'lucide-react';
import { Button } from 'primereact/button';

export function Executions() {
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        getExecutions().then((data) => {
            setExecutions(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    const statusBodyTemplate = (rowData: any) => {
        const severity = rowData.status === 'completed' ? 'success' :
            rowData.status === 'failed' ? 'danger' :
                rowData.status === 'running' ? 'info' : 'warning';
        return <Tag value={rowData.status} severity={severity} rounded style={{ fontWeight: 600, fontSize: '0.75rem' }} />;
    };

    const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>Execution Log</span>
            <Button icon={<RefreshCcw size={16} />} rounded text severity="secondary" onClick={loadData} tooltip="Refresh" />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="header-title">Executions History</h2>
                    <p className="header-subtitle">Monitor and debug your workflow runs.</p>
                </div>
            </div>

            <div className="card-premium" style={{ paddingTop: '0' }}>
                <DataTable value={executions} paginator rows={20} stripedRows loading={loading} header={header} className="p-datatable-sm">
                    <Column field="id" header="Run ID" style={{ fontFamily: 'monospace', fontWeight: 500, color: '#475569' }}></Column>
                    <Column field="workflowName" header="Workflow" sortable body={(r) => <span style={{ fontWeight: 600 }}>{r.workflowName}</span>}></Column>
                    <Column field="status" header="Status" body={statusBodyTemplate} sortable></Column>
                    <Column field="startTime" header="Started At" sortable body={(r) => r.startTime && <span style={{ color: '#64748b' }}>{format(new Date(r.startTime), 'MMM dd, HH:mm:ss')}</span>}></Column>
                    <Column field="duration" header="Duration" body={(r) => r.duration ? <span style={{ fontFamily: 'monospace' }}>{r.duration.toFixed(2)}s</span> : '-'} sortable></Column>
                    <Column field="triggeredBy" header="Trigger" body={(r) => <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase' }}>{r.triggeredBy || 'Manual'}</span>}></Column>
                </DataTable>
            </div>
        </div>
    );
}
