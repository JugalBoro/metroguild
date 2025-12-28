import weakref
from abc import ABC, abstractmethod
from typing import List, Protocol
from app.interfaces import Task

# --- Observer Pattern ---
class Observer(Protocol):
    def update(self, event: str, data: any):
        pass

class Subject:
    """
    Subject for Observer Pattern using Weak References to avoid circular references.
    """
    def __init__(self):
        self._observers = weakref.WeakSet()

    def attach(self, observer: Observer):
        self._observers.add(observer)

    def detach(self, observer: Observer):
        self._observers.discard(observer)

    def notify(self, event: str, data: any):
        for observer in self._observers:
            observer.update(event, data)

# --- Command Pattern ---
class Command(ABC):
    """
    Command Pattern interface for task execution with undo capability.
    """
    @abstractmethod
    async def execute(self):
        pass

    @abstractmethod
    async def undo(self):
        pass

class ExecuteTaskCommand(Command):
    def __init__(self, task: Task, context: dict, backend):
        self.task = task
        self.context = context
        self.backend = backend
        self.result = None

    async def execute(self):
        # Delegate to backend strategy
        future = self.backend.submit_task(self.task)
        # Note: In real command pattern, we might want to wait here or handle async properly.
        # For this design, we assume execute initiates the action.
        return future

    async def undo(self):
        print(f"Undoing task {self.task.name} (Simulated rollback)")
        # Logic to compensate or rollback side effects

# --- State Pattern ---
class WorkflowState(ABC):
    @abstractmethod
    def run(self, context) -> bool:
        pass

    @abstractmethod
    def pause(self, context):
        pass

    @abstractmethod
    def resume(self, context):
        pass

class RunningState(WorkflowState):
    def run(self, context) -> bool:
        print("Workflow is already running")
        return False

    def pause(self, context):
        print("Pausing workflow...")
        context.transition_to(PausedState())

    def resume(self, context):
        print("Workflow is running, cannot resume")

class PausedState(WorkflowState):
    def run(self, context) -> bool:
        print("Workflow is paused. Use resume().")
        return False

    def pause(self, context):
        print("Already paused")

    def resume(self, context):
        print("Resuming workflow...")
        context.transition_to(RunningState())
        # Ideally trigger engine resume logic here

class CompletedState(WorkflowState):
    def run(self, context) -> bool:
        print("Workflow completed. Cannot run again.")
        return False

    def pause(self, context):
        print("Workflow finished.")

    def resume(self, context):
        print("Workflow finished.")
