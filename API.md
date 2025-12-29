# API Documentation

The **PyTaskFlow** Control Plane exposes a RESTful API for managing workflows and a WebSocket endpoint for real-time monitoring.

## Base URL
`http://localhost:8000`

---

## 1. Workflows

### List All Workflows
Retrieve a list of all registered workflow definitions.

-   **Endpoint**: `GET /workflows`
-   **Response**: `200 OK`
    ```json
    [
      {
        "id": "workflow_1",
        "name": "Data Pipeline",
        "version": 1,
        "description": "ETL Process",
        "tasks": [...]
      }
    ]
    ```

### Submit / Create Workflow
Register and immediately trigger a new workflow execution.

-   **Endpoint**: `POST /workflows`
-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
      "id": "my_workflow_id",
      "name": "My Workflow",
      "description": "Optional description",
      "version": "1.0.0",
      "tags": ["production", "etl"],
      "owner": "devops-team",
      "tasks": [
        {
          "name": "TaskA",
          "type": "python",
          "params": {},
          "dependencies": []
        },
        {
          "name": "TaskB",
          "type": "branch",
          "params": { "next": ["TaskC"] },
          "dependencies": ["TaskA"]
        }
      ]
    }
    ```
-   **Response**: `200 OK` (Returns the created `Execution` object)

---

## 2. Executions

### List Executions
Retrieve a history of workflow executions.

-   **Endpoint**: `GET /executions`
-   **Query Params**:
    -   `workflow_id` (Optional): Filter by specific workflow.
-   **Response**: `200 OK`
    ```json
    [
      {
        "id": "exec_abc123",
        "workflowId": "workflow_1",
        "status": "running",
        "tasks": [
          {
             "name": "TaskA",
             "status": "completed",
             "duration": 1.2
          }
        ],
        "startTime": "2023-10-27T10:00:00"
      }
    ]
    ```

---

## 3. Real-Time (WebSocket)

### Connect to Monitoring Stream
Listen for real-time task status updates.

-   **Endpoint**: `WS /ws`
-   **Messages Received** (JSON):
    ```json
    {
      "event": "task_completed",
      "workflow_id": "exec_abc123",
      "task": "TaskA",
      "timestamp": "2023-10-27T10:00:05.123"
    }
    ```

---

## Data Models

### Task Types
1.  **python**: Standard task execution.
2.  **branch**: Returns a list of next task names to execute; others are skipped.

### Task Statuses
-   `pending`: Waiting for dependencies.
-   `running`: Currently executing.
-   `completed`: Successfully finished.
-   `failed`: Encountered an error (retries exhausted).
-   `skipped`: Not selected by a branch decision.
