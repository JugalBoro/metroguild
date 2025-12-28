# PyTaskFlow

A powerful, extensive workflow orchestration platform built with FastAPI and React.

## Project Structure

- **Backend**: FastAPI app with an in-memory database and async workflow engine.
- **Frontend**: React + Vite app using PrimeReact components.

## Prerequisites

- Python 3.8+
- Node.js 16+

## Getting Started

### 1. Backend

 Navigate to the backend directory:
 ```bash
 cd backend
 ```

 Install dependencies:
 ```bash
 pip install -r requirements.txt
 ```

 Run the server:
 ```bash
 uvicorn app.main:app --reload
 ```
 The API will be available at `http://127.0.0.1:8000`.

### 2. Frontend

 Navigate to the frontend directory:
 ```bash
 cd frontend
 ```

 Install dependencies:
 ```bash
 npm install
 ```

 Run the development server:
 ```bash
 npm run dev
 ```
 The application will be available at `http://localhost:5173`.
