import { useState, useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Play, Layers } from 'lucide-react';
import { createWorkflow, getWorkflows } from '../services/api';

interface CreateWorkflowSidebarProps {
    visible: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

export function CreateWorkflowSidebar({ visible, onHide, onSuccess }: CreateWorkflowSidebarProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

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
            onHide();
            setName('');
            setDescription('');
            onSuccess();
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
            onHide();
            onSuccess();
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create demo' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sidebar visible={visible} position="right" onHide={onHide} style={{ width: '400px' }}
            header={<h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create Workflow</h2>}>
            <Toast ref={toast} />
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
                    <Button label="Cancel" text onClick={onHide} style={{ color: '#64748b' }} />
                    <Button label="Create" icon="pi pi-check" loading={loading} onClick={handleSubmit} style={{ background: '#0f172a', border: 'none' }} />
                </div>
            </div>
        </Sidebar>
    );
}
