"""In-memory demo resources for executor."""

from typing import Any, Dict, Optional

# Demo order reference for testing:
# | Order ID | Amount | Refunded | Notes                                    |
# |----------|--------|----------|------------------------------------------|
# | 12345    | 100    | 0        | At $100 threshold                        |
# | 67890    | 250    | 50       | Already partially refunded               |
# | 11111    | 25     | 0        | Well under threshold                     |
# | 22222    | 300    | 0        | Well over threshold                      |
# | 33333    | 80     | 20       | Partially refunded, room for more        |
# | 44444    | 150    | 0        | Typical order amount                     |
# | 55555    | 500    | 150      | Large order with partial refund          |

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
    "11111": {
        "id": "11111",
        "amount": 25,
        "currency": "USD",
        "refunded": 0,
    },
    "22222": {
        "id": "22222",
        "amount": 300,
        "currency": "USD",
        "refunded": 0,
    },
    "33333": {
        "id": "33333",
        "amount": 80,
        "currency": "USD",
        "refunded": 20,
    },
    "44444": {
        "id": "44444",
        "amount": 150,
        "currency": "USD",
        "refunded": 0,
    },
    "55555": {
        "id": "55555",
        "amount": 500,
        "currency": "USD",
        "refunded": 150,
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
