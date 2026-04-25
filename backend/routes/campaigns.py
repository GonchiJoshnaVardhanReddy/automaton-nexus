"""
Campaign Routes - Create and manage calling campaigns
"""

from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from typing import List
from datetime import datetime
from bson import ObjectId
import asyncio

from models.schemas import (
    CampaignCreate, CampaignResponse, CampaignStatus, CampaignInDB,
    CallStatus, CallLogResponse
)
from utils.auth import get_current_user
from utils.database import get_database
from services.telephony_service import telephony_service
from services.websocket_manager import ws_manager

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


async def execute_campaign(campaign_id: str, user_id: str):
    """Background task to execute campaign calls"""
    db = await get_database()
    
    # Get campaign
    campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
    if not campaign:
        return
    
    # Get agent
    agent = await db.agents.find_one({"_id": ObjectId(campaign["agent_id"])})
    if not agent:
        return
    
    # Update campaign status to running
    await db.campaigns.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$set": {"status": CampaignStatus.RUNNING.value, "started_at": datetime.utcnow()}}
    )
    
    # Broadcast campaign start
    await ws_manager.broadcast_campaign_update(
        campaign_id,
        CampaignStatus.RUNNING.value,
        {"total_calls": len(campaign["phone_numbers"]), "completed_calls": 0}
    )
    
    completed = 0
    confirmed = 0
    rejected = 0
    failed = 0
    
    # Process calls (in batches for demo, use queue in production)
    for entry in campaign["phone_numbers"]:
        # Create call log
        call_log = {
            "campaign_id": campaign_id,
            "agent_id": campaign["agent_id"],
            "user_id": user_id,
            "phone_number": entry["phone_number"],
            "customer_name": entry.get("customer_name"),
            "status": CallStatus.PENDING.value,
            "transcript": [],
            "duration_seconds": 0,
            "created_at": datetime.utcnow()
        }
        
        call_result = await db.call_logs.insert_one(call_log)
        call_id = str(call_result.inserted_id)
        
        # Initiate call
        call_data = {
            "call_log_id": call_id,
            "campaign_id": campaign_id,
            "agent_id": campaign["agent_id"],
            "customer_name": entry.get("customer_name"),
            "context": entry.get("context", {})
        }
        
        result = await telephony_service.initiate_call(
            to_number=entry["phone_number"],
            webhook_url=f"/api/webhooks/exotel",
            call_data=call_data
        )
        
        if result["success"]:
            await db.call_logs.update_one(
                {"_id": ObjectId(call_id)},
                {"$set": {
                    "exotel_call_id": result["call_id"],
                    "status": CallStatus.CALLING.value,
                    "started_at": datetime.utcnow()
                }}
            )
            
            # Broadcast call started
            await ws_manager.broadcast_call_update(
                campaign_id, call_id, entry["phone_number"],
                CallStatus.CALLING.value, 0, entry.get("customer_name")
            )
            
            # Wait for call to complete (in mock mode)
            await asyncio.sleep(3)  # Simulate call duration
            
            # Check call status
            status_result = telephony_service._mock_get_status(result["call_id"])
            
            final_status = CallStatus.CONFIRMED.value
            duration = 0
            
            if status_result["success"]:
                outcome = status_result.get("outcome", "confirmed")
                duration = status_result.get("duration", 60)
                
                if outcome == "confirmed":
                    final_status = CallStatus.CONFIRMED.value
                    confirmed += 1
                elif outcome == "rejected":
                    final_status = CallStatus.REJECTED.value
                    rejected += 1
                elif status_result.get("status") == "no-answer":
                    final_status = CallStatus.NO_ANSWER.value
                    failed += 1
                else:
                    final_status = CallStatus.FAILED.value
                    failed += 1
            else:
                final_status = CallStatus.FAILED.value
                failed += 1
            
            # Update call log
            await db.call_logs.update_one(
                {"_id": ObjectId(call_id)},
                {"$set": {
                    "status": final_status,
                    "duration_seconds": duration,
                    "ended_at": datetime.utcnow()
                }}
            )
            
            # Broadcast call update
            await ws_manager.broadcast_call_update(
                campaign_id, call_id, entry["phone_number"],
                final_status, duration, entry.get("customer_name")
            )
        else:
            await db.call_logs.update_one(
                {"_id": ObjectId(call_id)},
                {"$set": {"status": CallStatus.FAILED.value}}
            )
            failed += 1
        
        completed += 1
        
        # Update campaign stats
        await db.campaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": {
                "completed_calls": completed,
                "confirmed_calls": confirmed,
                "rejected_calls": rejected,
                "failed_calls": failed
            }}
        )
        
        # Broadcast progress
        await ws_manager.broadcast_campaign_update(
            campaign_id,
            CampaignStatus.RUNNING.value,
            {
                "total_calls": len(campaign["phone_numbers"]),
                "completed_calls": completed,
                "confirmed_calls": confirmed,
                "rejected_calls": rejected,
                "failed_calls": failed
            }
        )
    
    # Campaign completed
    await db.campaigns.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$set": {
            "status": CampaignStatus.COMPLETED.value,
            "completed_at": datetime.utcnow()
        }}
    )
    
    # Update agent stats
    total_agent_calls = agent.get("total_calls", 0) + completed
    total_confirmed = confirmed
    new_success_rate = (total_confirmed / completed * 100) if completed > 0 else 0
    
    await db.agents.update_one(
        {"_id": ObjectId(campaign["agent_id"])},
        {"$set": {
            "total_calls": total_agent_calls,
            "success_rate": new_success_rate
        }}
    )
    
    # Broadcast completion
    await ws_manager.broadcast_campaign_update(
        campaign_id,
        CampaignStatus.COMPLETED.value,
        {
            "total_calls": len(campaign["phone_numbers"]),
            "completed_calls": completed,
            "confirmed_calls": confirmed,
            "rejected_calls": rejected,
            "failed_calls": failed
        }
    )


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    user_id: str = Depends(get_current_user)
):
    """Create a new campaign"""
    db = await get_database()
    
    # Verify agent exists and belongs to user
    agent = await db.agents.find_one({
        "_id": ObjectId(campaign_data.agent_id),
        "user_id": user_id
    })
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Create campaign
    campaign_doc = {
        "name": campaign_data.name or f"Campaign {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        "agent_id": campaign_data.agent_id,
        "user_id": user_id,
        "phone_numbers": [entry.model_dump() for entry in campaign_data.phone_numbers],
        "order_context": campaign_data.order_context,
        "status": CampaignStatus.PENDING.value,
        "total_calls": len(campaign_data.phone_numbers),
        "completed_calls": 0,
        "confirmed_calls": 0,
        "rejected_calls": 0,
        "failed_calls": 0,
        "created_at": datetime.utcnow()
    }
    
    result = await db.campaigns.insert_one(campaign_doc)
    campaign_doc["_id"] = result.inserted_id
    
    return CampaignResponse(
        id=str(campaign_doc["_id"]),
        name=campaign_doc["name"],
        agent_id=campaign_doc["agent_id"],
        user_id=campaign_doc["user_id"],
        status=campaign_doc["status"],
        total_calls=campaign_doc["total_calls"],
        completed_calls=campaign_doc["completed_calls"],
        confirmed_calls=campaign_doc["confirmed_calls"],
        rejected_calls=campaign_doc["rejected_calls"],
        failed_calls=campaign_doc["failed_calls"],
        created_at=campaign_doc["created_at"],
        started_at=None,
        completed_at=None
    )


