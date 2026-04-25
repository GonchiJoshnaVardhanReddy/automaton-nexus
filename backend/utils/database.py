"""
Database Connection Utility
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

# Global database instance
_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance"""
    global _client, _db
    
    if _db is None:
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "automaton_nexus")
        
        _client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=1000,
            connectTimeoutMS=1000,
        )
        _db = _client[db_name]
        
        # Create indexes
        await create_indexes(_db)
    
    return _db


async def create_indexes(db: AsyncIOMotorDatabase):
    """Create database indexes for performance"""
    # Users
    await db.users.create_index("email", unique=True)
    
    # Agents
    await db.agents.create_index("user_id")
    await db.agents.create_index([("user_id", 1), ("status", 1)])
    
    # Campaigns
    await db.campaigns.create_index("user_id")
    await db.campaigns.create_index("agent_id")
    await db.campaigns.create_index([("user_id", 1), ("status", 1)])
    
    # Call Logs
    await db.call_logs.create_index("campaign_id")
    await db.call_logs.create_index("user_id")
    await db.call_logs.create_index([("campaign_id", 1), ("status", 1)])


async def close_database():
    """Close the database connection"""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
