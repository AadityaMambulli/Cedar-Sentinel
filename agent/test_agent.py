"""Unit tests for agent tools and model configuration."""

import unittest
from unittest.mock import MagicMock, patch

from agent.tools import (
    build_authorization_request,
    format_cedar_uid,
    normalize_action_name,
    authorize_and_execute,
)
from agent.model_config import get_ollama_model, get_model


class TestAgentTools(unittest.TestCase):
    """Test suite for agent tool request shaping and execution."""

    def test_format_cedar_uid(self):
        """Test formatting raw identifiers to Cedar UIDs."""
        self.assertEqual(format_cedar_uid("Agent", "refund-bot"), 'Agent::"refund-bot"')
        self.assertEqual(format_cedar_uid("Agent", 'Agent::"refund-bot"'), 'Agent::"refund-bot"')
        self.assertEqual(format_cedar_uid("Order", "12345"), 'Order::"12345"')
        self.assertEqual(format_cedar_uid("Action", "IssueRefund"), 'Action::"IssueRefund"')

    def test_normalize_action_name(self):
        """Test normalization of action aliases."""
        self.assertEqual(normalize_action_name("IssueRefund"), "IssueRefund")
        self.assertEqual(normalize_action_name("refund"), "IssueRefund")
        self.assertEqual(normalize_action_name("ReadOrder"), "ReadOrder")
        self.assertEqual(normalize_action_name("read_order"), "ReadOrder")
        self.assertEqual(normalize_action_name("get_order"), "ReadOrder")

    def test_build_authorization_request_refund(self):
        """Test building request for refund matching docs/interfaces.md §1."""
        req = build_authorization_request(
            action="IssueRefund",
            resource_id="12345",
            amount=49.99,
            currency="USD",
            agent_name="refund-bot",
        )
        expected = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {
                "amount": 49.99,
                "currency": "USD",
            },
        }
        self.assertEqual(req, expected)

    def test_build_authorization_request_read_order(self):
        """Test building request for reading order details."""
        req = build_authorization_request(
            action="ReadOrder",
            resource_id="67890",
            agent_name="refund-bot",
        )
        expected = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"ReadOrder"',
            "resource": 'Order::"67890"',
            "context": {},
        }
        self.assertEqual(req, expected)

    @patch("agent.tools.run_pipeline")
    def test_authorize_and_execute_tool(self, mock_run_pipeline):
        """Test authorize_and_execute tool invocation with mocked pipeline."""
        mock_audit_entry = {
            "id": "mock-audit-uuid",
            "timestamp": "2026-09-17T12:00:00Z",
            "decision": "Allow",
            "reason": "Matched policy: refund-under-100",
            "policy_id": "base.cedar#1",
            "action_result": {
                "status": "success",
                "action": "IssueRefund",
                "order_id": "12345",
                "amount": 40.0,
                "refunded_total": 40.0,
            },
        }
        mock_run_pipeline.return_value = mock_audit_entry

        result = authorize_and_execute(
            action="IssueRefund",
            resource_id="12345",
            amount=40.0,
            currency="USD",
            agent_name="refund-bot",
        )

        mock_run_pipeline.assert_called_once_with({
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {
                "amount": 40.0,
                "currency": "USD",
            },
        })
        self.assertEqual(result, mock_audit_entry)


class TestModelConfig(unittest.TestCase):
    """Test suite for model configuration and fallbacks."""

    def test_get_ollama_model(self):
        """Verify OllamaModel instantiates with custom or default host."""
        model = get_ollama_model(
            model_id="Qwen2.5-Coder-1.5B",
            host="http://localhost:20128",
        )
        self.assertEqual(model.config["model_id"], "Qwen2.5-Coder-1.5B")
        self.assertEqual(model.host, "http://localhost:20128")

    @patch.dict("os.environ", {}, clear=True)
    def test_get_model_defaults_to_ollama_without_bedrock_creds(self):
        """Verify default model fallback is Ollama when no Bedrock credentials exist."""
        model = get_model()
        from strands.models.ollama import OllamaModel
        self.assertIsInstance(model, OllamaModel)


if __name__ == "__main__":
    unittest.main()