@router.post("/{campaign_id}/start", response_model=CampaignResponse)
async def start_campaign(
    campaign_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    """Start a campaign (begin making calls)"""
    db = await get_database()
    
    campaign = await db.campaigns.find_one({
        "_id": ObjectId(campaign_id),
        "user_id": user_id
    })
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign["status"] not in [CampaignStatus.PENDING.value, CampaignStatus.PAUSED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start campaign with status: {campaign['status']}"
        )
    
    # Subscribe user to campaign updates
    ws_manager.subscribe_to_campaign(user_id, campaign_id)
    
    # Start campaign execution in background
    background_tasks.add_task(execute_campaign, campaign_id, user_id)
    
    return CampaignResponse(
        id=str(campaign["_id"]),
        name=campaign["name"],
        agent_id=campaign["agent_id"],
        user_id=campaign["user_id"],
        status=CampaignStatus.RUNNING.value,
        total_calls=campaign["total_calls"],
        completed_calls=campaign["completed_calls"],
        confirmed_calls=campaign["confirmed_calls"],
        rejected_calls=campaign["rejected_calls"],
        failed_calls=campaign["failed_calls"],
        created_at=campaign["created_at"],
        started_at=datetime.utcnow(),
        completed_at=None
    )


@router.get("", response_model=List[CampaignResponse])
async def get_campaigns(
    user_id: str = Depends(get_current_user),
    status: CampaignStatus = None
):
    """Get all campaigns for the current user"""
    db = await get_database()
    
    query = {"user_id": user_id}
    if status:
        query["status"] = status.value
    
    cursor = db.campaigns.find(query).sort("created_at", -1)
    campaigns = await cursor.to_list(length=100)
    
    return [
        CampaignResponse(
            id=str(c["_id"]),
            name=c["name"],
            agent_id=c["agent_id"],
            user_id=c["user_id"],
            status=c["status"],
            total_calls=c["total_calls"],
            completed_calls=c["completed_calls"],
            confirmed_calls=c["confirmed_calls"],
            rejected_calls=c["rejected_calls"],
            failed_calls=c["failed_calls"],
            created_at=c["created_at"],
            started_at=c.get("started_at"),
            completed_at=c.get("completed_at")
        )
        for c in campaigns
    ]


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get a specific campaign"""
    db = await get_database()
    
    campaign = await db.campaigns.find_one({
        "_id": ObjectId(campaign_id),
        "user_id": user_id
    })
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return CampaignResponse(
        id=str(campaign["_id"]),
        name=campaign["name"],
        agent_id=campaign["agent_id"],
        user_id=campaign["user_id"],
        status=campaign["status"],
        total_calls=campaign["total_calls"],
        completed_calls=campaign["completed_calls"],
        confirmed_calls=campaign["confirmed_calls"],
        rejected_calls=campaign["rejected_calls"],
        failed_calls=campaign["failed_calls"],
        created_at=campaign["created_at"],
        started_at=campaign.get("started_at"),
        completed_at=campaign.get("completed_at")
    )


@router.post("/{campaign_id}/pause")
async def pause_campaign(
    campaign_id: str,
    user_id: str = Depends(get_current_user)
):
    """Pause a running campaign"""
    db = await get_database()
    
    result = await db.campaigns.update_one(
        {
            "_id": ObjectId(campaign_id),
            "user_id": user_id,
            "status": CampaignStatus.RUNNING.value
        },
        {"$set": {"status": CampaignStatus.PAUSED.value}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Running campaign not found"
        )
    
    return {"message": "Campaign paused"}


@router.get("/{campaign_id}/calls", response_model=List[CallLogResponse])
async def get_campaign_calls(
    campaign_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get all call logs for a campaign"""
    db = await get_database()
    
    # Verify campaign belongs to user
    campaign = await db.campaigns.find_one({
        "_id": ObjectId(campaign_id),
        "user_id": user_id
    })
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    cursor = db.call_logs.find({"campaign_id": campaign_id}).sort("created_at", -1)
    calls = await cursor.to_list(length=1000)
    
    return [
        CallLogResponse(
            id=str(call["_id"]),
            campaign_id=call["campaign_id"],
            agent_id=call["agent_id"],
            phone_number=call["phone_number"],
            customer_name=call.get("customer_name"),
            status=call["status"],
            transcript=call.get("transcript", []),
            duration_seconds=call.get("duration_seconds", 0),
            started_at=call.get("started_at"),
            ended_at=call.get("ended_at")
        )
        for call in calls
    ]
