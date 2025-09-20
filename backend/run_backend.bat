@echo off
REM Activate virtual environment
call .\.venv\Scripts\activate.bat

REM Run uvicorn with correct module path
uvicorn backend.server:app --host 0.0.0.0 --port 8000
