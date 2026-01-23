@echo off
echo Installing dependencies...
python -m pip install -r backend/requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please ensure Python is installed and added to PATH.
    pause
    exit /b %errorlevel%
)

echo Initializing database...
python backend/init_db.py
if %errorlevel% neq 0 (
    echo Failed to initialize database. Please check your database configuration.
    pause
    exit /b %errorlevel%
)

echo Starting backend server...
python -m uvicorn main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
pause
