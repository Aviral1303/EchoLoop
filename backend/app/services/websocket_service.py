from typing import Dict, List, Set, Any
import json
import asyncio
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    """
    Manages WebSocket connections for real-time notifications
    """
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Connect a new client"""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Disconnect a client"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients"""
        disconnected = []
        
        # Convert the message to JSON
        json_message = json.dumps(message)
        
        for connection in self.active_connections:
            try:
                await connection.send_text(json_message)
            except Exception as e:
                print(f"Error broadcasting message: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)
    
    async def broadcast_new_summary(self, summary_data: Dict[str, Any]):
        """
        Broadcast a notification about a new email summary
        
        Args:
            summary_data: Dictionary with summary information
        """
        notification = {
            "type": "new_summary",
            "data": summary_data
        }
        await self.broadcast(notification)

# Create a singleton instance
connection_manager = ConnectionManager() 