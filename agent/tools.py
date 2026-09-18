"""Tools for the Strands AI agent to interface with Cedar Policy & Audit Layer."""

from typing import Any, Dict, Optional
from strands import tool
from pipeline import run_pipeline


def format_cedar_uid(entity_type: str, raw_id: str) -> str:
    """Format an entity type and ID into a Cedar UID string, e.g. Agent::\"refund-bot\"."""
    clean_id = str(raw_id).strip()
    if clean_id.startswith(f"{entity_type}::"):
        clean_id = clean_id.split("::", 1)[1]
    clean_id = clean_id.strip().strip('"')
    return f'{entity_type}::"{clean_id}"'


def normalize_action_name(action: str) -> str:
    """Normalize common action aliases to canonical Cedar action names."""
    act = str(action).strip()
    if act.startswith("Action::"):
        act = act.split("::", 1)[1].strip().strip('"')
    act_lower = act.lower().replace("-", "").replace("_", "")
    if act_lower in ("issuerefund", "refund"):
        return "IssueRefund"
    elif act_lower in ("readorder", "getorder", "vieworder", "read", "orderdetails"):
        return "ReadOrder"
    return act


def build_authorization_request(
    action: str,
    resource_id: str,
    amount: Optional[float] = None,
    currency: str = "USD",
    agent_name: str = "refund-bot",
) -> Dict[str, Any]:
    """Build a Cedar authorization request matching docs/interfaces.md §1.

    Args:
        action: Action name (e.g. 'IssueRefund', 'ReadOrder').
        resource_id: Target resource identifier (e.g. order ID '12345').
        amount: Optional monetary amount for financial actions like refunds.
        currency: Currency code (default 'USD').
        agent_name: Name of the principal agent requesting the action (default 'refund-bot').

    Returns:
        Dict conforming to docs/interfaces.md §1:
            {
                "principal": "Agent::\"refund-bot\"",
                "action": "Action::\"IssueRefund\"",
                "resource": "Order::\"12345\"",
                "context": { "amount": 40.0, "currency": "USD" }
            }
    """
    norm_action = normalize_action_name(action)
    principal_uid = format_cedar_uid("Agent", agent_name or "refund-bot")
    action_uid = format_cedar_uid("Action", norm_action)
    resource_uid = format_cedar_uid("Order", resource_id)

    context: Dict[str, Any] = {}
    if norm_action == "IssueRefund" and amount is not None:
        context = {
            "amount": float(amount),
            "currency": currency or "USD",
        }

    return {
        "principal": principal_uid,
        "action": action_uid,
        "resource": resource_uid,
        "context": context,
    }


@tool
def authorize_and_execute(
    action: str,
    resource_id: str,
    amount: float = 0.0,
    currency: str = "USD",
    agent_name: str = "refund-bot",
) -> Dict[str, Any]:
    """Use this tool to check whether an action is permitted under Cedar security policies and, if allowed, execute it.

    Always call this tool before executing any real action (such as issuing a refund or reading order details).
    Never claim an action was taken without calling this tool.

    Args:
        action: The action to perform (e.g., 'IssueRefund' or 'ReadOrder').
        resource_id: The ID of the target resource (e.g., order ID '12345').
        amount: The monetary amount for the action (e.g., 40.0 for a refund).
        currency: The currency code (e.g., 'USD'). Default is 'USD'.
        agent_name: The principal agent initiating the request. Default is 'refund-bot'.

    Returns:
        Audit log record containing authorization decision ('Allow' or 'Deny'), policy reasoning, execution result, and immutable audit metadata.
    """
    request = build_authorization_request(
        action=action,
        resource_id=resource_id,
        amount=amount,
        currency=currency,
        agent_name=agent_name,
    )
    audit_entry = run_pipeline(request)
    return audit_entry
