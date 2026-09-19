import sys
from pathlib import Path
# Add the parent directory to sys.path so we can import pipeline
sys.path.append(str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from unittest.mock import patch

# Import the app from our main.py since we're in the api directory
from api.main import app

client = TestClient(app)

def test_authorize_allow():
    """Test the authorize endpoint with an Allow decision."""
    # Mock the pipeline.run_pipeline to return a predefined Allow audit log entry
    with patch('api.routes.authorize.pipeline.run_pipeline') as mock_run_pipeline:
        mock_run_pipeline.return_value = {
            "id": "test-id-1",
            "timestamp": "2026-09-18T10:00:00.000Z",
            "decision": "Allow",
            "reason": "Matched policy: refund-under-100",
            "policy_id": "base.cedar#1",
            "action_result": {
                "status": "success",
                "action": "IssueRefund",
                "order_id": "12345",
                "amount": 49.99
            }
        }

        response = client.post(
            "/api/authorize",
            json={
                "principal": "Agent::\"refund-bot\"",
                "action": "Action::\"IssueRefund\"",
                "resource": "Order::\"12345\"",
                "context": {
                    "amount": 49.99,
                    "currency": "USD"
                }
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["decision"] == "Allow"
        assert data["reason"] == "Matched policy: refund-under-100"
        assert data["policy_id"] == "base.cedar#1"
        assert data["action_result"]["status"] == "success"

def test_authorize_deny():
    """Test the authorize endpoint with a Deny decision."""
    # Mock the pipeline.run_pipeline to return a predefined Deny audit log entry
    with patch('api.routes.authorize.pipeline.run_pipeline') as mock_run_pipeline:
        mock_run_pipeline.return_value = {
            "id": "test-id-2",
            "timestamp": "2026-09-18T10:00:00.000Z",
            "decision": "Deny",
            "reason": "No matching policy",
            "policy_id": None,
            "action_result": None
        }

        response = client.post(
            "/api/authorize",
            json={
                "principal": "Agent::\"refund-bot\"",
                "action": "Action::\"IssueRefund\"",
                "resource": "Order::\"12345\"",
                "context": {
                    "amount": 150.00,
                    "currency": "USD"
                }
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["decision"] == "Deny"
        assert data["reason"] == "No matching policy"
        assert data["policy_id"] is None
        assert data["action_result"] is None

def test_logs_search():
    """Test the logs search endpoint."""
    with patch('api.routes.logs.audit.query_helpers.search_logs') as mock_search:
        mock_search.return_value = [
            {
                "id": "log-1",
                "timestamp": "2026-09-18T10:00:00.000Z",
                "decision": "Allow",
                "reason": "Matched policy",
                "policy_id": "base.cedar#1",
                "action_result": {
                    "status": "success",
                    "action": "TestAction"
                }
            }
        ]

        response = client.get("/api/logs")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "log-1"
        assert data[0]["decision"] == "Allow"

def test_logs_get_by_id():
    """Test getting a specific log by ID."""
    with patch('api.routes.logs.audit.query_helpers.get_log_by_id') as mock_get:
        mock_get.return_value = {
            "id": "log-123",
            "timestamp": "2026-09-18T10:00:00.000Z",
            "decision": "Allow",
            "reason": "Test reason",
            "policy_id": "base.cedar#1",
            "action_result": {
                "status": "success"
            }
        }

        response = client.get("/api/logs/log-123")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "log-123"
        assert data["decision"] == "Allow"

def test_logs_get_by_id_not_found():
    """Test getting a log that doesn't exist."""
    with patch('api.routes.logs.audit.query_helpers.get_log_by_id') as mock_get:
        mock_get.return_value = None

        response = client.get("/api/logs/nonexistent")
        assert response.status_code == 404

def test_agents():
    """Test the agents endpoint."""
    response = client.get("/api/agents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "Agent::\"refund-bot\"" in data

def test_policies():
    """Test the policies endpoint."""
    response = client.get("/api/policies")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)