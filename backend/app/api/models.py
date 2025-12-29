from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime

class TaskType(str, Enum):
    PYTHON = "python"
    HTTP = "http"
    BRANCH = "branch"

class TaskStatusState(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    WAITING_APPROVAL = "waiting_approval"

class TaskConfig(BaseModel):
    name: str
    type: TaskType
    params: Dict[str, Any] = {}
    dependencies: List[str] = []

class WorkflowCreateRequest(BaseModel):
    id: str
    name: str
    description: str
    version: str
    tags: List[str] = []
    owner: str
    tasks: List[TaskConfig]

class TaskResult(BaseModel):
    id: str
    name: str
    status: TaskStatusState
    result: Optional[str] = None
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    duration: Optional[float] = None
    message: Optional[str] = None

class WorkflowExecutionModel(BaseModel):
    id: str
    workflowId: str
    workflowName: str
    status: str
    tasks: List[TaskResult]
    startTime: datetime
    endTime: Optional[datetime] = None
    duration: Optional[float] = None
    environment: str = "production"
    triggeredBy: str = "manual"

class WorkflowModel(BaseModel):
    id: str
    name: str
    description: str
    version: str
    owner: str
    tags: List[str]
    tasks: List[TaskConfig]
    createdAt: datetime
    updatedAt: datetime
