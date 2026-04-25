"""
Community Skills Routes
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pathlib import Path
import json
import uuid

from models.community_skill import (
    CommunitySkillCreate, CommunitySkillUpdate, CommunitySkillResponse,
    GenerateAgentFromSkillRequest, SkillVisibility
)
from utils.auth import get_current_user
from utils.database import get_database
from services.llm_service import llm_service

router = APIRouter(prefix="/skills", tags=["Community Skills"])

# Local file store fallback (mirrors auth pattern)
LOCAL_SKILLS_STORE = Path(__file__).resolve().parents[1] / ".skills_store.json"
LOCAL_AUTH_STORE = Path(__file__).resolve().parents[1] / ".auth_store.json"


# ---------------------------------------------------------------------------
# Local store helpers
# ---------------------------------------------------------------------------

def _load_skills() -> list:
    if not LOCAL_SKILLS_STORE.exists():
        return []
    try:
        return json.loads(LOCAL_SKILLS_STORE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_skills(skills: list):
    LOCAL_SKILLS_STORE.write_text(json.dumps(skills, indent=2, default=str), encoding="utf-8")


def _get_author_name_local(user_id: str) -> str:
    try:
        if LOCAL_AUTH_STORE.exists():
            users = json.loads(LOCAL_AUTH_STORE.read_text(encoding="utf-8"))
            for u in users:
                if str(u.get("_id")) == user_id:
                    return u.get("name", "Unknown")
    except Exception:
        pass
    return "Unknown"


def _is_object_id(val: str) -> bool:
    try:
        ObjectId(val)
        return True
    except Exception:
        return False


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

async def _get_store():
    """Returns ('db', db) or ('local', None)"""
    try:
        db = await get_database()
        # Quick ping to confirm it's actually reachable
        await db.community_skills.find_one({}, {"_id": 1})
        return "db", db
    except Exception:
        return "local", None


async def _get_author_name(db, user_id: str) -> str:
    try:
        if _is_object_id(user_id):
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        else:
            user_doc = await db.users.find_one({"_id": user_id})
        if user_doc:
            return user_doc.get("name", "Unknown")
    except Exception:
        pass
    return _get_author_name_local(user_id)


# ---------------------------------------------------------------------------
# Response formatter
# ---------------------------------------------------------------------------

def _format_skill(doc: dict, current_user_id: str) -> CommunitySkillResponse:
    return CommunitySkillResponse(
        id=str(doc.get("_id", doc.get("id", ""))),
        author_id=doc["author_id"],
        author_name=doc.get("author_name", "Unknown"),
        title=doc["title"],
        description=doc["description"],
        markdown_content=doc["markdown_content"],
        tags=doc.get("tags", []),
        languages=doc.get("languages", []),
        visibility=doc.get("visibility", SkillVisibility.PUBLIC),
        category=doc.get("category", "starter"),
        usage_count=doc.get("usage_count", 0),
        clone_count=doc.get("clone_count", 0),
        is_official=doc.get("is_official", False),
        created_at=doc["created_at"] if isinstance(doc["created_at"], datetime)
                   else datetime.fromisoformat(str(doc["created_at"])),
        updated_at=doc["updated_at"] if isinstance(doc["updated_at"], datetime)
                   else datetime.fromisoformat(str(doc["updated_at"])),
        is_owner=(doc["author_id"] == current_user_id),
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=List[CommunitySkillResponse])
async def list_skills(
    tag: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest", pattern="^(newest|popular|cloned)$"),
    search: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user),
):
    store_type, db = await _get_store()

    if store_type == "db":
        query: dict = {
            "$or": [
                {"visibility": SkillVisibility.PUBLIC.value},
                {"author_id": user_id},
            ]
        }
        if tag:
            query["tags"] = {"$in": [tag]}
        if language:
            query["languages"] = {"$in": [language]}
        if search:
            query["$and"] = [{
                "$or": [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"tags": {"$in": [search]}},
                ]
            }]
        sort_field = {"newest": "created_at", "popular": "usage_count", "cloned": "clone_count"}.get(sort, "created_at")
        cursor = db.community_skills.find(query).sort(sort_field, -1).limit(100)
        skills = [_format_skill(doc, user_id) async for doc in cursor]
        return skills

    # Local fallback
    skills = _load_skills()
    visible = [s for s in skills if s.get("visibility") == "public" or s.get("author_id") == user_id]
    if tag:
        visible = [s for s in visible if tag in s.get("tags", [])]
    if language:
        visible = [s for s in visible if language in s.get("languages", [])]
    if search:
        q = search.lower()
        visible = [s for s in visible if q in s.get("title", "").lower()
                   or q in s.get("description", "").lower()
                   or any(q in t for t in s.get("tags", []))]
    sort_key = {"newest": "created_at", "popular": "usage_count", "cloned": "clone_count"}.get(sort, "created_at")
    visible.sort(key=lambda s: s.get(sort_key, ""), reverse=True)
    return [_format_skill(s, user_id) for s in visible]


@router.get("/my", response_model=List[CommunitySkillResponse])
async def list_my_skills(user_id: str = Depends(get_current_user)):
    store_type, db = await _get_store()
    if store_type == "db":
        cursor = db.community_skills.find({"author_id": user_id}).sort("created_at", -1)
        return [_format_skill(doc, user_id) async for doc in cursor]
    skills = _load_skills()
    return [_format_skill(s, user_id) for s in skills if s.get("author_id") == user_id]


@router.get("/{skill_id}", response_model=CommunitySkillResponse)
async def get_skill(skill_id: str, user_id: str = Depends(get_current_user)):
    store_type, db = await _get_store()
    if store_type == "db":
        doc = await db.community_skills.find_one({"_id": ObjectId(skill_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Skill not found")
        if doc["visibility"] == SkillVisibility.PRIVATE.value and doc["author_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return _format_skill(doc, user_id)

    skills = _load_skills()
    doc = next((s for s in skills if s.get("id") == skill_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Skill not found")
    if doc.get("visibility") == "private" and doc.get("author_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return _format_skill(doc, user_id)


@router.post("", response_model=CommunitySkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_data: CommunitySkillCreate,
    user_id: str = Depends(get_current_user),
):
    store_type, db = await _get_store()
    now = datetime.utcnow()

    if store_type == "db":
        author_name = await _get_author_name(db, user_id)
        doc = {
            "author_id": user_id,
            "author_name": author_name,
            "title": skill_data.title,
            "description": skill_data.description,
            "markdown_content": skill_data.markdown_content,
            "tags": skill_data.tags,
            "languages": skill_data.languages,
            "visibility": skill_data.visibility.value,
            "usage_count": 0,
            "clone_count": 0,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.community_skills.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _format_skill(doc, user_id)

    # Local fallback
    author_name = _get_author_name_local(user_id)
    skill_id = uuid.uuid4().hex
    doc = {
        "id": skill_id,
        "author_id": user_id,
        "author_name": author_name,
        "title": skill_data.title,
        "description": skill_data.description,
        "markdown_content": skill_data.markdown_content,
        "tags": skill_data.tags,
        "languages": skill_data.languages,
        "visibility": skill_data.visibility.value,
        "usage_count": 0,
        "clone_count": 0,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    skills = _load_skills()
    skills.append(doc)
    _save_skills(skills)
    return _format_skill(doc, user_id)


@router.put("/{skill_id}", response_model=CommunitySkillResponse)
async def update_skill(
    skill_id: str,
    skill_data: CommunitySkillUpdate,
    user_id: str = Depends(get_current_user),
):
    store_type, db = await _get_store()
    now = datetime.utcnow()

    if store_type == "db":
        doc = await db.community_skills.find_one({"_id": ObjectId(skill_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Skill not found")
        if doc["author_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updates = {k: v for k, v in skill_data.model_dump(exclude_none=True).items()}
        if "visibility" in updates and hasattr(updates["visibility"], "value"):
            updates["visibility"] = updates["visibility"].value
        updates["updated_at"] = now
        await db.community_skills.update_one({"_id": ObjectId(skill_id)}, {"$set": updates})
        updated = await db.community_skills.find_one({"_id": ObjectId(skill_id)})
        return _format_skill(updated, user_id)

    skills = _load_skills()
    idx = next((i for i, s in enumerate(skills) if s.get("id") == skill_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Skill not found")
    if skills[idx]["author_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    updates = {k: v for k, v in skill_data.model_dump(exclude_none=True).items()}
    if "visibility" in updates and hasattr(updates["visibility"], "value"):
        updates["visibility"] = updates["visibility"].value
    skills[idx].update(updates)
    skills[idx]["updated_at"] = now.isoformat()
    _save_skills(skills)
    return _format_skill(skills[idx], user_id)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(skill_id: str, user_id: str = Depends(get_current_user)):
    store_type, db = await _get_store()

    if store_type == "db":
        doc = await db.community_skills.find_one({"_id": ObjectId(skill_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Skill not found")
        if doc["author_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        await db.community_skills.delete_one({"_id": ObjectId(skill_id)})
        return

    skills = _load_skills()
    idx = next((i for i, s in enumerate(skills) if s.get("id") == skill_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Skill not found")
    if skills[idx]["author_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    skills.pop(idx)
    _save_skills(skills)


@router.post("/{skill_id}/clone", response_model=CommunitySkillResponse, status_code=status.HTTP_201_CREATED)
async def clone_skill(skill_id: str, user_id: str = Depends(get_current_user)):
    store_type, db = await _get_store()
    now = datetime.utcnow()

    if store_type == "db":
        original = await db.community_skills.find_one({"_id": ObjectId(skill_id)})
        if not original:
            raise HTTPException(status_code=404, detail="Skill not found")
        author_name = await _get_author_name(db, user_id)
        clone_doc = {
            "author_id": user_id,
            "author_name": author_name,
            "title": f"{original['title']} (Clone)",
            "description": original["description"],
            "markdown_content": original["markdown_content"],
            "tags": original.get("tags", []),
            "languages": original.get("languages", []),
            "visibility": SkillVisibility.PRIVATE.value,
            "usage_count": 0,
            "clone_count": 0,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.community_skills.insert_one(clone_doc)
        clone_doc["_id"] = result.inserted_id
        await db.community_skills.update_one({"_id": ObjectId(skill_id)}, {"$inc": {"clone_count": 1}})
        return _format_skill(clone_doc, user_id)

    skills = _load_skills()
    original = next((s for s in skills if s.get("id") == skill_id), None)
    if not original:
        raise HTTPException(status_code=404, detail="Skill not found")
    author_name = _get_author_name_local(user_id)
    new_id = uuid.uuid4().hex
    clone_doc = {
        "id": new_id,
        "author_id": user_id,
        "author_name": author_name,
        "title": f"{original['title']} (Clone)",
        "description": original["description"],
        "markdown_content": original["markdown_content"],
        "tags": original.get("tags", []),
        "languages": original.get("languages", []),
        "visibility": SkillVisibility.PRIVATE.value,
        "usage_count": 0,
        "clone_count": 0,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    # Increment original clone count
    for s in skills:
        if s.get("id") == skill_id:
            s["clone_count"] = s.get("clone_count", 0) + 1
    skills.append(clone_doc)
    _save_skills(skills)
    return _format_skill(clone_doc, user_id)


@router.post("/{skill_id}/use")
async def use_skill(skill_id: str, user_id: str = Depends(get_current_user)):
    store_type, db = await _get_store()

    if store_type == "db":
        doc = await db.community_skills.find_one({"_id": ObjectId(skill_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Skill not found")
        await db.community_skills.update_one({"_id": ObjectId(skill_id)}, {"$inc": {"usage_count": 1}})
        return {"success": True}

    skills = _load_skills()
    for s in skills:
        if s.get("id") == skill_id:
            s["usage_count"] = s.get("usage_count", 0) + 1
            _save_skills(skills)
            return {"success": True}
    raise HTTPException(status_code=404, detail="Skill not found")


@router.post("/generate-agent")
async def generate_agent_from_skill(
    payload: GenerateAgentFromSkillRequest,
    user_id: str = Depends(get_current_user),
):
    """Generate an AI agent script from a skill's markdown prompt"""
    store_type, db = await _get_store()

    # Increment usage count (best effort)
    try:
        if store_type == "db":
            await db.community_skills.update_one(
                {"_id": ObjectId(payload.skill_id)},
                {"$inc": {"usage_count": 1}}
            )
        else:
            skills = _load_skills()
            for s in skills:
                if s.get("id") == payload.skill_id:
                    s["usage_count"] = s.get("usage_count", 0) + 1
            _save_skills(skills)
    except Exception:
        pass

    # Generate script using LLM
    generated_script = await llm_service.generate_agent_script(
        use_case="custom",
        language="english",
        custom_instructions=payload.edited_markdown,
    )

    from models.schemas import AgentStatus, AgentMemory
    now = datetime.utcnow()
    agent_doc = {
        "user_id": user_id,
        "name": payload.agent_name,
        "language": "english",
        "use_case": "custom",
        "prompt": payload.edited_markdown,
        "voice": payload.voice,
        "custom_instructions": payload.edited_markdown,
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
        agent_id = str(result.inserted_id)
    else:
        # Local agents fallback
        LOCAL_AGENTS_STORE = Path(__file__).resolve().parents[1] / ".agents_store.json"
        try:
            agents = json.loads(LOCAL_AGENTS_STORE.read_text(encoding="utf-8")) if LOCAL_AGENTS_STORE.exists() else []
        except Exception:
            agents = []
        agent_id = uuid.uuid4().hex
        agent_doc["id"] = agent_id
        agent_doc["created_at"] = now.isoformat()
        agent_doc["updated_at"] = now.isoformat()
        agents.append(agent_doc)
        LOCAL_AGENTS_STORE.write_text(json.dumps(agents, indent=2, default=str), encoding="utf-8")

    return {
        "id": agent_id,
        "name": payload.agent_name,
        "generated_script": generated_script,
        "status": "draft",
    }
