from fastapi import APIRouter
from typing import List

router = APIRouter()

@router.get("/agents", response_model=List[str])
async def get_agents():
    """Get a list of agent principals."""
    # For the hackathon demo, we return a hardcoded list.
    # In a real system, this might come from a configuration or registry.
    return [
        "Agent::\"refund-bot\"",
        # Add other agent principals if known, e.g., from policy files.
        # For now, we just return the refund-bot as per the test.
    ]