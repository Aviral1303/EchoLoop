from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String, unique=True, index=True)  # Gmail message ID
    sender = Column(String)
    subject = Column(String)
    body = Column(Text)
    received_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with EmailSummary
    summary = relationship("EmailSummary", back_populates="email", uselist=False)

class EmailSummary(Base):
    __tablename__ = "email_summaries"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("emails.id", ondelete="CASCADE"))
    summary_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    seen = Column(Boolean, default=False)
    
    # Relationship with Email
    email = relationship("Email", back_populates="summary") 