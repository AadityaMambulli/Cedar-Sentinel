"""Cedar policy authorization module."""

from pathlib import Path
import json
from typing import Any, Dict, Optional, Tuple
import cedar

BASE_DIR = Path(__file__).resolve().parent
POLICIES_DIR = BASE_DIR / "policies"
SCHEMA_PATH = BASE_DIR / "schema.json"


def load_schema(schema_file: Path | str = SCHEMA_PATH) -> cedar.Schema:
    """Load and parse the Cedar schema from schema.json."""
    path = Path(schema_file)
    with open(path, "r", encoding="utf-8") as f:
        schema_text = f.read()
    return cedar.Schema.from_json(schema_text)


def load_policies(policies_dir: Path | str = POLICIES_DIR) -> Tuple[cedar.PolicySet, Dict[str, str]]:
    """Load all .cedar files from the policies directory into a Cedar PolicySet.

    Returns:
        Tuple[cedar.PolicySet, Dict[str, str]]: The loaded policy set and a mapping
        of policy IDs to human-readable policy names/annotations.
    """
    policy_set = cedar.PolicySet()
    policy_names: Dict[str, str] = {}
    path = Path(policies_dir)

    if path.exists():
        for file in sorted(path.glob("*.cedar")):
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
            if not content.strip():
                continue
            parsed_set = cedar.PolicySet(content)
            for idx, p in enumerate(parsed_set, 1):
                ann_id = p.annotations().get("id") or f"{file.stem}#{idx}"
                full_id = f"{file.name}#{ann_id}"
                policy_obj = cedar.Policy.from_str(str(p), id=full_id)
                policy_set.add(policy_obj)
                policy_names[full_id] = ann_id

    return policy_set, policy_names


def parse_entity_uid(uid_str: str) -> cedar.EntityUid:
    """Parse an Entity UID string like 'Agent::\"refund-bot\"' or 'Order::12345'."""
    if "::" in uid_str:
        entity_type, entity_id = uid_str.split("::", 1)
        entity_id = entity_id.strip().strip('"')
        return cedar.EntityUid(entity_type, entity_id)
    raise ValueError(f"Invalid Entity UID format: {uid_str}")


def _normalize_context(ctx: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Normalize context values to types supported by Cedar."""
    if not ctx:
        return {}
    normalized = {}
    for k, v in ctx.items():
        if isinstance(v, float):
            normalized[k] = int(round(v))
        else:
            normalized[k] = v
    return normalized


def authorize(request: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate an authorization request against Cedar policies and schema.

    Args:
        request: A dict matching docs/interfaces.md §1:
            {
                "principal": "Agent::\"refund-bot\"",
                "action": "Action::\"IssueRefund\"",
                "resource": "Order::\"12345\"",
                "context": { "amount": 49.99, "currency": "USD" }
            }

    Returns:
        A dict matching docs/interfaces.md §2:
            {
                "decision": "Allow" | "Deny",
                "reason": str,
                "policy_id": str | None
            }
    """
    try:
        schema = load_schema()
        policy_set, policy_names = load_policies()
        authorizer = cedar.Authorizer(schema=schema)

        principal_uid = parse_entity_uid(request.get("principal", ""))
        action_uid = parse_entity_uid(request.get("action", ""))
        resource_uid = parse_entity_uid(request.get("resource", ""))
        raw_context = request.get("context") or {}
        context_data = _normalize_context(raw_context)

        # Build Cedar context and request
        try:
            context = cedar.Context(context_data, schema=schema, action=action_uid)
            cedar_request = cedar.Request(
                principal=principal_uid,
                action=action_uid,
                resource=resource_uid,
                context=context,
                schema=schema
            )
        except Exception:
            # Fallback for requests that don't match schema (e.g. unknown action or context)
            context = cedar.Context(context_data)
            cedar_request = cedar.Request(
                principal=principal_uid,
                action=action_uid,
                resource=resource_uid,
                context=context
            )

        response = authorizer.is_authorized(cedar_request, policy_set)

        if response.decision == "Allow" or response.allowed:
            matched_id = response.reason[0] if response.reason else None
            friendly_name = policy_names.get(matched_id, matched_id) if matched_id else "permit policy"
            return {
                "decision": "Allow",
                "reason": f"Matched policy: {friendly_name}",
                "policy_id": matched_id
            }
        else:
            return {
                "decision": "Deny",
                "reason": "Denied by default: no matching permit policy",
                "policy_id": None
            }

    except Exception as e:
        return {
            "decision": "Deny",
            "reason": f"Denied: {str(e)}",
            "policy_id": None
        }
