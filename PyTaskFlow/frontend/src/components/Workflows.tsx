import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { getWorkflows, createWorkflow } from '../services/api';
import { Layers } from 'lucide-react';
import { Tag } from 'primereact/tag';

export function Workflows() {
    const [workflows, setWorkflows] = useState([]);
    const toast = useRef<Toast>(null);

    const loadData = async () => {
        try {
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleExecute = async (rowData: any) => {
        try {
            await createWorkflow({
                ...rowData,
                id: rowData.id, // Ensure ID is passed to trigger re-run logic or create new execution mapping
                // Note: In a real system you might have a dedicated /execute endpoint, 
                // but here createWorkflow triggers execution as per backend design.
            });
            toast.current?.show({ severity: 'success', summary: 'Workflow Executed', detail: `Started ${rowData.name}` });
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Execution Failed', detail: 'Could not start workflow' });
        }
    };

    const actionTemplate = (rowData: any) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button icon="pi pi-play" rounded text size="small" severity="success" tooltip="Execute" onClick={() => handleExecute(rowData)} />
                <Button icon="pi pi-pencil" rounded text size="small" severity="info" />
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Toast ref={toast} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="header-title">Workflows ({workflows.length})</h2>
                    <p className="header-subtitle">Manage your orchestration definitions</p>
                </div>
                {/* Creation Button Moved to Navbar */}
            </div>

            <div className="card-premium">
                <DataTable value={workflows} paginator rows={10} stripedRows>
                    <Column field="name" header="Name" body={(r) => <span style={{ fontWeight: 600 }}>{r.name}</span>} sortable></Column>
                    <Column field="description" header="Description"></Column>
                    <Column field="version" header="Version" body={(r) => <Tag value={`v${r.version}`} severity="success" />}></Column>
                    <Column field="tasks.length" header="Steps" body={(r) => <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={14} /> {r.tasks.length}</div>}></Column>
                    <Column body={actionTemplate} header="Actions" style={{ width: '10%' }}></Column>
                </DataTable>
            </div>
        </div>
    );
}
