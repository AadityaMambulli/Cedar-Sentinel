"""In-memory demo resources for executor."""

from typing import Any, Dict, Optional

_INITIAL_ORDERS: Dict[str, Dict[str, Any]] = {
    "12345": {
        "id": "12345",
        "amount": 100,
        "currency": "USD",
        "refunded": 0,
    },
    "67890": {
        "id": "67890",
        "amount": 250,
        "currency": "USD",
        "refunded": 50,
    },
}

_ORDERS: Dict[str, Dict[str, Any]] = {
    k: dict(v) for k, v in _INITIAL_ORDERS.items()
}


def get_order(order_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve an order dictionary by ID or None if not found."""
    order = _ORDERS.get(str(order_id))
    return dict(order) if order else None


def apply_refund(order_id: str, amount: float | int) -> Optional[Dict[str, Any]]:
    """Increment an order's refunded total."""
    oid = str(order_id)
    if oid not in _ORDERS:
        return None
    _ORDERS[oid]["refunded"] += amount
    return dict(_ORDERS[oid])


def reset_sandbox() -> None:
    """Reset sandbox orders to their initial demo state."""
    global _ORDERS
    _ORDERS = {k: dict(v) for k, v in _INITIAL_ORDERS.items()}
