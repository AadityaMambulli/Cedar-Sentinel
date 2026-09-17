"""Audit query helper functions for searching and retrieving logs."""

import logging
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv
import opensearchpy
from audit.logger import get_audit_index_name, get_opensearch_client

load_dotenv()

logger = logging.getLogger(__name__)


def search_logs(
    agent: Optional[str] = None,
    decision: Optional[str] = None,
    limit: int = 50,
    client: Optional[opensearchpy.OpenSearch] = None,
) -> List[Dict[str, Any]]:
    """Search audit logs with optional filters for agent and decision.

    Returns:
        List of audit log entries, sorted newest-first.
    """
    os_client = client if client is not None else get_opensearch_client()
    if os_client is None:
        logger.warning("OpenSearch client unavailable for search_logs")
        return []

    index_name = get_audit_index_name()
    must_clauses: List[Dict[str, Any]] = []
    if agent:
        must_clauses.append({"match_phrase": {"principal": agent}})
    if decision:
        must_clauses.append({
            "bool": {
                "should": [
                    {"term": {"decision.keyword": decision}},
                    {"term": {"decision": decision}},
                    {"match": {"decision": decision}},
                ],
                "minimum_should_match": 1,
            }
        })

    query_body: Dict[str, Any] = {
        "size": limit,
        "sort": [{"timestamp": {"order": "desc"}}],
    }

    if must_clauses:
        query_body["query"] = {"bool": {"must": must_clauses}}
    else:
        query_body["query"] = {"match_all": {}}

    try:
        response = os_client.search(index=index_name, body=query_body)
        hits = response.get("hits", {}).get("hits", [])
        return [hit["_source"] for hit in hits]
    except Exception as e:
        logger.warning("search_logs query failed: %s", e)
        return []


def get_log_by_id(
    log_id: str,
    client: Optional[opensearchpy.OpenSearch] = None,
) -> Optional[Dict[str, Any]]:
    """Fetch a single audit log entry by ID."""
    os_client = client if client is not None else get_opensearch_client()
    if os_client is None:
        logger.warning("OpenSearch client unavailable for get_log_by_id")
        return None

    index_name = get_audit_index_name()
    try:
        response = os_client.get(index=index_name, id=str(log_id))
        return response.get("_source")
    except Exception as e:
        logger.warning("get_log_by_id failed for ID %s: %s", log_id, e)
        return None
