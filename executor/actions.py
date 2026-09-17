"""Action executor functions for permitted agent actions."""

from typing import Any, Dict, Optional
from executor.sandbox_resources import apply_refund, get_order


def issue_refund(order_id: str, amount: float | int) -> Dict[str, Any]:
    """Issue a refund for a given order.

    Returns:
        Dict matching docs/interfaces.md §3:
        On success: {"status": "success", "action": "IssueRefund", "order_id": ..., "amount": ..., "refunded_total": ...}
        On error: {"status": "error", "message": ...}
    """
    updated_order = apply_refund(order_id, amount)
    if updated_order is None:
        return {
            "status": "error",
            "message": f"Order {order_id} not found"
        }

    return {
        "status": "success",
        "action": "IssueRefund",
        "order_id": str(order_id),
        "amount": amount,
        "refunded_total": updated_order["refunded"]
    }


def read_order(order_id: str) -> Dict[str, Any]:
    """Retrieve details for a given order.

    Returns:
        Dict matching docs/interfaces.md §3:
        On success: {"status": "success", "action": "ReadOrder", "order_id": ..., "order": ...}
        On error: {"status": "error", "message": ...}
    """
    order = get_order(order_id)
    if order is None:
        return {
            "status": "error",
            "message": f"Order {order_id} not found"
        }

    return {
        "status": "success",
        "action": "ReadOrder",
        "order_id": str(order_id),
        "order": order
    }


def _extract_id(uid_or_id: str) -> str:
    """Extract raw identifier from Cedar Entity UID or return string as is."""
    if "::" in uid_or_id:
        _, val = uid_or_id.split("::", 1)
        return val.strip().strip('"')
    return uid_or_id.strip().strip('"')


def execute_action(action: str, resource: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Dispatch an allowed action to its corresponding handler.

    Args:
        action: Cedar action UID (e.g. 'Action::\"IssueRefund\"') or simple name ('IssueRefund')
        resource: Cedar resource UID (e.g. 'Order::\"12345\"') or simple ID ('12345')
        context: Context dictionary passed with the request
    """
    context = context or {}
    action_name = _extract_id(action)
    order_id = _extract_id(resource)

    if action_name == "IssueRefund":
        amount = context.get("amount", 0)
        return issue_refund(order_id=order_id, amount=amount)
    elif action_name == "ReadOrder":
        return read_order(order_id=order_id)
    else:
        return {
            "status": "error",
            "message": f"Unknown executor action: {action}"
        }
