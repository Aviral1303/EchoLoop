from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.gmail_service import GmailService

router = APIRouter(prefix="/auth", tags=["auth"])
gmail_service = GmailService()

@router.get("/login")
async def login():
    """Generate Gmail OAuth login URL"""
    auth_url = gmail_service.get_auth_url()
    if not auth_url:
        raise HTTPException(status_code=500, detail="Could not generate authentication URL")
    
    return {"auth_url": auth_url}

@router.get("/callback")
async def callback(code: str, state: str = None):
    """Handle OAuth callback from Google"""
    success = gmail_service.get_credentials_from_code(code)
    
    if not success:
        return RedirectResponse(url="/auth-failed.html")
    
    # Get user profile to verify authentication
    profile = gmail_service.get_user_profile()
    
    # On success, redirect to the frontend
    return RedirectResponse(url="/auth-success.html")

@router.get("/status")
async def auth_status():
    """Check if the user is authenticated with Gmail"""
    profile = gmail_service.get_user_profile() if not gmail_service.use_mock else None
    
    return {
        "authenticated": not gmail_service.use_mock and profile is not None,
        "profile": profile if profile else None,
        "mock_mode": gmail_service.use_mock
    } 