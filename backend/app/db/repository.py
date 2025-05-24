from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.models.email import Email, EmailSummary
from app.models.schema import EmailCreate, EmailSummaryCreate

class EmailRepository:
    @staticmethod
    def create_email(db: Session, email_data: Dict[str, Any]) -> Email:
        """Create a new email record"""
        db_email = Email(
            email_id=email_data["email_id"],
            sender=email_data["sender"],
            subject=email_data["subject"],
            body=email_data["body"],
            received_at=email_data["received_at"]
        )
        db.add(db_email)
        db.commit()
        db.refresh(db_email)
        return db_email
    
    @staticmethod
    def get_email_by_email_id(db: Session, email_id: str) -> Optional[Email]:
        """Get an email by its Gmail ID"""
        return db.query(Email).filter(Email.email_id == email_id).first()
    
    @staticmethod
    def get_emails(db: Session, skip: int = 0, limit: int = 100) -> List[Email]:
        """Get a list of emails"""
        return db.query(Email).order_by(desc(Email.received_at)).offset(skip).limit(limit).all()


class SummaryRepository:
    @staticmethod
    def create_summary(db: Session, summary_text: str, email_id: int) -> EmailSummary:
        """Create a new email summary"""
        db_summary = EmailSummary(
            summary_text=summary_text,
            email_id=email_id
        )
        db.add(db_summary)
        db.commit()
        db.refresh(db_summary)
        return db_summary
    
    @staticmethod
    def get_summary_by_email_id(db: Session, email_id: int) -> Optional[EmailSummary]:
        """Get a summary by email ID"""
        return db.query(EmailSummary).filter(EmailSummary.email_id == email_id).first()
    
    @staticmethod
    def get_summaries(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        seen: Optional[bool] = None
    ) -> List[EmailSummary]:
        """Get a list of summaries with optional filtering by seen status"""
        query = db.query(EmailSummary)
        
        if seen is not None:
            query = query.filter(EmailSummary.seen == seen)
            
        return query.order_by(desc(EmailSummary.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def mark_as_seen(db: Session, summary_id: int) -> Optional[EmailSummary]:
        """Mark a summary as seen"""
        db_summary = db.query(EmailSummary).filter(EmailSummary.id == summary_id).first()
        if db_summary:
            db_summary.seen = True
            db.commit()
            db.refresh(db_summary)
        return db_summary
    
    @staticmethod
    def get_email_with_summary(db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get emails with their summaries for the frontend"""
        result = db.query(
            Email.id, 
            Email.email_id,
            Email.sender,
            Email.subject,
            Email.received_at,
            EmailSummary.summary_text,
            EmailSummary.created_at,
            EmailSummary.seen,
            EmailSummary.id.label("summary_id")
        ).join(
            EmailSummary, 
            Email.id == EmailSummary.email_id
        ).order_by(
            desc(EmailSummary.created_at)
        ).offset(skip).limit(limit).all()
        
        # Convert to list of dictionaries
        return [dict(row._mapping) for row in result] 