# EchoLoop

EchoLoop is an agentic AI system that fetches unread Gmail emails, summarizes them using LLM technology, and displays the summaries in a modern web UI with built-in notifications.

## Features

- **Email Fetching**: Authenticate and fetch unread Gmail messages using Gmail API
- **Email Summarization**: Summarize emails using Hugging Face models
- **Database Storage**: Store emails and summaries in SQLite
- **Real-time Notifications**: WebSocket-based notifications when new summaries are available
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Project Structure

The project is divided into two main parts:

- **Backend**: Python FastAPI application
- **Frontend**: React TypeScript application

## Prerequisites

- Python 3.10+
- Node.js 14+
- A Google Cloud project with Gmail API enabled
- A service account with appropriate permissions
- (Optional) A Hugging Face API token

## Setup Instructions

### Backend Setup

1. Navigate to the `backend` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: 
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file with the necessary environment variables (see backend README)
6. Set up a Google Cloud service account and download credentials to `credentials.json`
7. Start the server: `uvicorn app.main:app --reload`

### Frontend Setup

1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Create a `.env` file with the API URLs (see frontend README)
4. Start the development server: `npm start`

## Usage

1. Open the application at http://localhost:3000
2. Log in (any credentials will work for the MVP)
3. View the dashboard to see email summaries
4. Click "Refresh Summaries" to fetch new emails
5. Receive notifications when new summaries are available

## License

MIT

## Credits

Created as an MVP for an agentic AI system. 