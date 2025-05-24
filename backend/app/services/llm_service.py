import requests
from typing import Optional
import logging
import re
import torch

# Add transformers imports
from transformers import T5Tokenizer, T5ForConditionalGeneration

from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.model_name = settings.HUGGINGFACE_MODEL
        self.mock_mode = True
        self.local_model = None
        self.tokenizer = None
        
        try:
            # Try loading the model locally
            logger.info(f"Attempting to load {self.model_name} locally")
            self.tokenizer = T5Tokenizer.from_pretrained(self.model_name)
            self.local_model = T5ForConditionalGeneration.from_pretrained(self.model_name)
            self.mock_mode = False
            logger.info(f"Successfully loaded {self.model_name} locally")
        except Exception as e:
            logger.error(f"Error loading model locally: {str(e)}")
            logger.warning("Falling back to mock mode")
            self.mock_mode = True
    
    def summarize_email(self, subject: str, body: str, max_length: int = 100) -> Optional[str]:
        """
        Summarize email using Flan-T5 model
        
        Args:
            subject: Email subject
            body: Email body text
            max_length: Maximum length of the summary in words
            
        Returns:
            Summary text as a string of bullet points
        """
        logger.info(f"Summarizing email: {subject}")
        
        # If in mock mode, return a mock summary
        if self.mock_mode:
            logger.warning("Using mock summarization (no model loaded)")
            
            # Truncate the body for the log message
            short_body = body[:50] + "..." if len(body) > 50 else body
            logger.info(f"Would summarize: Subject: {subject}, Body: {short_body}")
            
            # Generate a mock summary based on the subject (case insensitive matching)
            subject_lower = subject.lower()
            
            # Meeting related emails
            if re.search(r'meeting|conference|discussion', subject_lower):
                return "• Meeting scheduled for project discussion.\n• Attendance required for all team members.\n• Prepare progress updates before the meeting.\n• Please review the agenda before attending."
            
            # Report related emails
            elif re.search(r'report|quarterly|review|budget', subject_lower):
                return "• Quarterly report is due by end of week.\n• Include sales figures and customer metrics.\n• Send draft for review before final submission.\n• Financial data must be verified by accounting."
            
            # Project related emails
            elif re.search(r'project|proposal|plan', subject_lower):
                return "• New project proposal requires immediate attention.\n• Timeline estimation needed by Friday.\n• Resource allocation should be discussed with department heads.\n• Client is expecting preliminary feedback next week."
            
            # Website/Tech related emails
            elif re.search(r'website|update|tech|maintenance', subject_lower):
                return "• Website updates scheduled for this weekend.\n• Backup systems will be tested during maintenance.\n• Expected downtime is approximately 2 hours.\n• Users have been notified of the planned maintenance."
            
            # Training related emails
            elif re.search(r'training|session|learn|tool', subject_lower):
                return "• Training session scheduled for new company tools.\n• All departments expected to attend.\n• Pre-training materials have been shared via email.\n• Please prepare questions in advance."
            
            # Welcome/HR related emails
            elif re.search(r'welcome|team|hr|holiday|schedule', subject_lower):
                return "• Welcome information for new team members.\n• Company policies and guidelines attached.\n• Schedule a meeting with HR for benefits enrollment.\n• Office tour scheduled for Friday morning."
            
            # Client/Feedback related emails
            elif re.search(r'client|feedback|customer|release', subject_lower):
                return "• Client feedback regarding the latest product release.\n• Overall positive response with minor concerns.\n• Development team should address UI issues.\n• Follow-up meeting with client scheduled for next week."
            
            # Default summary for other subjects
            else:
                return "• Important email requires your attention.\n• Action items need to be addressed within 24 hours.\n• Coordinate with relevant team members as needed.\n• Reply to confirm receipt of this information."
        
        try:
            # Prepare prompt for the model
            truncated_body = body[:1000] if len(body) > 1000 else body
            input_text = f"summarize: Subject: {subject}\n\nBody: {truncated_body}"
            
            logger.info("Running local model inference")
            
            # Generate summary using local model
            input_ids = self.tokenizer(input_text, return_tensors="pt").input_ids
            
            outputs = self.local_model.generate(
                input_ids,
                max_length=150,
                temperature=0.3,
                repetition_penalty=1.2,
                num_beams=4,
                early_stopping=True
            )
            
            raw_summary = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            logger.info(f"Raw summary from model: {raw_summary[:100]}...")
            
            # Format the summary as bullet points if needed
            if not any(line.strip().startswith('•') or line.strip().startswith('-') for line in raw_summary.split('\n')):
                logger.info("Converting summary to bullet points")
                sentences = [s.strip() for s in raw_summary.split('.') if s.strip()]
                formatted_summary = '\n'.join(f"• {s}." for s in sentences)
            else:
                formatted_summary = raw_summary
            
            return formatted_summary
            
        except Exception as e:
            logger.error(f"Error running local model: {str(e)}", exc_info=True)
            return "Error generating summary." 