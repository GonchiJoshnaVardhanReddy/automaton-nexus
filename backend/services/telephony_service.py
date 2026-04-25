"""
Telephony Service - Exotel Integration (with mock fallback)
Handles outbound calls and webhooks
"""

import os
import aiohttp
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import json

# Mock mode for demo
MOCK_MODE = os.environ.get("TELEPHONY_MOCK_MODE", "true").lower() == "true"


class TelephonyService:
    """Service for telephony using Exotel API"""
    
    def __init__(self):
        self.api_key = os.environ.get("EXOTEL_API_KEY")
        self.api_token = os.environ.get("EXOTEL_API_TOKEN")
        self.account_sid = os.environ.get("EXOTEL_ACCOUNT_SID")
        self.subdomain = os.environ.get("EXOTEL_SUBDOMAIN", "api.exotel.com")
        self.caller_id = os.environ.get("EXOTEL_CALLER_ID")
        
        self.base_url = f"https://{self.subdomain}/v1/Accounts/{self.account_sid}"
        
        # Track active calls (in-memory for demo, use Redis in production)
        self.active_calls: Dict[str, Dict[str, Any]] = {}
    
    async def initiate_call(
        self,
        to_number: str,
        webhook_url: str,
        call_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Initiate an outbound call"""
        
        if MOCK_MODE:
            return await self._mock_initiate_call(to_number, call_data)
        
        async with aiohttp.ClientSession() as session:
            auth = aiohttp.BasicAuth(self.api_key, self.api_token)
            
            payload = {
                "From": self.caller_id,
                "To": to_number,
                "CallerId": self.caller_id,
                "StatusCallback": webhook_url,
                "CustomField": json.dumps(call_data)
            }
            
            async with session.post(
                f"{self.base_url}/Calls/connect.json",
                data=payload,
                auth=auth
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    call_sid = data.get("Call", {}).get("Sid")
                    
                    self.active_calls[call_sid] = {
                        "to_number": to_number,
                        "status": "initiated",
                        "started_at": datetime.utcnow(),
                        "data": call_data
                    }
                    
                    return {
                        "success": True,
                        "call_id": call_sid,
                        "status": "initiated"
                    }
                else:
                    return {
                        "success": False,
                        "error": await response.text()
                    }
    
    async def end_call(self, call_id: str) -> Dict[str, Any]:
        """End an active call"""
        
        if MOCK_MODE:
            return self._mock_end_call(call_id)
        
        async with aiohttp.ClientSession() as session:
            auth = aiohttp.BasicAuth(self.api_key, self.api_token)
            
            async with session.post(
                f"{self.base_url}/Calls/{call_id}.json",
                data={"Status": "completed"},
                auth=auth
            ) as response:
                if response.status == 200:
                    if call_id in self.active_calls:
                        self.active_calls[call_id]["status"] = "completed"
                    
                    return {"success": True, "status": "completed"}
                else:
                    return {"success": False, "error": await response.text()}
    
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """Get the status of a call"""
        
        if MOCK_MODE:
            return self._mock_get_status(call_id)
        
        async with aiohttp.ClientSession() as session:
            auth = aiohttp.BasicAuth(self.api_key, self.api_token)
            
            async with session.get(
                f"{self.base_url}/Calls/{call_id}.json",
                auth=auth
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "status": data.get("Call", {}).get("Status"),
                        "duration": data.get("Call", {}).get("Duration")
                    }
                else:
                    return {"success": False, "error": await response.text()}
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming webhook from Exotel"""
        
        call_sid = webhook_data.get("CallSid")
        status = webhook_data.get("Status", "").lower()
        duration = webhook_data.get("Duration", 0)
        
        if call_sid in self.active_calls:
            self.active_calls[call_sid]["status"] = status
            self.active_calls[call_sid]["duration"] = duration
        
        # Map Exotel status to our status
        status_map = {
            "ringing": "calling",
            "in-progress": "calling",
            "completed": "completed",
            "busy": "failed",
            "no-answer": "no_answer",
            "failed": "failed"
        }
        
        return {
            "call_id": call_sid,
            "status": status_map.get(status, status),
            "duration": duration,
            "custom_data": webhook_data.get("CustomField")
        }
    
    async def _mock_initiate_call(
        self,
        to_number: str,
        call_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Mock call initiation for demo"""
        
        call_id = f"mock_{uuid.uuid4().hex[:12]}"
        
        self.active_calls[call_id] = {
            "to_number": to_number,
            "status": "initiated",
            "started_at": datetime.utcnow(),
            "data": call_data,
            "mock": True
        }
        
        # Simulate call progression in background
        asyncio.create_task(self._simulate_call_progression(call_id))
        
        return {
            "success": True,
            "call_id": call_id,
            "status": "initiated",
            "mock": True
        }
    
    async def _simulate_call_progression(self, call_id: str):
        """Simulate call status changes for demo"""
        
        import random
        
        await asyncio.sleep(1)
        if call_id in self.active_calls:
            self.active_calls[call_id]["status"] = "ringing"
        
        await asyncio.sleep(2)
        if call_id in self.active_calls:
            # 80% chance of answer
            if random.random() < 0.8:
                self.active_calls[call_id]["status"] = "in-progress"
                
                # Call duration 30-180 seconds
                duration = random.randint(30, 180)
                await asyncio.sleep(min(duration / 10, 5))  # Accelerated for demo
                
                if call_id in self.active_calls:
                    self.active_calls[call_id]["status"] = "completed"
                    self.active_calls[call_id]["duration"] = duration
                    
                    # Random outcome
                    outcomes = ["confirmed", "rejected", "confirmed", "confirmed"]
                    self.active_calls[call_id]["outcome"] = random.choice(outcomes)
            else:
                self.active_calls[call_id]["status"] = "no-answer"
    
    def _mock_end_call(self, call_id: str) -> Dict[str, Any]:
        """Mock end call"""
        if call_id in self.active_calls:
            self.active_calls[call_id]["status"] = "completed"
            return {"success": True, "status": "completed", "mock": True}
        return {"success": False, "error": "Call not found"}
    
    def _mock_get_status(self, call_id: str) -> Dict[str, Any]:
        """Mock get status"""
        if call_id in self.active_calls:
            call = self.active_calls[call_id]
            return {
                "success": True,
                "status": call.get("status"),
                "duration": call.get("duration", 0),
                "outcome": call.get("outcome"),
                "mock": True
            }
        return {"success": False, "error": "Call not found"}


# Singleton instance
telephony_service = TelephonyService()
