from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import pipeline
from ..models import AuthorizeRequest, AuditLogEntry

router = APIRouter()

@router.post("/authorize", response_model=AuditLogEntry)
async def authorize(request: AuthorizeRequest):
    try:
        # Convert the Pydantic model to a dict for the pipeline
        request_dict = request.model_dump()
        # Run the full pipeline
        result = pipeline.run_pipeline(request_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))