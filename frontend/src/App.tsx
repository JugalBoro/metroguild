import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { Dashboard } from './components/Dashboard';
import { Workflows } from './components/Workflows';
import { Executions } from './components/Executions';

function App() {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="executions" element={<Executions />} />
            </Route>
        </Routes>
    );
}

export default App;
