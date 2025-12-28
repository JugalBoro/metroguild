from dataclasses import dataclass, field
from typing import Any, Dict, Callable
from app.interfaces import Task
from app.utils.registry import TaskRegistryMeta
from app.utils.descriptors import TaskConfigDescriptor

@dataclass
class TaskContext:
    workflow_id: str
    run_id: str
    global_params: Dict[str, Any] = field(default_factory=dict)
    task_results: Dict[str, Any] = field(default_factory=dict)

class BaseTask(Task, metaclass=TaskRegistryMeta):
    """
    Base Task class demonstrating Metaclass usage and Descriptor validation.
    """
    # Descriptor to validate configuration dict
    config = TaskConfigDescriptor(required_keys=['retries'])

    def __init__(self, name: str, params: Dict[str, Any] = None):
        self.name = name
        self.params = params or {}
        # Decorator Pattern simulated here potentially, but simpler to just use composition
        self.config = {'retries': self.params.get('retries', 3), **self.params} 

    def validate(self) -> bool:
        # Default validation (could use descriptor here too if we map params to attributes)
        return True

    def execute(self, context: TaskContext) -> Any:
        raise NotImplementedError

class PythonFunctionTask(BaseTask):
    type_name = "python_task"

    def __init__(self, name: str, action: Callable, params: Dict[str, Any] = None):
        super().__init__(name, params)
        self.action = action

    def validate(self) -> bool:
        return callable(self.action)

    def execute(self, context: TaskContext) -> Any:
        print(f"Executing Python Task: {self.name} with params: {self.params}")
        # Passing context directly to action if it expects it
        return self.action(context, self.params)
