import asyncio
from app.core.engine import AdvancedWorkflowEngine
from app.core.backend import LocalExecutionBackend
from app.core.task import PythonFunctionTask
from app.core.dag import SimpleWorkflowDAG
from app.core.patterns import Observer

class LoggerObserver(Observer):
    def update(self, event: str, data: any):
        print(f"[OBSERVER] Event: {event} | Data: {data}")

async def main():
    print("--- Starting Engine Verification ---")
    
    # 1. Setup Backend & Engine
    backend = LocalExecutionBackend(max_workers=2)
    engine = AdvancedWorkflowEngine(backend)
    
    # 2. Attach Observer
    logger = LoggerObserver()
    engine.attach(logger)
    
    # 3. Create DAG
    dag = SimpleWorkflowDAG(workflow_id="demo_wf_001")
    
    # 4. Define Tasks using Registry Metaclass (Implicit)
    def task_a(ctx, params):
        return "Result A"
    
    def task_b(ctx, params):
        return f"Result B from {params.get('input')}"
        
    t1 = PythonFunctionTask("Task_1", task_a, {"retries": 3})
    t2 = PythonFunctionTask("Task_2", task_b, {"retries": 1, "input": "A"})
    
    dag.add_dependency(t1, t2)
    
    # 5. Run Engine
    print(">>> Running Workflow...")
    result = await engine.run(dag)
    print(f"<<< Workflow Finished: {result.status}")
    print(f"Results: {result.results}")

if __name__ == "__main__":
    asyncio.run(main())
