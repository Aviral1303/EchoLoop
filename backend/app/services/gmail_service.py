import os
import base64
import email
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import html2text
import pickle

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("gmail_service")

class GmailService:
    def __init__(self):
        self.service = None
        self.use_mock = True  # Default to mock mode for development
        self.credentials_path = os.path.join(os.getcwd(), "credentials.json")
        self.token_path = os.path.join(os.getcwd(), "token.pickle")
        self.initialize_service()
    
    def initialize_service(self):
        """Initialize the Gmail API service with OAuth credentials if available."""
        try:
            logger.info("Initializing Gmail service")
            
            # Check if credentials file exists
            if not os.path.exists(self.credentials_path):
                logger.warning(f"Credentials file not found: {self.credentials_path}. Using mock mode.")
                logger.info("Using mock mode for Gmail service")
                return False
            
            # Try to use stored token if it exists
            creds = None
            if os.path.exists(self.token_path):
                with open(self.token_path, 'rb') as token:
                    creds = pickle.load(token)
            
            # If there are no valid credentials, we'll stay in mock mode
            if not creds or not creds.valid:
                logger.info("No valid credentials found. Using mock mode for Gmail service")
                return False
            
            # Build Gmail API service
            self.service = build('gmail', 'v1', credentials=creds)
            self.use_mock = False
            logger.info("Gmail service initialized with OAuth credentials")
            return True
                
        except Exception as e:
            logger.error(f"Error initializing Gmail service: {str(e)}", exc_info=True)
            logger.info("Using mock mode for Gmail service")
            return False
    
    def get_auth_url(self):
        """Generate OAuth authorization URL."""
        try:
            SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
            flow = InstalledAppFlow.from_client_secrets_file(
                self.credentials_path, SCOPES)
            flow.redirect_uri = 'http://localhost:8000/api/v1/auth/callback'
            auth_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='consent'
            )
            return auth_url
        except Exception as e:
            logger.error(f"Error generating auth URL: {str(e)}", exc_info=True)
            return None
    
    def get_credentials_from_code(self, code):
        """Exchange authorization code for credentials."""
        try:
            SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
            flow = InstalledAppFlow.from_client_secrets_file(
                self.credentials_path, SCOPES)
            flow.redirect_uri = 'http://localhost:8000/api/v1/auth/callback'
            flow.fetch_token(code=code)
            creds = flow.credentials
            
            # Save the credentials for future use
            with open(self.token_path, 'wb') as token:
                pickle.dump(creds, token)
            
            # Initialize service with new credentials
            self.service = build('gmail', 'v1', credentials=creds)
            self.use_mock = False
            
            return True
        except Exception as e:
            logger.error(f"Error getting credentials from code: {str(e)}", exc_info=True)
            return False
    
    def get_unread_emails(self, days: int = 7, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch unread emails from the last specified number of days.
        
        Args:
            days: Number of days back to fetch emails from
            max_results: Maximum number of emails to fetch
            
        Returns:
            List of email dictionaries with id, sender, subject, body, and received time
        """
        # Return mock data if service is not available or using mock mode
        if self.use_mock or not self.service:
            logger.info("Using mock email data")
            return self._get_mock_emails(max_results)
        
        # Calculate the date for filtering
        after_date = datetime.utcnow() - timedelta(days=days)
        after_str = after_date.strftime('%Y/%m/%d')
        
        # Create query for unread messages after the specified date
        query = f"is:unread after:{after_str}"
        
        try:
            logger.info(f"Fetching unread emails with query: {query}")
            # List messages matching the query
            results = self.service.users().messages().list(
                userId='me', 
                q=query, 
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            logger.info(f"Found {len(messages)} unread messages")
            
            for message in messages:
                msg_id = message['id']
                msg = self.service.users().messages().get(userId='me', id=msg_id).execute()
                
                # Extract email details
                email_data = self._parse_message(msg)
                if email_data:
                    emails.append(email_data)
            
            return emails
        except Exception as e:
            logger.error(f"Error fetching unread emails: {str(e)}", exc_info=True)
            return self._get_mock_emails(max_results)
    
    def get_user_profile(self):
        """Get the current user's Gmail profile."""
        if self.use_mock or not self.service:
            return {"email": "mock.user@example.com", "name": "Mock User"}
        
        try:
            profile = self.service.users().getProfile(userId='me').execute()
            return profile
        except Exception as e:
            logger.error(f"Error getting user profile: {str(e)}", exc_info=True)
            return None
    
    def _parse_message(self, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Gmail message into structured data."""
        try:
            # Get message headers
            headers = message['payload']['headers']
            
            # Extract subject and sender
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            
            # Extract date
            date_str = next((h['value'] for h in headers if h['name'] == 'Date'), None)
            if date_str:
                # Parse the date (this is simplified, might need better parsing for all date formats)
                try:
                    received_at = datetime.strptime(date_str.split('+')[0].strip(), '%a, %d %b %Y %H:%M:%S')
                except Exception as date_error:
                    logger.warning(f"Could not parse date '{date_str}': {date_error}")
                    received_at = datetime.utcnow()
            else:
                received_at = datetime.utcnow()
            
            # Extract body
            body = self._get_message_body(message)
            
            return {
                'email_id': message['id'],
                'sender': sender,
                'subject': subject,
                'body': body,
                'received_at': received_at
            }
        except Exception as e:
            logger.error(f"Error parsing message: {str(e)}", exc_info=True)
            return None
    
    def _get_message_body(self, message: Dict[str, Any]) -> str:
        """Extract the message body from the Gmail message."""
        try:
            # Check if the message has parts
            if 'parts' in message['payload']:
                for part in message['payload']['parts']:
                    if part['mimeType'] == 'text/plain' and 'data' in part['body']:
                        data = part['body']['data']
                        text = base64.urlsafe_b64decode(data).decode('utf-8')
                        return text
                    elif part['mimeType'] == 'text/html' and 'data' in part['body']:
                        data = part['body']['data']
                        html = base64.urlsafe_b64decode(data).decode('utf-8')
                        # Convert HTML to plain text
                        h = html2text.HTML2Text()
                        h.ignore_links = False
                        return h.handle(html)
            
            # If no parts, check if the body is directly in the payload
            if 'body' in message['payload'] and 'data' in message['payload']['body']:
                data = message['payload']['body']['data']
                text = base64.urlsafe_b64decode(data).decode('utf-8')
                return text
            
            return "(No body)"
        except Exception as e:
            logger.error(f"Error extracting message body: {str(e)}", exc_info=True)
            return "(Error extracting body)"
    
    def _get_mock_emails(self, count: int = 5) -> List[Dict[str, Any]]:
        """Generate mock emails for testing purposes."""
        logger.info(f"Generating {count} mock emails")
        mock_emails = []
        
        mock_subjects = [
            "Team Meeting Next Week",
            "Quarterly Report Due",
            "New Project Proposal",
            "Website Update Progress",
            "Budget Review Meeting",
            "Client Feedback on Latest Release",
            "Holiday Schedule",
            "Office Maintenance Notice",
            "Training Session: New Tools",
            "Welcome to the Team!"
        ]
        
        mock_senders = [
            "John Doe <john.doe@example.com>",
            "Jane Smith <jane.smith@example.com>",
            "Project Team <project@example.com>",
            "HR Department <hr@example.com>",
            "Tech Support <support@example.com>"
        ]
        
        mock_bodies = [
            "Please review the attached documents before our meeting on Friday.",
            "I wanted to follow up on our conversation yesterday. Can we schedule a call to discuss next steps?",
            "The quarterly report is due next week. Please make sure to submit your section by Wednesday.",
            "We're excited to announce that we'll be launching the new website next month. Here are some previews.",
            "There will be scheduled maintenance this weekend. Please save all your work before leaving on Friday."
        ]
        
        now = datetime.utcnow()
        
        for i in range(min(count, len(mock_subjects))):
            mock_email = {
                'email_id': f"mock-{i}-{now.timestamp()}",
                'sender': mock_senders[i % len(mock_senders)],
                'subject': mock_subjects[i],
                'body': mock_bodies[i % len(mock_bodies)],
                'received_at': now - timedelta(hours=i*3)  # Spread out over time
            }
            mock_emails.append(mock_email)
        
        return mock_emails 