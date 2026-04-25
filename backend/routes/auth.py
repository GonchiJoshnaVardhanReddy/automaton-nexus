"""
Authentication Routes
"""

import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from bson import ObjectId

from models.schemas import UserCreate, UserLogin, UserResponse, Token
from utils.auth import get_password_hash, verify_password, create_access_token
from utils.database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])
LOCAL_AUTH_STORE = Path(__file__).resolve().parents[1] / ".auth_store.json"


def _load_local_users():
    if not LOCAL_AUTH_STORE.exists():
        return []

    try:
        return json.loads(LOCAL_AUTH_STORE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def _save_local_users(users):
    LOCAL_AUTH_STORE.write_text(json.dumps(users, indent=2), encoding="utf-8")


async def _get_user_store():
    try:
        db = await get_database()
        return {"type": "db", "db": db}
    except Exception:
        return {"type": "local", "users": _load_local_users()}


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    store = await _get_user_store()

    if store["type"] == "db":
        try:
            db = store["db"]

            # Check if user already exists
            existing_user = await db.users.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

            # Create new user
            user_doc = {
                "name": user_data.name,
                "email": user_data.email,
                "hashed_password": get_password_hash(user_data.password),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = await db.users.insert_one(user_doc)
            user_id = str(result.inserted_id)
        except Exception:
            store = {"type": "local", "users": _load_local_users()}

    if store["type"] == "local":
        users = store["users"]
        existing_user = next((user for user in users if user["email"].lower() == user_data.email.lower()), None)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        user_id = uuid4().hex
        users.append({
            "_id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "hashed_password": get_password_hash(user_data.password),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        })
        _save_local_users(users)

    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(access_token=access_token, user={"id": user_id, "name": user_data.name, "email": user_data.email})


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login and get access token"""
    store = await _get_user_store()

    if store["type"] == "db":
        try:
            db = store["db"]

            # Find user
            user = await db.users.find_one({"email": credentials.email})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )

            # Verify password
            if not verify_password(credentials.password, user["hashed_password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )

            # Create access token
            user_id = str(user["_id"])
            access_token = create_access_token(data={"sub": user_id})

            return Token(access_token=access_token, user={"id": user_id, "name": user["name"], "email": user["email"]})
        except Exception:
            store = {"type": "local", "users": _load_local_users()}

    users = store["users"]
    user = next((item for item in users if item["email"].lower() == credentials.email.lower()), None)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id})
    return Token(access_token=access_token, user={"id": user_id, "name": user["name"], "email": user["email"]})


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user_id: str):
    """Get current user info (requires user_id from auth middleware)"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"]
    )
