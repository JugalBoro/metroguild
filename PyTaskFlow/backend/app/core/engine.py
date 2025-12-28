import asyncio
from typing import Dict, Any, List
from functools import lru_cache
from app.interfaces import WorkflowEngine, ExecutionBackend
from app.core.dag import SimpleWorkflowDAG
from app.core.task import TaskContext
from app.core.patterns import Subject, Observer, ExecuteTaskCommand, WorkflowState, RunningState, PausedState
from app.interfaces import WorkflowResult, TaskStatus

class AdvancedWorkflowEngine(WorkflowEngine, Subject):
    """
    Advanced Engine implementing multiple design patterns:
    - Singleton (via Module/Class usage typically, but here Instance)
    - Observer (Inherits Subject)
    - State (Manages WorkflowState)
    - Command (Executes Tasks)
    """
    def __init__(self, backend: ExecutionBackend):
        Subject.__init__(self)
        self.backend = backend
        # State Pattern: Track state per workflow
        self._states: Dict[str, WorkflowState] = {} 
        self._results: Dict[str, Any] = {}

    @lru_cache(maxsize=100)
    def _get_cached_config(self, task_name: str):
        # Simulated LRU cache for frequent config access
        return {"timeout": 30, "retries": 3}

    async def run(self, dag: SimpleWorkflowDAG) -> WorkflowResult:
        wf_id = dag.workflow_id
        self._states[wf_id] = RunningState()
        
        # Context creation
        context = TaskContext(wf_id, f"run_{id(self)}", {})
        
        # Notify Observers
        self.notify("workflow_started", {"id": wf_id})

        # Command Pattern & Async Execution
        # Simplified Topological Sort Execution
        in_degree = {name: 0 for name in dag.tasks}
        for parent, children in dag.dependencies.items():
            for child in children:
                in_degree[child] += 1
                
        queue = [dag.tasks[name] for name, deg in in_degree.items() if deg == 0]
        results = {}

        while queue:
            # check state
            if isinstance(self._states[wf_id], PausedState):
                await asyncio.sleep(1)
                continue

            current_batch = queue[:]
            queue = []
            
            # Create Commands
            commands = [
                ExecuteTaskCommand(task, context, self.backend) 
                for task in current_batch
            ]
            
            # Execute Batch Concurrently
            # In a real engine, we would track futures more granularly
            futures = await asyncio.gather(*[cmd.execute() for cmd in commands])
            
            # Process Results (Hybrid: Local backend returns Future, we wait on it)
            # Since local backend uses ThreadPool, we need to await the future properly or use run_in_executor
            # For this demo, let's assume backend returns a Future we can result() on (blocking but safe in thread)
            # To be truly async non-blocking, we'd wrap connection.
            
            for i, task in enumerate(current_batch):
                try:
                    # Sync wait for thread result
                    res = futures[i].result()
                    results[task.name] = res
                    self.notify("task_completed", {"workflow_id": wf_id, "task": task.name, "result": res})
                    
                    if task.name in dag.dependencies:
                        # Branching Logic
                        children_to_visit = dag.dependencies[task.name]
                        
                        # Check if task is a Branching Task
                        # We discern via type or attribute. Let's use attribute "type_name" from registry
                        if getattr(task, 'type_name', '') == "branch_python_task":
                            # Result MUST be a list of task names
                            if isinstance(res, list):
                                allowed_next = set(res)
                                # Filter children
                                children_to_visit = [c for c in dag.dependencies[task.name] if c in allowed_next]
                                
                                # Mark skipped children immediately?
                                # Optional, but good for clarity.
                                skipped = [c for c in dag.dependencies[task.name] if c not in allowed_next]
                                for s in skipped:
                                    results[s] = None
                                    self._results[s] = TaskStatus.SKIPPED
                                    self.notify("task_skipped", {"workflow_id": wf_id, "task": s})
                            else:
                                # Fallback or Error? Treat as normal or fail?
                                # Fail for safety
                                raise ValueError(f"Branch task {task.name} did not return a list of task names.")

                        for child_name in children_to_visit:
                            in_degree[child_name] -= 1
                            if in_degree[child_name] == 0:
                                queue.append(dag.tasks[child_name])
                                
                except Exception as e:
                    self.notify("task_failed", {"workflow_id": wf_id, "task": task.name, "error": str(e)})
                    # Undo/Compensate
                    await commands[i].undo()
        
        self.notify("workflow_completed", {"id": wf_id})
        return WorkflowResult(wf_id, TaskStatus.COMPLETED, results)

    def pause(self, workflow_id: str):
        if workflow_id in self._states:
            self._states[workflow_id].pause(self)
            self.notify("workflow_paused", {"id": workflow_id})

    def resume(self, workflow_id: str):
        if workflow_id in self._states:
            self._states[workflow_id].resume(self)
            self.notify("workflow_resumed", {"id": workflow_id})

    # State Pattern Transition Helper
    def transition_to(self, state: WorkflowState):
        # This implementation simplifies state tracking to "current active context"
        # In multi-workflow, we'd pass the workflow_id context.
        pass
