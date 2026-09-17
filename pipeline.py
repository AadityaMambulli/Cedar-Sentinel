"""End-to-end authorization, execution, and audit pipeline."""

from typing import Any, Dict, Optional
from dotenv import load_dotenv
import opensearchpy

load_dotenv()

from policy.authorize import authorize
from executor.actions import execute_action
from audit.logger import log_decision


def run_pipeline(
    request: Dict[str, Any],
    os_client: Optional[opensearchpy.OpenSearch] = None,
) -> Dict[str, Any]:
    """Execute the full agent authorization -> execution -> audit pipeline.

    Args:
        request: Authorization request matching docs/interfaces.md §1:
            {
                "principal": "Agent::\"refund-bot\"",
                "action": "Action::\"IssueRefund\"",
                "resource": "Order::\"12345\"",
                "context": { "amount": 49.99, "currency": "USD" }
            }
        os_client: Optional OpenSearch client override for audit logging

    Returns:
        Audit log entry matching docs/interfaces.md §4:
            {
                "id": str,
                "timestamp": str,
                "decision": "Allow" | "Deny",
                "reason": str,
                "policy_id": str | None,
                "action_result": dict | None,
                ...
            }
    """
    # 1. Authorize against Cedar policies
    decision = authorize(request)

    # 2. If allowed, execute the action; otherwise action_result is None
    action_result = None
    if decision.get("decision") == "Allow":
        action = request.get("action", "")
        resource = request.get("resource", "")
        context = request.get("context")
        action_result = execute_action(action, resource, context)

    # 3. Log decision and execution result to audit store
    audit_entry = log_decision(
        decision=decision,
        action_result=action_result,
        request=request,
        client=os_client,
    )

    return audit_entry
