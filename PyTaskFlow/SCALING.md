# Scaling Strategy and Optimization

This document details the scaling strategies employed in **PyTaskFlow** to handle high-throughput workflow orchestration.

## 1. Orchestration Plane Scaling (Control Plane)

The Control Plane manages workflow state, scheduling, and dispatching. It is designed to handle **10,000+ concurrent workflows**.

### Horizontal Sharding
-   **Consistent Hashing**: The Workflow Engine Cluster uses consistent hashing on `WorkflowExecutionID` to distribute ownership of workflows across active nodes.
-   **Distributed Locking**: Redis is used to acquire ephemeral locks on workflow instances. `SET resource_name my_random_value NX PX 30000`.
-   **Benefit**: This ensures linear scalability. Adding more engine nodes linearly increases the throughput capacity.

### Stateless Design
-   The Engine nodes do not hold application state in local memory between ticks.
-   State is hydrated from **PostgreSQL** (cold storage) or **Redis** (hot cache) at the start of each processing loop.
-   **Benefit**: Nodes can be killed or added (autoscaling) without data loss.

## 2. Execution Plane Scaling (Data Plane)

The Execution Plane runs the actual tasks.

### Task Queue Decoupling
-   **Architecture**: Uses a Message Queue (e.g., Kafka/RabbitMQ) between the Orchestrator and Workers.
-   **Benefit**: 
    -   **Buffering**: Spikes in task generation do not overwhelm the workers.
    -   **Backpressure**: The Orchestrator can slow down dispatching if the queue depth exceeds a threshold.

### Worker Auto-Scaling (HPA)
-   **Metric**: Queue Lag (Total Pending Tasks / Number of Workers).
-   **Mechanism**: A Kubernetes Horizontal Pod Autoscaler (HPA) monitors the queue.
    -   If `TasksPerWorker > 5`: Scale UP.
    -   If `TasksPerWorker < 1`: Scale DOWN.

## 3. Database Optimization

### Write Optimization
-   **Batching**: Worker nodes buffer status updates (e.g., "Running", "Completed") for 500ms or 50 records before performing a `COPY` or `INSERT` batch into PostgreSQL.
-   **Timeline Partitioning**: The `EXECUTION` and `TASK_RUN` tables are partitioned by day/month. This allows older data to be moved to cold storage (S3/Glacier) without affecting index performance for active runs.

### Read Optimization
-   **Read Replicas**: The **Dashboard/UI** queries a Read Replica pool, separate from the Primary DB used by the Engine.
-   **Caching**: `WorkflowDefinition` objects are cached in Redis (LRU) to avoid repeated DB lookups during DAG construction.

## 4. Resource Management (Low-Level)

### Connection Pooling
-   **Database**: Uses `pgbouncer` or internal application-side pooling (implemented in `app/core/backend.py`) to maintain persistent connections, avoiding the TCP handshake overhead for every task update.
-   **Threads**: The Local Backend uses a bounded `ThreadPoolExecutor` to prevent context-switching thrashing on a single node.

### Memory Efficiency
-   **Weak References**: The Observer pattern uses `weakref` to prevent memory leaks in long-running engine processes.
-   **Lazy Loading**: The DAG traversal algorithm only loads tasks in the current *Frontier* set, ensuring memory usage is `O(Frontier_Width)` rather than `O(Total_DAG_Size)`.
