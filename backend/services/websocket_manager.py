"""
WebSocket Manager for Real-time Updates
"""

from typing import Dict, List, Set
from fastapi import WebSocket
import json
import asyncio


class WebSocketManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Map of user_id to their WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Map of campaign_id to subscribed user_ids
        self.campaign_subscribers: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "message": "WebSocket connection established"
        })
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    def subscribe_to_campaign(self, user_id: str, campaign_id: str):
        """Subscribe a user to campaign updates"""
        if campaign_id not in self.campaign_subscribers:
            self.campaign_subscribers[campaign_id] = set()
        
        self.campaign_subscribers[campaign_id].add(user_id)
    
    def unsubscribe_from_campaign(self, user_id: str, campaign_id: str):
        """Unsubscribe a user from campaign updates"""
        if campaign_id in self.campaign_subscribers:
            self.campaign_subscribers[campaign_id].discard(user_id)
    
    async def send_to_user(self, user_id: str, message: dict):
        """Send a message to a specific user"""
        if user_id in self.active_connections:
            disconnected = []
            
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json(message)
                except Exception:
                    disconnected.append(websocket)
            
            # Clean up disconnected sockets
            for ws in disconnected:
                self.disconnect(ws, user_id)
    
    async def broadcast_to_campaign(self, campaign_id: str, message: dict):
        """Broadcast a message to all subscribers of a campaign"""
        if campaign_id in self.campaign_subscribers:
            for user_id in self.campaign_subscribers[campaign_id]:
                await self.send_to_user(user_id, message)
    
    async def broadcast_call_update(
        self,
        campaign_id: str,
        call_id: str,
        phone_number: str,
        status: str,
        duration: int = 0,
        customer_name: str = None
    ):
        """Broadcast a call status update"""
        message = {
            "type": "call_update",
            "data": {
                "campaign_id": campaign_id,
                "call_id": call_id,
                "phone_number": phone_number,
                "status": status,
                "duration": duration,
                "customer_name": customer_name
            }
        }
        
        await self.broadcast_to_campaign(campaign_id, message)
    
    async def broadcast_campaign_update(
        self,
        campaign_id: str,
        status: str,
        stats: dict
    ):
        """Broadcast campaign status/stats update"""
        message = {
            "type": "campaign_update",
            "data": {
                "campaign_id": campaign_id,
                "status": status,
                "stats": stats
            }
        }
        
        await self.broadcast_to_campaign(campaign_id, message)


# Singleton instance
ws_manager = WebSocketManager()
