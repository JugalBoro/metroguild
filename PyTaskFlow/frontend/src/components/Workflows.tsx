import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { getWorkflows, createWorkflow } from '../services/api';
import { Plus, Play, Layers } from 'lucide-react';
import { Tag } from 'primereact/tag';

export function Workflows() {
    const [workflows, setWorkflows] = useState([]);
    const [visible, setVisible] = useState(false);
    const toast = useRef<Toast>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await createWorkflow({
                id: name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000),
                name,
                description,
                version: "1.0.0",
                tags: ["manual"],
                owner: "User",
                tasks: [
                    { name: 'start_task', type: 'python', params: {}, dependencies: [] }
                ]
            });
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Workflow Created' });
            setVisible(false);
            loadData();
            setName('');
            setDescription('');
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create workflow' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBranchDemo = async () => {
        setLoading(true);
        try {
            await createWorkflow({
                id: 'branch_demo_' + Math.floor(Math.random() * 1000),
                name: 'Branching Demo Flow',
                description: 'Demonstrates engine skipping logic. "Decision" task chooses Path A, ignoring Path B.',
                version: "1.1.0",
                tags: ["demo", "branching"],
                owner: "User",
                tasks: [
                    {
                        name: 'Decision_Point',
                        type: 'branch',
                        params: { next: ['Path_A'] }, // Logic: Hardcoded to choose A
                        dependencies: []
                    },
                    {
                        name: 'Path_A',
                        type: 'python',
                        params: {},
                        dependencies: ['Decision_Point']
                    },
                    {
                        name: 'Path_B',
                        type: 'python',
                        params: {},
                        dependencies: ['Decision_Point']
                    }
                ]
            });
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Branching Demo Created' });
            setVisible(false);
            loadData();
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create demo' });
        } finally {
            setLoading(false);
        }
    };

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
                <Button
                    label="New Workflow"
                    icon={<Plus size={16} style={{ marginRight: '0.5rem' }} />}
                    style={{ background: 'var(--primary-600)', border: 'none', fontWeight: 600 }}
                    onClick={() => setVisible(true)}
                />
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

            <Sidebar visible={visible} position="right" onHide={() => setVisible(false)} style={{ width: '400px' }}
                header={<h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create Workflow</h2>}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>Workflow Name</label>
                        <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Pipeline" style={{ width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>Description</label>
                        <InputTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} style={{ width: '100%' }} placeholder="What does this workflow do?" />
                    </div>

                    <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #dbeafe', display: 'flex', gap: '0.75rem', cursor: 'pointer' }}
                        onClick={() => {
                            setName('Branching Demo');
                            setDescription('A workflow to demonstrate conditional branching. Logic: Always chooses Path A.');
                        }}>
                        <div style={{ color: '#2563eb' }}><Play size={20} /></div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a' }}>Quick Start: Linear</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#1d4ed8' }}>Basic single-step workflow.</p>
                        </div>
                    </div>

                    <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', gap: '0.75rem', cursor: 'pointer' }}
                        onClick={() => handleCreateBranchDemo()}>
                        <div style={{ color: '#16a34a' }}><Layers size={20} /></div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#14532d' }}>Quick Start: Branching</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#15803d' }}>Creates a workflow with conditional logic.</p>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button label="Cancel" text onClick={() => setVisible(false)} style={{ color: '#64748b' }} />
                        <Button label="Create" icon="pi pi-check" loading={loading} onClick={handleSubmit} style={{ background: '#0f172a', border: 'none' }} />
                    </div>
                </div>
            </Sidebar>
        </div>
    );
}
