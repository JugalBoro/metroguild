from concurrent.futures import ThreadPoolExecutor, Future
import time
from typing import Any
from app.interfaces import ExecutionBackend, Task

class ConnectionPool:
    """
    Simulated Connection Pool for database access optimization.
    Effectively manages resource connections.
    """
    def __init__(self, pool_size: int = 5):
        self._size = pool_size
        self._connections = [f"Conn-{i}" for i in range(pool_size)]
        self._active = []

    def get_connection(self):
        if self._connections:
            conn = self._connections.pop()
            self._active.append(conn)
            return conn
        raise Exception("Pool exhausted")

    def release_connection(self, conn):
        if conn in self._active:
            self._active.remove(conn)
            self._connections.append(conn)

class LocalExecutionBackend(ExecutionBackend):
    """
    Concrete Strategy for Local Execution.
    Demonstrates resource handling with ConnectionPool.
    """
    def __init__(self, max_workers: int = 5):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.db_pool = ConnectionPool(pool_size=10)

    def submit_task(self, task: Task) -> Future:
        # Wrapping execution to include resource acquisition
        return self.executor.submit(self._execute_wrapper, task)

    def _execute_wrapper(self, task: Task) -> Any:
        conn = None
        try:
            # Custom Context Manager could be used here
            conn = self.db_pool.get_connection()
            # print(f"[{task.name}] Acquired {conn}")
            
            # Context construction logic would be in Engine, but simulating passing down:
            from app.core.task import TaskContext
            ctx = TaskContext(workflow_id="local", run_id=f"run_{int(time.time())}")
            
            return task.execute(ctx)
        finally:
            if conn:
                self.db_pool.release_connection(conn)
