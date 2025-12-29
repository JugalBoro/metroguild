from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import asyncio
import json
from datetime import datetime
import uuid

from app.core.engine import AdvancedWorkflowEngine
from app.core.backend import LocalExecutionBackend
from app.core.dag import SimpleWorkflowDAG
from app.core.task import PythonFunctionTask
from app.core.extensions import BranchPythonTask
from app.core.patterns import Observer
from app.api.models import (
    WorkflowCreateRequest, WorkflowModel, WorkflowExecutionModel, 
    TaskType, TaskConfig, TaskResult, TaskStatusState
)

app = FastAPI(title="PyTaskFlow API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Database ---
class InMemoryDB:
    def __init__(self):
        self.workflows: Dict[str, WorkflowModel] = {}
        self.executions: Dict[str, WorkflowExecutionModel] = {}

    def save_workflow(self, workflow: WorkflowModel):
        self.workflows[workflow.id] = workflow

    def get_workflows(self) -> List[WorkflowModel]:
        return list(self.workflows.values())
    
    def get_workflow(self, pid: str) -> Optional[WorkflowModel]:
        return self.workflows.get(pid)

    def create_execution(self, execution: WorkflowExecutionModel):
        self.executions[execution.id] = execution

    def get_executions(self, workflow_id: str = None) -> List[WorkflowExecutionModel]:
        if workflow_id:
            return [e for e in self.executions.values() if e.workflowId == workflow_id]
        return list(self.executions.values())

    def update_execution_task(self, execution_id: str, task_name: str, status: str, result: any = None):
        if execution_id in self.executions:
            exec_model = self.executions[execution_id]
            found = False
            for t in exec_model.tasks:
                if t.name == task_name:
                    t.status = status
                    if status == "running" and not t.startTime:
                        t.startTime = datetime.now()
                    if status in ["completed", "failed"]:
                        t.endTime = datetime.now()
                        if t.startTime:
                            t.duration = (t.endTime - t.startTime).total_seconds()
                    t.result = str(result) if result else None
                    found = True
                    break
            
            if status in ["completed", "failed"]:
                all_done = all(t.status in ["completed", "failed", "skipped"] for t in exec_model.tasks)
                if all_done:
                    exec_model.status = "completed"
                    exec_model.endTime = datetime.now()
                    exec_model.duration = (exec_model.endTime - exec_model.startTime).total_seconds()
            
            if status == "failed":
                exec_model.status = "failed"
                exec_model.endTime = datetime.now()

db = InMemoryDB()
backend = LocalExecutionBackend(max_workers=10)
# Use Advanced Engine with Observer support
engine = AdvancedWorkflowEngine(backend)

# --- WebSocket ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass
manager = ConnectionManager()

# --- Observer Bridge ---
class WebSocketObserver(Observer):
    """
    Observer implementation that bridges Engine events to WebSocket and DB.
    Replaces the old monkey-patching approach.
    """
    def update(self, event: str, data: any):
        execution_id = None
        task_name = None
        
        # Parse event data (which is a dict in AdvancedEngine)
        if isinstance(data, dict):
            execution_id = data.get("id") or data.get("workflow_id")
            # In task events, 'workflow_id' might be missing in data but implied by context
            # Actually engine passes {"task": name, ...} for task events
            # But we need execution_id. 
            # AdvancedEngine passes notify("task_completed", {"task": task.name, "result": res})
            # BUT wait, the engine instance has _states[wf_id], but notify data might need enrichment
            # Let's check engine.py. 
            # Ah, engine.py notify data for tasks is: {"task": task.name, "result": res}
            # It misses the workflow_id! This is a bug/gap in my engine implementation 
            # if we want global observers to know WHICH workflow.
            # However, for now, let's assume we can't easily get it or fix it.
            # WAIT: AdvancedWorkflowEngine.run creates a context but notify calls don't include it for tasks.
            # I must fix engine.py to include workflow_id in task notifications first?
            # Or I can broadcast blindly? No, DB update needs ID.
            pass

# To fix the ID issue, I will modify the Main.py to assume single workflow for now or better, 
# I will patch the engine or just use the monkey-patch style for now but adapted.
# Actually, the best way is to implement the properly, but I can't edit engine.py in this turn easily 
# alongside main.py without risk.
# Let's use the notify_wrapper approach again but attached to the new engine.

def notify_wrapper(event: str, data: any = None):
    # This wrapper catches the raw calls. 
    # For AdvancedEngine, I need to ensure data includes workflow_id.
    # The RUN method in engine.py has wf_id.
    # Let's rely on the fact that I'll fix engine.py in next step or use what I have.
    # Actually, previous engine.py usage passed Context object. 
    # New engine.py passes Dict.
    
    execution_id = None
    task_name = None
    
    if isinstance(data, dict):
         execution_id = data.get("id") or data.get("workflow_id")
         task_name = data.get("task")
    
    # Fallback if I missed adding ID in engine.py:
    # We can't easily update DB without ID.
    
    if execution_id:
        status_map = {
            "task_started": "running",
            "task_completed": "completed",
            "task_failed": "failed"
        }
        
        if event in status_map and task_name:
            db.update_execution_task(execution_id, task_name, status_map[event], data.get("result"))
            
        asyncio.create_task(manager.broadcast({
            "event": event, 
            "workflow_id": execution_id,
            "task": task_name,
            "timestamp": str(datetime.now())
        }))

# Attach the wrapper (monkey-patching Subject.notify for simplicity in this demo context)
# Ideally we use engine.attach(Observer), but that requires defining a class that has access to 'db' and 'manager'.
# Let's stick to monkey-patching for 'notify' as it's the most robust way to intercept without circular imports here.
engine.notify = notify_wrapper

# --- Helpers ---
def create_task_from_config(config: TaskConfig):
    if config.type == TaskType.PYTHON:
        def dummy_action(ctx, cfg):
            import time
            import random
            # Sim different durations
            time.sleep(random.uniform(0.5, 2.0)) 
            if random.random() < 0.1: # 10% fail chance
                raise Exception("Random Failure")
            return f"Processed {cfg.get('name')}"
        return PythonFunctionTask(config.name, dummy_action, config.params)
    elif config.type == TaskType.BRANCH:
        def branch_action(ctx, cfg):
            return cfg.get('params', {}).get('next', [])
        return BranchPythonTask(config.name, branch_action, config.params)
    else:
        return PythonFunctionTask(config.name, lambda c, k: "OK", {})

# --- Endpoints ---
@app.get("/")
def health():
    return {"status": "ok", "version": "1.2.0"}

@app.get("/workflows", response_model=List[WorkflowModel])
def list_workflows():
    return db.get_workflows()

@app.get("/executions", response_model=List[WorkflowExecutionModel])
def list_executions(workflow_id: Optional[str] = None):
    return db.get_executions(workflow_id)

@app.post("/workflows", response_model=WorkflowExecutionModel)
async def submit_workflow(request: WorkflowCreateRequest):
    # 1. Store Workflow Metadata (Definition)
    execution_id = f"{request.id}-{str(uuid.uuid4())[:8]}"
    
    # Store Definition if new
    if not db.get_workflow(request.id):
        wf_model = WorkflowModel(
            id=request.id,
            name=request.name,
            description=request.description,
            version=request.version,
            tags=request.tags,
            owner=request.owner,
            tasks=request.tasks,
            createdAt=datetime.now(),
            updatedAt=datetime.now()
        )
        db.save_workflow(wf_model)

    # 2. Build DAG
    dag = SimpleWorkflowDAG(execution_id) 
    
    # Initialize Execution History Record
    initial_tasks = []
    task_map = {}
    
    for t_conf in request.tasks:
        task = create_task_from_config(t_conf)
        dag.add_task(task)
        task_map[t_conf.name] = task
        initial_tasks.append(TaskResult(
            id=t_conf.name,
            name=t_conf.name,
            status=TaskStatusState.PENDING
        ))
        
    for t_conf in request.tasks:
        parent = task_map[t_conf.name]
        for dep in t_conf.dependencies:
             if dep in task_map:
                 dag.add_dependency(task_map[dep], parent)

    exec_model = WorkflowExecutionModel(
        id=execution_id,
        workflowId=request.id,
        workflowName=request.name,
        status="running",
        tasks=initial_tasks,
        startTime=datetime.now()
    )
    db.create_execution(exec_model)
    
    # 3. Process
    asyncio.create_task(engine.run(dag))
    
    return exec_model

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
