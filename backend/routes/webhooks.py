"""
Webhook Routes - Handle callbacks from external services
"""

from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from datetime import datetime
from bson import ObjectId
import json

from utils.database import get_database
from services.telephony_service import telephony_service
from services.websocket_manager import ws_manager
from models.schemas import CallStatus

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/exotel")
async def exotel_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Exotel call status webhooks"""
    
    try:
        # Parse form data (Exotel sends form-encoded data)
        form_data = await request.form()
        webhook_data = dict(form_data)
    except Exception:
        # Try JSON if form parsing fails
        try:
            webhook_data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid webhook data")
    
    # Process webhook
    processed = telephony_service.process_webhook(webhook_data)
    
    call_id = processed.get("call_id")
    status = processed.get("status")
    duration = processed.get("duration", 0)
    
    # Get custom data
    custom_data = {}
    if processed.get("custom_data"):
        try:
            custom_data = json.loads(processed["custom_data"])
        except json.JSONDecodeError:
            pass
    
    call_log_id = custom_data.get("call_log_id")
    campaign_id = custom_data.get("campaign_id")
    
    if call_log_id:
        db = await get_database()
        
        # Map status
        status_map = {
            "calling": CallStatus.CALLING.value,
            "completed": CallStatus.CONFIRMED.value,  # Will be updated based on conversation
            "no_answer": CallStatus.NO_ANSWER.value,
            "failed": CallStatus.FAILED.value
        }
        
        final_status = status_map.get(status, CallStatus.FAILED.value)
        
        # Update call log
        update_data = {
            "status": final_status,
            "exotel_call_id": call_id
        }
        
        if status == "completed":
            update_data["duration_seconds"] = duration
            update_data["ended_at"] = datetime.utcnow()
        
        await db.call_logs.update_one(
            {"_id": ObjectId(call_log_id)},
            {"$set": update_data}
        )
        
        # Broadcast update via WebSocket
        if campaign_id:
            call_log = await db.call_logs.find_one({"_id": ObjectId(call_log_id)})
            if call_log:
                await ws_manager.broadcast_call_update(
                    campaign_id,
                    call_log_id,
                    call_log["phone_number"],
                    final_status,
                    duration,
                    call_log.get("customer_name")
                )
    
    return {"status": "received"}


@router.post("/voice-response")
async def voice_response_webhook(request: Request):
    """
    Handle voice response events during a call.
    This is called when the user speaks and we need to process their response.
    """
    
    try:
        data = await request.json()
    except Exception:
        data = dict(await request.form())
    
    call_id = data.get("call_id") or data.get("CallSid")
    speech_text = data.get("speech_text") or data.get("SpeechResult")
    
    # In a real implementation, this would:
    # 1. Get the call context from the call_log
    # 2. Process the speech through LLM
    # 3. Generate response
    # 4. Convert to TTS
    # 5. Play back to user
    
    # For now, return a simple response
    return {
        "action": "speak",
        "text": "Thank you for your response. Is there anything else I can help you with?",
        "voice": "en-IN-NeerjaNeural"
    }


@router.post("/call-complete")
async def call_complete_webhook(request: Request):
    """Handle call completion event"""
    
    try:
        data = await request.json()
    except Exception:
        data = dict(await request.form())
    
    call_id = data.get("call_id") or data.get("CallSid")
    duration = data.get("duration") or data.get("Duration", 0)
    status = data.get("status") or data.get("Status", "completed")
    
    db = await get_database()
    
    # Find and update call log by Exotel call ID
    call_log = await db.call_logs.find_one({"exotel_call_id": call_id})
    
    if call_log:
        await db.call_logs.update_one(
            {"_id": call_log["_id"]},
            {"$set": {
                "status": CallStatus.CONFIRMED.value if status == "completed" else CallStatus.FAILED.value,
                "duration_seconds": int(duration),
                "ended_at": datetime.utcnow()
            }}
        )
        
        # Broadcast update
        await ws_manager.broadcast_call_update(
            call_log["campaign_id"],
            str(call_log["_id"]),
            call_log["phone_number"],
            CallStatus.CONFIRMED.value if status == "completed" else CallStatus.FAILED.value,
            int(duration),
            call_log.get("customer_name")
        )
    
    return {"status": "processed"}
