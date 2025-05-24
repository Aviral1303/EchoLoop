from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.api import api_router
from app.db.init_db import init_db

# Initialize the app
app = FastAPI(title="EchoLoop API", description="API for the EchoLoop email summarization system")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a static directory if it doesn't exist
static_dir = os.path.join(os.getcwd(), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

# Create simple HTML files for auth success/failure
with open(os.path.join(static_dir, "auth-success.html"), "w") as f:
    f.write("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authentication Successful</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
            .success { color: green; }
            .container { max-width: 600px; margin: 0 auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="success">Authentication Successful!</h1>
            <p>You have successfully connected your Gmail account to EchoLoop.</p>
            <p>You can close this window and return to the application.</p>
        </div>
    </body>
    </html>
    """)

with open(os.path.join(static_dir, "auth-failed.html"), "w") as f:
    f.write("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authentication Failed</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
            .error { color: red; }
            .container { max-width: 600px; margin: 0 auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="error">Authentication Failed</h1>
            <p>There was an error connecting your Gmail account to EchoLoop.</p>
            <p>Please try again or contact support if the issue persists.</p>
        </div>
    </body>
    </html>
    """)

# Mount static files
app.mount("/", StaticFiles(directory=static_dir), name="static")

# Add API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    # Initialize database
    init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 