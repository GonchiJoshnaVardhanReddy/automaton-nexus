"""
Results/Analytics Routes
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

from models.schemas import DashboardStats, CallLogResponse, CallStatus
from utils.auth import get_current_user
from utils.database import get_database

router = APIRouter(prefix="/results", tags=["Results"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user),
    days: int = 7
):
    """Get dashboard statistics"""
    db = await get_database()
    
    # Date filter
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get call logs
    call_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_calls": {"$sum": 1},
                "confirmed": {
                    "$sum": {"$cond": [{"$eq": ["$status", CallStatus.CONFIRMED.value]}, 1, 0]}
                },
                "rejected": {
                    "$sum": {"$cond": [{"$eq": ["$status", CallStatus.REJECTED.value]}, 1, 0]}
                },
                "total_duration": {"$sum": "$duration_seconds"},
                "customers": {"$addToSet": "$phone_number"}
            }
        }
    ]
    
    call_stats = await db.call_logs.aggregate(call_pipeline).to_list(length=1)
    
    # Get active agents count
    active_agents = await db.agents.count_documents({
        "user_id": user_id,
        "status": "active"
    })
    
    if call_stats:
        stats = call_stats[0]
        total = stats["total_calls"]
        confirmed = stats["confirmed"]
        rejected = stats["rejected"]
        avg_duration = int(stats["total_duration"] / total) if total > 0 else 0
        success_rate = round((confirmed / total * 100), 1) if total > 0 else 0
        customers = len(stats.get("customers", []))
    else:
        total = confirmed = rejected = avg_duration = customers = 0
        success_rate = 0.0
    
    return DashboardStats(
        total_calls=total,
        confirmed=confirmed,
        rejected=rejected,
        success_rate=success_rate,
        avg_duration_seconds=avg_duration,
        active_agents=active_agents,
        customers_reached=customers
    )


@router.get("/calls", response_model=List[CallLogResponse])
async def get_all_calls(
    user_id: str = Depends(get_current_user),
    status: Optional[CallStatus] = None,
    limit: int = 100,
    skip: int = 0
):
    """Get all call logs with optional filtering"""
    db = await get_database()
    
    query = {"user_id": user_id}
    if status:
        query["status"] = status.value
    
    cursor = db.call_logs.find(query).sort("created_at", -1).skip(skip).limit(limit)
    calls = await cursor.to_list(length=limit)
    
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


@router.get("/calls/{call_id}", response_model=CallLogResponse)
async def get_call_details(
    call_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get detailed info for a specific call"""
    db = await get_database()
    
    call = await db.call_logs.find_one({
        "_id": ObjectId(call_id),
        "user_id": user_id
    })
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call log not found"
        )
    
    return CallLogResponse(
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


@router.get("/daily")
async def get_daily_stats(
    user_id: str = Depends(get_current_user),
    days: int = 7
):
    """Get daily call statistics"""
    db = await get_database()
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "total": {"$sum": 1},
                "confirmed": {
                    "$sum": {"$cond": [{"$eq": ["$status", CallStatus.CONFIRMED.value]}, 1, 0]}
                },
                "rejected": {
                    "$sum": {"$cond": [{"$eq": ["$status", CallStatus.REJECTED.value]}, 1, 0]}
                }
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.call_logs.aggregate(pipeline).to_list(length=days)
    
    return [
        {
            "date": r["_id"],
            "total": r["total"],
            "confirmed": r["confirmed"],
            "rejected": r["rejected"],
            "success_rate": round((r["confirmed"] / r["total"] * 100), 1) if r["total"] > 0 else 0
        }
        for r in results
    ]
