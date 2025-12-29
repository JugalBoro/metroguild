# PyTaskFlow

**PyTaskFlow** is a robust, distributed, and extensible workflow orchestration engine built with Python and React. It allows users to define DAGs (Directed Acyclic Graphs), execute tasks with complex dependencies, and monitor progress in real-time.

## features

### Low-Level Engine Design
-   **Advanced Patterns**: Implements Strategy, Observer, Command, State, and Factory patterns.
-   **Extensible**: Supports custom Task types via a Metaclass Registry.
-   **Branching**: Native support for Conditional DAGs (If/Else logic).
-   **Performance**: Utilizes `asyncio` for concurrency, `ThreadPoolExecutor` for execution, and an LRU Cache for config management.

### Architecture
-   **Control Plane**: Horizontally scalable engine cluster sharded by Workflow ID.
-   **Data Plane**: Decoupled execution backends (Local Thread Pool, ready for Distributed Queue).
-   **API**: RESTful API (FastAPI) with WebSocket support for real-time updates.
-   **Frontend**: Premium, responsive React UI with no external CSS framework dependencies.

## Architecture & Scaling
Detailed design documentation can be found in:
-   [ARCHITECTURE.md](ARCHITECTURE.md): High-level system design, schema, and patterns.
-   [SCALING.md](SCALING.md): Strategies for handling 10k+ concurrent workflows.

## Getting Started

### Prerequisites
-   Python 3.9+
-   Node.js 16+

### Backend
1.  Navigate to `backend/`.
2.  Install dependencies: `pip install -r requirements.txt`.
3.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend
1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Run the development server:
    ```bash
    npm run dev
    ```

### Testing Extensibility
Run the verification scripts to see the engine's low-level capabilities:
```bash
cd backend
python3 tests/test_branching.py
```

## Project Structure
-   `backend/app/core`: Core engine logic (Engine, Task, DAG, Patterns).
-   `backend/app/api`: FastAPI endpoints and models.
-   `frontend/src`: React application source.
