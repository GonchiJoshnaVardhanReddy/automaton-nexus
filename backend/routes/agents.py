"""
Agent Routes - CRUD operations for AI voice agents
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pathlib import Path
import json
import uuid

from models.schemas import (
    AgentCreate, AgentUpdate, AgentResponse,
    AgentStatus, AgentMemory
)
from utils.auth import get_current_user
from utils.database import get_database
from services.llm_service import llm_service

router = APIRouter(prefix="/agents", tags=["Agents"])

LOCAL_AGENTS_STORE = Path(__file__).resolve().parents[1] / ".agents_store.json"


# ---------------------------------------------------------------------------
# Local store helpers
# ---------------------------------------------------------------------------

def _load_agents() -> list:
    if not LOCAL_AGENTS_STORE.exists():
        return []
    try:
        return json.loads(LOCAL_AGENTS_STORE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_agents(agents: list):
    LOCAL_AGENTS_STORE.write_text(
        json.dumps(agents, indent=2, default=str), encoding="utf-8"
    )


def _is_object_id(val: str) -> bool:
    try:
        ObjectId(val)
        return True
    except Exception:
        return False


async def _get_store():
    """Returns ('db', db) or ('local', None)"""
    try:
        db = await get_database()
        await db.agents.find_one({}, {"_id": 1})
        return "db", db
    except Exception:
        return "local", None


def _format_agent(doc: dict) -> AgentResponse:
    raw_dt = doc.get("created_at", datetime.utcnow())
    created_at = raw_dt if isinstance(raw_dt, datetime) else datetime.fromisoformat(str(raw_dt))
    return AgentResponse(
        id=str(doc.get("_id", doc.get("id", ""))),
        user_id=doc["user_id"],
        name=doc["name"],
        language=doc["language"],
        use_case=doc["use_case"],
        prompt=doc.get("prompt"),
        voice=doc["voice"],
        custom_instructions=doc.get("custom_instructions"),
        status=doc["status"],
        generated_script=doc.get("generated_script"),
        total_calls=doc.get("total_calls", 0),
        success_rate=doc.get("success_rate", 0.0),
        created_at=created_at,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    user_id: str = Depends(get_current_user)
):
    generated_script = await llm_service.generate_agent_script(
        use_case=agent_data.use_case.value,
        language=agent_data.language.value,
        custom_instructions=agent_data.custom_instructions
    )

    store_type, db = await _get_store()
    now = datetime.utcnow()

    agent_doc = {
        "user_id": user_id,
        "name": agent_data.name,
        "language": agent_data.language.value,
        "use_case": agent_data.use_case.value,
        "prompt": agent_data.prompt,
        "voice": agent_data.voice,
        "custom_instructions": agent_data.custom_instructions,
        "status": AgentStatus.DRAFT.value,
        "memory": AgentMemory().model_dump(),
        "generated_script": generated_script,
        "total_calls": 0,
        "success_rate": 0.0,
        "created_at": now,
        "updated_at": now,
    }

    if store_type == "db":
        result = await db.agents.insert_one(agent_doc)
        agent_doc["_id"] = result.inserted_id
    else:
        agent_id = uuid.uuid4().hex
        agent_doc["id"] = agent_id
        agent_doc["created_at"] = now.isoformat()
        agent_doc["updated_at"] = now.isoformat()
        agents = _load_agents()
        agents.append(agent_doc)
        _save_agents(agents)

    return _format_agent(agent_doc)


@router.get("", response_model=List[AgentResponse])
async def get_agents(
    user_id: str = Depends(get_current_user),
    status: Optional[AgentStatus] = None
):
    store_type, db = await _get_store()

    if store_type == "db":
        query = {"user_id": user_id}
        if status:
            query["status"] = status.value
        cursor = db.agents.find(query).sort("created_at", -1)
        agents = await cursor.to_list(length=100)
        return [_format_agent(a) for a in agents]

    agents = _load_agents()
    result = [a for a in agents if a.get("user_id") == user_id]
    if status:
        result = [a for a in result if a.get("status") == status.value]
    result.sort(key=lambda a: a.get("created_at", ""), reverse=True)
    return [_format_agent(a) for a in result]


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    user_id: str = Depends(get_current_user)
):
    store_type, db = await _get_store()

    if store_type == "db":
        if not _is_object_id(agent_id):
            raise HTTPException(status_code=404, detail="Agent not found")
        agent = await db.agents.find_one({
            "_id": ObjectId(agent_id),
            "user_id": user_id
        })
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        return _format_agent(agent)

    agents = _load_agents()
    agent = next(
        (a for a in agents if a.get("id") == agent_id and a.get("user_id") == user_id),
        None
    )
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _format_agent(agent)


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    update_data: AgentUpdate,
    user_id: str = Depends(get_current_user)
):
    store_type, db = await _get_store()

    if store_type == "db":
        agent = await db.agents.find_one({
            "_id": ObjectId(agent_id), "user_id": user_id
        })
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        update_doc = {"updated_at": datetime.utcnow()}
        if update_data.name is not None:
            update_doc["name"] = update_data.name
        if update_data.language is not None:
            update_doc["language"] = update_data.language.value
        if update_data.use_case is not None:
            update_doc["use_case"] = update_data.use_case.value
        if update_data.prompt is not None:
            update_doc["prompt"] = update_data.prompt
        if update_data.voice is not None:
            update_doc["voice"] = update_data.voice
        if update_data.custom_instructions is not None:
            update_doc["custom_instructions"] = update_data.custom_instructions
        if update_data.status is not None:
            update_doc["status"] = update_data.status.value

        if update_data.use_case or update_data.language or update_data.custom_instructions:
            update_doc["generated_script"] = await llm_service.generate_agent_script(
                use_case=update_data.use_case.value if update_data.use_case else agent["use_case"],
                language=update_data.language.value if update_data.language else agent["language"],
                custom_instructions=update_data.custom_instructions or agent.get("custom_instructions")
            )

        await db.agents.update_one({"_id": ObjectId(agent_id)}, {"$set": update_doc})
        updated = await db.agents.find_one({"_id": ObjectId(agent_id)})
        return _format_agent(updated)

    agents = _load_agents()
    idx = next((i for i, a in enumerate(agents) if a.get("id") == agent_id and a.get("user_id") == user_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Agent not found")

    a = agents[idx]
    if update_data.name is not None:
        a["name"] = update_data.name
    if update_data.language is not None:
        a["language"] = update_data.language.value
    if update_data.use_case is not None:
        a["use_case"] = update_data.use_case.value
    if update_data.prompt is not None:
        a["prompt"] = update_data.prompt
    if update_data.voice is not None:
        a["voice"] = update_data.voice
    if update_data.custom_instructions is not None:
        a["custom_instructions"] = update_data.custom_instructions
    if update_data.status is not None:
        a["status"] = update_data.status.value
    if update_data.use_case or update_data.language or update_data.custom_instructions:
        a["generated_script"] = await llm_service.generate_agent_script(
            use_case=a["use_case"], language=a["language"],
            custom_instructions=a.get("custom_instructions")
        )
    a["updated_at"] = datetime.utcnow().isoformat()
    _save_agents(agents)
    return _format_agent(a)


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    user_id: str = Depends(get_current_user)
):
    store_type, db = await _get_store()

    if store_type == "db":
        result = await db.agents.delete_one({
            "_id": ObjectId(agent_id), "user_id": user_id
        })
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Agent not found")
        return

    agents = _load_agents()
    new_agents = [a for a in agents if not (a.get("id") == agent_id and a.get("user_id") == user_id)]
    if len(new_agents) == len(agents):
        raise HTTPException(status_code=404, detail="Agent not found")
    _save_agents(new_agents)


@router.post("/{agent_id}/activate", response_model=AgentResponse)
async def activate_agent(
    agent_id: str,
    user_id: str = Depends(get_current_user)
):
    store_type, db = await _get_store()

    if store_type == "db":
        result = await db.agents.update_one(
            {"_id": ObjectId(agent_id), "user_id": user_id},
            {"$set": {"status": AgentStatus.ACTIVE.value, "updated_at": datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Agent not found")
        agent = await db.agents.find_one({"_id": ObjectId(agent_id)})
        return _format_agent(agent)

    agents = _load_agents()
    idx = next((i for i, a in enumerate(agents) if a.get("id") == agent_id and a.get("user_id") == user_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    agents[idx]["status"] = AgentStatus.ACTIVE.value
    agents[idx]["updated_at"] = datetime.utcnow().isoformat()
    _save_agents(agents)
    return _format_agent(agents[idx])


@router.post("/{agent_id}/pause", response_model=AgentResponse)
async def pause_agent(
    agent_id: str,
    user_id: str = Depends(get_current_user)
):
    store_type, db = await _get_store()

    if store_type == "db":
        result = await db.agents.update_one(
            {"_id": ObjectId(agent_id), "user_id": user_id},
            {"$set": {"status": AgentStatus.PAUSED.value, "updated_at": datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Agent not found")
        agent = await db.agents.find_one({"_id": ObjectId(agent_id)})
        return _format_agent(agent)

    agents = _load_agents()
    idx = next((i for i, a in enumerate(agents) if a.get("id") == agent_id and a.get("user_id") == user_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    agents[idx]["status"] = AgentStatus.PAUSED.value
    agents[idx]["updated_at"] = datetime.utcnow().isoformat()
    _save_agents(agents)
    return _format_agent(agents[idx])
