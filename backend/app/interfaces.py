from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from enum import Enum
from concurrent.futures import Future

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    WAITING_APPROVAL = "waiting_approval"

class Task(ABC):
    @abstractmethod
    def execute(self, context: Dict[str, Any]) -> Any:
        pass

    @abstractmethod
    def validate(self) -> bool:
        pass

class WorkflowDAG(ABC):
    @abstractmethod
    def add_task(self, task: Task):
        pass

class WorkflowResult:
    def __init__(self, workflow_id: str, status: TaskStatus, results: Dict[str, Any]):
        self.workflow_id = workflow_id
        self.status = status
        self.results = results

class WorkflowEngine(ABC):
    @abstractmethod
    async def run(self, dag: WorkflowDAG) -> WorkflowResult:
        pass

    @abstractmethod
    def pause(self, workflow_id: str):
        pass

    @abstractmethod
    def resume(self, workflow_id: str):
        pass

class ExecutionBackend(ABC):
    @abstractmethod
    def submit_task(self, task: Task) -> Future:
        pass
