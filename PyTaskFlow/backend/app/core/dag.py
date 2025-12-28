from typing import List, Dict, Set
from app.interfaces import WorkflowDAG, Task

class SimpleWorkflowDAG(WorkflowDAG):
    def __init__(self, workflow_id: str):
        self.workflow_id = workflow_id
        self.tasks: Dict[str, Task] = {}
        self.dependencies: Dict[str, Set[str]] = {} # Parent -> Children

    def add_task(self, task: Task):
        self.tasks[task.name] = task
        if task.name not in self.dependencies:
            self.dependencies[task.name] = set()

    def add_dependency(self, parent: Task, child: Task):
        self.add_task(parent)
        self.add_task(child)
        self.dependencies[parent.name].add(child.name)

    def get_roots(self) -> List[Task]:
        # Nodes with no incoming edges? No, strict definition.
        # But here dependencies map is Parent -> Children.
        # So Roots are nodes that are never children?
        # Let's verify.
        all_children = set()
        for children in self.dependencies.values():
            all_children.update(children)
        
        return [t for name, t in self.tasks.items() if name not in all_children]
