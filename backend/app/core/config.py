import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EchoLoop"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./echoloop.db")
    
    # Gmail API settings
    GMAIL_CREDENTIALS_FILE: str = os.getenv("GMAIL_CREDENTIALS_FILE", "credentials.json")
    
    # LLM settings (Hugging Face)
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    HUGGINGFACE_MODEL: str = os.getenv("HUGGINGFACE_MODEL", "google/flan-t5-base")
    
    # Email fetching settings
    EMAIL_FETCH_LIMIT: int = int(os.getenv("EMAIL_FETCH_LIMIT", "10"))
    EMAIL_FETCH_DAYS: int = int(os.getenv("EMAIL_FETCH_DAYS", "7"))  # Fetch emails from the last 7 days

settings = Settings() 