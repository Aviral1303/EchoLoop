from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.services.gmail_service import GmailService
from app.services.llm_service import LLMService
from app.services.websocket_service import connection_manager
from app.db.repository import EmailRepository, SummaryRepository
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.gmail_service = GmailService()
        self.llm_service = LLMService()
    
    async def fetch_and_summarize_emails(self, db: Session) -> List[Dict[str, Any]]:
        """
        Fetch unread emails, summarize them, and save to database
        
        Returns:
            List of email summaries
        """
        # Fetch unread emails
        emails = self.gmail_service.get_unread_emails(
            days=settings.EMAIL_FETCH_DAYS,
            max_results=settings.EMAIL_FETCH_LIMIT
        )
        
        if not emails:
            return []
        
        summaries = []
        
        # Process each email
        for email_data in emails:
            # Check if email already exists
            existing_email = EmailRepository.get_email_by_email_id(db, email_data["email_id"])
            
            if existing_email:
                # Skip if already processed
                continue
            
            # Save email to database
            db_email = EmailRepository.create_email(db, email_data)
            
            # Generate summary
            summary_text = self.llm_service.summarize_email(
                email_data["subject"],
                email_data["body"]
            )
            
            if summary_text:
                # Save summary to database
                db_summary = SummaryRepository.create_summary(db, summary_text, db_email.id)
                
                # Prepare summary data for response
                summary_data = {
                    "id": db_email.id,
                    "email_id": db_email.email_id,
                    "sender": db_email.sender,
                    "subject": db_email.subject,
                    "received_at": db_email.received_at.isoformat(),
                    "summary_text": summary_text,
                    "created_at": db_summary.created_at.isoformat(),
                    "seen": False,
                    "summary_id": db_summary.id
                }
                
                summaries.append(summary_data)
                
                # Notify connected clients about new summary
                await connection_manager.broadcast_new_summary(summary_data)
        
        return summaries
    
    def get_email_summaries(self, db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get emails with their summaries
        
        Returns:
            List of email summaries
        """
        return SummaryRepository.get_email_with_summary(db, skip, limit)
    
    def mark_summary_as_seen(self, db: Session, summary_id: int) -> bool:
        """
        Mark a summary as seen
        
        Returns:
            True if successful, False otherwise
        """
        result = SummaryRepository.mark_as_seen(db, summary_id)
        return result is not None 