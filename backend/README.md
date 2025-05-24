# EchoLoop Backend

This is the backend for the EchoLoop email summarization system. It uses FastAPI to provide endpoints for fetching, summarizing, and retrieving emails.

## Features

- Fetch unread emails from Gmail using the Gmail API
- Summarize emails using a Hugging Face LLM
- Store emails and summaries in a SQLite database
- Real-time notifications via WebSocket
- RESTful API for frontend integration

## Prerequisites

- Python 3.10+
- A Google Cloud project with the Gmail API enabled
- A service account with appropriate permissions
- A Hugging Face API token (optional)

## Setup

1. Clone the repository and navigate to the backend directory

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with the following content:
   ```
   # Database settings
   DATABASE_URL=sqlite:///./echoloop.db

   # Gmail API settings
   GMAIL_CREDENTIALS_FILE=credentials.json

   # LLM settings (Hugging Face)
   HUGGINGFACE_API_KEY=your-huggingface-api-key
   HUGGINGFACE_MODEL=google/flan-t5-base

   # Email fetching settings
   EMAIL_FETCH_LIMIT=10
   EMAIL_FETCH_DAYS=7
   ```

5. Create a service account in the Google Cloud Console:
   - Go to the Google Cloud Console
   - Create a new project or select an existing one
   - Enable the Gmail API
   - Create a service account
   - Download the service account credentials as JSON
   - Rename the file to `credentials.json` and place it in the backend directory

6. Run the application:
   ```
   uvicorn app.main:app --reload
   ```

7. The API will be available at http://localhost:8000

## API Endpoints

- `GET /api/v1/summaries` - Get all email summaries
- `POST /api/v1/refresh` - Fetch new emails and create summaries
- `PUT /api/v1/summaries/{summary_id}/seen` - Mark a summary as seen
- `WebSocket /api/v1/ws` - WebSocket endpoint for real-time notifications

## Development

The backend is structured as follows:

- `app/main.py` - FastAPI application entry point
- `app/api/routes.py` - API endpoints
- `app/core/config.py` - Configuration settings
- `app/db/` - Database setup and repository
- `app/models/` - Database models and schema
- `app/services/` - Business logic services 