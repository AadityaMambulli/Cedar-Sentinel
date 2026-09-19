from fastapi import APIRouter
from typing import List, Dict, Any
import os
from pathlib import Path

router = APIRouter()

# Get all .cedar policy files and return their content
@router.get("/policies")
async def get_policies():
    """Get all loaded Cedar policies (raw .cedar text + metadata)"""
    policies_dir = Path("policy/policies")
    if not policies_dir.exists():
        return []

    policies = []
    for cedar_file in policies_dir.glob("*.cedar"):
        try:
            with open(cedar_file, "r", encoding="utf-8") as f:
                content = f.read()
                policies.append({
                    "filename": cedar_file.name,
                    "content": content
                })
        except Exception as e:
            # Skip files that can't be read
            continue

    return policies