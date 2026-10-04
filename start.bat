@echo off
echo.
echo  ==========================================
echo   FraudShield AI  -  Starting Servers
echo  ==========================================
echo.

REM ── 1. Start FastAPI Backend ──────────────────────────────────────────
echo  [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "FraudShield Backend" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM ── 2. Wait for backend to be ready (poll /health) ───────────────────
echo  Waiting for backend to be ready...
set BACKEND_READY=0
set RETRY=0

:CHECK_BACKEND
set /a RETRY+=1
timeout /t 2 >nul

REM Try calling health endpoint — exit code 0 means success
curl -s -o nul -w "%%{http_code}" http://localhost:8000/health 2>nul | findstr /C:"200" >nul 2>&1
if %errorlevel%==0 (
    set BACKEND_READY=1
    goto BACKEND_UP
)

if %RETRY% LSS 20 (
    echo  Attempt %RETRY%/20 - backend not ready yet, retrying...
    goto CHECK_BACKEND
)

echo  [WARN] Backend did not respond after 40s. Starting frontend anyway...

:BACKEND_UP
if %BACKEND_READY%==1 (
    echo  [OK] Backend is ready!
)

echo.

REM ── 3. Start React Frontend Dev Server ───────────────────────────────
echo  [2/2] Starting React Frontend on http://localhost:3000 ...
start "FraudShield Frontend" cmd /k "cd frontend && npm run dev"

REM ── 4. Wait for Vite to spin up, then open browser ───────────────────
echo  Waiting for frontend to start...
timeout /t 6 >nul

echo  Opening browser...
start "" "http://localhost:3000"

echo.
echo  ==========================================
echo   Both servers are running!
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/api/docs
echo  ==========================================
echo.
