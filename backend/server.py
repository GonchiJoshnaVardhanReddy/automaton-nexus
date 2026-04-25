"""
Automaton Nexus - AI Voice Agents Backend
Main Server Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes.auth import router as auth_router
from routes.agents import router as agents_router
from routes.campaigns import router as campaigns_router
from routes.results import router as results_router
from routes.webhooks import router as webhooks_router
from routes.skills import router as skills_router

# Import utilities
from utils.database import get_database, close_database
from utils.auth import decode_token
from utils.seed_skills import seed_default_skills
from services.websocket_manager import ws_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    # Startup
    print("🚀 Starting Automaton Nexus Backend...")
    try:
        await get_database()
        print("✅ Database connected")
    except Exception as exc:
        print(f"⚠️ Database unavailable, starting without MongoDB: {exc}")

    await seed_default_skills()

    yield
    
    # Shutdown
    print("👋 Shutting down...")
    await close_database()


# Create FastAPI app
app = FastAPI(
    title="Automaton Nexus API",
    description="AI Voice Agents for Business Automation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(campaigns_router, prefix="/api")
app.include_router(results_router, prefix="/api")
app.include_router(webhooks_router, prefix="/api")
app.include_router(skills_router, prefix="/api")


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Automaton Nexus API",
        "version": "1.0.0"
    }


# WebSocket endpoint for real-time updates
@app.websocket("/api/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time campaign updates"""
    
    # Validate token
    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001)
        return
    
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001)
        return
    
    # Connect
    await ws_manager.connect(websocket, user_id)
    
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_json()
            
            # Handle subscription requests
            if data.get("action") == "subscribe":
                campaign_id = data.get("campaign_id")
                if campaign_id:
                    ws_manager.subscribe_to_campaign(user_id, campaign_id)
                    await websocket.send_json({
                        "type": "subscribed",
                        "campaign_id": campaign_id
                    })
            
            elif data.get("action") == "unsubscribe":
                campaign_id = data.get("campaign_id")
                if campaign_id:
                    ws_manager.unsubscribe_from_campaign(user_id, campaign_id)
                    await websocket.send_json({
                        "type": "unsubscribed",
                        "campaign_id": campaign_id
                    })
            
            elif data.get("action") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket, user_id)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Automaton Nexus API",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
