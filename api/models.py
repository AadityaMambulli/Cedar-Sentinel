from pydantic import BaseModel
from typing import Dict, Any, Optional


class AuthorizeRequest(BaseModel):
    principal: str
    action: str
    resource: str
    context: Dict[str, Any] = {}


class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    decision: str
    reason: str
    policy_id: Optional[str] = None
    action_result: Optional[Dict[str, Any]] = None
    principal: str
    action: str
    resource: str
    context: Dict[str, Any] = {}