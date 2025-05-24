from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Email schemas
class EmailBase(BaseModel):
    email_id: str
    sender: str
    subject: str
    body: str
    received_at: datetime

class EmailCreate(EmailBase):
    pass

class Email(EmailBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Email Summary schemas
class EmailSummaryBase(BaseModel):
    summary_text: str

class EmailSummaryCreate(EmailSummaryBase):
    email_id: int

class EmailSummary(EmailSummaryBase):
    id: int
    email_id: int
    created_at: datetime
    seen: bool
    
    class Config:
        from_attributes = True

# Combined schema for frontend
class EmailWithSummary(BaseModel):
    id: int
    email_id: str
    sender: str
    subject: str
    received_at: datetime
    summary_text: str
    created_at: datetime
    seen: bool
    
    class Config:
        from_attributes = True 