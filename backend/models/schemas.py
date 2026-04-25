"""
Automaton Nexus - AI Voice Agents Backend
Database Models
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, field=None):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            return v
        raise ValueError("Invalid ObjectId")


# Enums
class AgentStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"


class CampaignStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"


class CallStatus(str, Enum):
    PENDING = "pending"
    CALLING = "calling"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    NO_ANSWER = "no_answer"
    FAILED = "failed"


class Language(str, Enum):
    ENGLISH = "english"
    HINDI = "hindi"
    KANNADA = "kannada"
    MARATHI = "marathi"


class UseCase(str, Enum):
    ORDER_CONFIRMATION = "order_confirmation"
    APPOINTMENT_REMINDER = "appointment_reminder"
    DELIVERY_UPDATE = "delivery_update"
    FEEDBACK_COLLECTION = "feedback_collection"
    PAYMENT_REMINDER = "payment_reminder"
    CUSTOM = "custom"


# User Models
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(UserBase):
    id: Optional[str] = Field(default=None, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    id: str
    created_at: datetime


# Agent Models
class AgentMemory(BaseModel):
    conversation_history: List[Dict[str, str]] = []
    context: Dict[str, Any] = {}
    learned_preferences: Dict[str, Any] = {}


class AgentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    language: Language = Language.ENGLISH
    use_case: UseCase = UseCase.ORDER_CONFIRMATION
    prompt: Optional[str] = None
    voice: str = "professional_female"
    custom_instructions: Optional[str] = None


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[Language] = None
    use_case: Optional[UseCase] = None
    prompt: Optional[str] = None
    voice: Optional[str] = None
    custom_instructions: Optional[str] = None
    status: Optional[AgentStatus] = None


class AgentInDB(AgentBase):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    status: AgentStatus = AgentStatus.DRAFT
    memory: AgentMemory = Field(default_factory=AgentMemory)
    generated_script: Optional[str] = None
    total_calls: int = 0
    success_rate: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class AgentResponse(AgentBase):
    id: str
    user_id: str
    status: AgentStatus
    generated_script: Optional[str] = None
    total_calls: int
    success_rate: float
    created_at: datetime


# Campaign Models
class PhoneEntry(BaseModel):
    phone_number: str
    customer_name: Optional[str] = None
    order_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class CampaignBase(BaseModel):
    name: Optional[str] = None
    agent_id: str
    order_context: Optional[str] = None


class CampaignCreate(CampaignBase):
    phone_numbers: List[PhoneEntry]


class CampaignInDB(CampaignBase):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    phone_numbers: List[PhoneEntry]
    status: CampaignStatus = CampaignStatus.PENDING
    total_calls: int = 0
    completed_calls: int = 0
    confirmed_calls: int = 0
    rejected_calls: int = 0
    failed_calls: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class CampaignResponse(BaseModel):
    id: str
    name: Optional[str]
    agent_id: str
    user_id: str
    status: CampaignStatus
    total_calls: int
    completed_calls: int
    confirmed_calls: int
    rejected_calls: int
    failed_calls: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]


# Call Log Models
class CallLogBase(BaseModel):
    campaign_id: str
    agent_id: str
    phone_number: str
    customer_name: Optional[str] = None


class CallLogInDB(CallLogBase):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    status: CallStatus = CallStatus.PENDING
    exotel_call_id: Optional[str] = None
    transcript: List[Dict[str, str]] = []
    duration_seconds: int = 0
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class CallLogResponse(BaseModel):
    id: str
    campaign_id: str
    agent_id: str
    phone_number: str
    customer_name: Optional[str]
    status: CallStatus
    transcript: List[Dict[str, str]]
    duration_seconds: int
    started_at: Optional[datetime]
    ended_at: Optional[datetime]


# Stats Models
class DashboardStats(BaseModel):
    total_calls: int
    confirmed: int
    rejected: int
    success_rate: float
    avg_duration_seconds: int
    active_agents: int
    customers_reached: int


# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[Dict[str, Any]] = None


class TokenData(BaseModel):
    user_id: Optional[str] = None
