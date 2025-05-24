from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.db.database import get_db
from app.services.email_service import EmailService
from app.services.websocket_service import connection_manager

router = APIRouter()
email_service = EmailService()

@router.get("/summaries", response_model=List[Dict[str, Any]])
async def get_email_summaries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all email summaries"""
    return email_service.get_email_summaries(db, skip, limit)

@router.post("/refresh")
async def refresh_emails(db: Session = Depends(get_db)):
    """Fetch new emails and create summaries"""
    summaries = await email_service.fetch_and_summarize_emails(db)
    return {"message": f"Processed {len(summaries)} new emails", "summaries": summaries}

@router.put("/summaries/{summary_id}/seen")
async def mark_summary_seen(summary_id: int, db: Session = Depends(get_db)):
    """Mark a summary as seen"""
    success = email_service.mark_summary_as_seen(db, summary_id)
    if not success:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {"success": True}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time notifications"""
    await connection_manager.connect(websocket)
    try:
        while True:
            # Wait for messages from the client
            data = await websocket.receive_text()
            
            # Process commands from client
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await connection_manager.send_personal_message(json.dumps({"type": "pong"}), websocket)
            except json.JSONDecodeError:
                # Invalid JSON, ignore
                pass
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket) 