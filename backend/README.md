# Backend Setup and Usage

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Database Initialization
1. Run the database initialization script:
   ```
   python db_init.py
   ```
   This will create the necessary database tables and populate with sample data.

## Running the Server
1. Start the Flask server:
   ```
   python server.py
   ```

2. The server will run on the port specified in `backend_port.txt` (default: 5000).

## API Endpoints
- GET /api/documents: Retrieve all documents
- POST /api/documents: Upload a new document
- GET /api/documents/<id>: Retrieve a specific document
- POST /api/chat: Send a chat message
- POST /api/upload: Upload a file

## Testing
Run the test files in the backend directory:
- `test_api.py`
- `test_upload.py`
- `test_chat_endpoint.py`

## Configuration
- Database: SQLite (documents.db)
- Port: Configurable via backend_port.txt
- CORS: Enabled for frontend communication
