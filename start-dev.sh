#!/bin/bash

# BHIV Full-Stack Development Startup Script
# This script starts both the backend API and frontend development servers

echo "🚀 Starting BHIV Full-Stack Development Environment"
echo "=================================================="

# Check if Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "venv" ] && [ ! -f "requirements.txt" ]; then
    echo "❌ Backend dependencies not found. Run 'pip install -r requirements.txt' first."
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not found. Run 'cd frontend && npm install' first."
    exit 1
fi

echo "✅ Dependencies check passed"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "🔧 Starting Backend API Server (FastAPI)..."
echo "   URL: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo "   Health: http://localhost:8000/health"
echo ""

# Start backend in background
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend failed to start. Check the logs above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully"

echo ""
echo "🎨 Starting Frontend Development Server (Vite + React)..."
echo "   URL: http://localhost:5173"
echo ""

# Start frontend in background
cd frontend && npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo "🎉 Both servers are now running!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "💡 To stop both servers, press Ctrl+C"
echo ""

# Wait for both processes
wait