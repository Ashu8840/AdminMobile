@echo off
echo Starting Movie Admin Portal...

echo Starting backend server...
start "Backend" cmd /k "cd /d %~dp0 && npm start"

timeout /t 3 >nul

echo Starting frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Both servers are starting in separate windows...
pause
