from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models import AuditLogEntry
import audit.query_helpers

router = APIRouter()

@router.get("/logs", response_model=List[AuditLogEntry])
async def get_logs(
    agent: Optional[str] = Query(None),
    decision: Optional[str] = Query(None),
    limit: int = Query(50, gt=0, le=100)
):
    """Get audit logs with optional filters for agent and decision."""
    logs = audit.query_helpers.search_logs(agent=agent, decision=decision, limit=limit)
    return logs

@router.get("/logs/{log_id}", response_model=AuditLogEntry)
async def get_log_by_id(log_id: str):
    """Get a single audit log entry by ID."""
    log = audit.query_helpers.get_log_by_id(log_id)
    if log is None:
        raise HTTPException(status_code=404, detail="Log not found")
    return log