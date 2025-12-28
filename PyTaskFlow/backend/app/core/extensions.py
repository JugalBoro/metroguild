from typing import Any, Callable, Dict, List
from app.core.task import BaseTask, TaskContext

class BranchPythonTask(BaseTask):
    type_name = "branch_python_task"

    def __init__(self, name: str, action: Callable[[TaskContext, Dict], List[str]], params: Dict[str, Any] = None):
        super().__init__(name, params)
        self.action = action

    def validate(self) -> bool:
        return callable(self.action)

    def execute(self, context: TaskContext) -> List[str]:
        print(f"Evaluating Branch Task: {self.name}")
        # Action must return list of task names to follow
        next_tasks = self.action(context, self.params)
        
        if not isinstance(next_tasks, list):
             raise ValueError(f"Branch task {self.name} must return a list of task names.")
             
        return next_tasks
