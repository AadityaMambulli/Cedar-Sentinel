"""Audit logger module for persisting decisions to OpenSearch."""

import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from dotenv import load_dotenv
import opensearchpy

load_dotenv()

logger = logging.getLogger(__name__)


def get_audit_index_name() -> str:
    """Get the configured audit index name."""
    return os.getenv("AUDIT_INDEX_NAME", "agent-audit-log")


def get_opensearch_client() -> Optional[opensearchpy.OpenSearch]:
    """Create and return an OpenSearch client configured via environment variables."""
    host = os.getenv("OPENSEARCH_HOST", "localhost")
    port_str = os.getenv("OPENSEARCH_PORT", "9200")
    try:
        port = int(port_str)
    except ValueError:
        port = 9200

    user = os.getenv("OPENSEARCH_USER")
    password = os.getenv("OPENSEARCH_PASSWORD")
    use_ssl_env = os.getenv("OPENSEARCH_USE_SSL")
    if use_ssl_env is not None:
        use_ssl = use_ssl_env.lower() in ("true", "1")
    else:
        use_ssl = (port == 443 or host.startswith("https://"))

    verify_certs = os.getenv("OPENSEARCH_VERIFY_CERTS", "true").lower() in ("true", "1")

    # Strip URL scheme if passed in OPENSEARCH_HOST
    clean_host = host.replace("http://", "").replace("https://", "").rstrip("/")

    http_auth = (user, password) if user and password else None

    try:
        client = opensearchpy.OpenSearch(
            hosts=[{"host": clean_host, "port": port}],
            http_auth=http_auth,
            use_ssl=use_ssl,
            verify_certs=verify_certs,
            ssl_show_warn=False,
            timeout=10,
            max_retries=2,
        )
        return client
    except Exception as e:
        logger.warning("Failed to initialize OpenSearch client: %s", e)
        return None


def log_decision(
    decision: Dict[str, Any],
    action_result: Optional[Dict[str, Any]] = None,
    request: Optional[Dict[str, Any]] = None,
    client: Optional[opensearchpy.OpenSearch] = None,
) -> Dict[str, Any]:
    """Build and persist an audit log entry.

    Args:
        decision: Authorization decision dict (§2)
        action_result: Action executor result dict (§3), or None if denied/not run
        request: Original authorization request dict (§1), optional
        client: Optional OpenSearch client override (defaults to get_opensearch_client())

    Returns:
        Dict matching docs/interfaces.md §4:
            {
                "id": str (uuid),
                "timestamp": str (ISO 8601 UTC),
                "decision": "Allow" | "Deny",
                "reason": str,
                "policy_id": str | None,
                "action_result": dict | None,
                ...
            }
    """
    entry: Dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "decision": decision.get("decision", "Deny"),
        "reason": decision.get("reason", ""),
        "policy_id": decision.get("policy_id"),
        "action_result": action_result,
    }

    if request:
        if "principal" in request:
            entry["principal"] = request["principal"]
        if "action" in request:
            entry["action"] = request["action"]
        if "resource" in request:
            entry["resource"] = request["resource"]
        if "context" in request:
            entry["context"] = request["context"]

    index_name = get_audit_index_name()
    os_client = client if client is not None else get_opensearch_client()
    if os_client is not None:
        try:
            os_client.index(
                index=index_name,
                id=entry["id"],
                body=entry,
                refresh=True,
            )
        except Exception as e:
            logger.warning(
                "OpenSearch indexing failed for log entry %s (falling back gracefully): %s",
                entry["id"],
                e,
            )
            print(f"[AUDIT LOG FALLBACK - OpenSearch error: {e}] {entry}")
    else:
        print(f"[AUDIT LOG (No OpenSearch configured)] {entry}")

    return entry
