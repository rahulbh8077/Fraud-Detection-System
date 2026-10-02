@echo off
echo ==========================================
echo   FraudShield AI - Starting Dev Servers
echo ==========================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "FraudShield Backend" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 >nul

echo [2/2] Starting React Frontend on http://localhost:3000 ...
start "FraudShield Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting for servers to start...
timeout /t 5 >nul

echo Opening browser...
start "" "http://localhost:3000"
start "" "http://localhost:8000/api/docs"

echo.
echo ==========================================
echo   Both servers are running!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/api/docs
echo ==========================================
