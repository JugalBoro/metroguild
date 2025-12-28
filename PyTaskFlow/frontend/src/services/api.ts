import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getWorkflows = async () => {
    const response = await api.get('/workflows');
    return response.data;
};

export const getExecutions = async (workflowId?: string) => {
    const params = workflowId ? { workflow_id: workflowId } : {};
    const response = await api.get('/executions', { params });
    return response.data;
};

export const createWorkflow = async (workflowData: any) => {
    const response = await api.post('/workflows', workflowData);
    return response.data;
};

export const WS_URL = 'ws://127.0.0.1:8000/ws';
