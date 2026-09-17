"""Tests for audit logger and query helpers."""

import unittest
from unittest.mock import MagicMock, patch
from audit.logger import log_decision
from audit.query_helpers import search_logs, get_log_by_id


class TestAudit(unittest.TestCase):

    def test_log_decision_allow_shape(self):
        decision = {
            "decision": "Allow",
            "reason": "Matched policy: refund-under-100",
            "policy_id": "base.cedar#refund-under-100"
        }
        action_result = {
            "status": "success",
            "action": "IssueRefund",
            "order_id": "12345",
            "amount": 49.99
        }
        request = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {"amount": 49.99, "currency": "USD"}
        }

        mock_client = MagicMock()
        entry = log_decision(decision, action_result, request=request, client=mock_client)

        self.assertIn("id", entry)
        self.assertIn("timestamp", entry)
        self.assertEqual(entry["decision"], "Allow")
        self.assertEqual(entry["reason"], "Matched policy: refund-under-100")
        self.assertEqual(entry["policy_id"], "base.cedar#refund-under-100")
        self.assertEqual(entry["action_result"], action_result)
        self.assertEqual(entry["principal"], 'Agent::"refund-bot"')

        mock_client.index.assert_called_once()

    @patch("audit.logger.get_opensearch_client", return_value=None)
    def test_log_decision_deny_shape(self, _mock_get_client):
        decision = {
            "decision": "Deny",
            "reason": "Denied by default: no matching permit policy",
            "policy_id": None
        }
        entry = log_decision(decision, action_result=None)

        self.assertIn("id", entry)
        self.assertIn("timestamp", entry)
        self.assertEqual(entry["decision"], "Deny")
        self.assertIsNone(entry["policy_id"])
        self.assertIsNone(entry["action_result"])

    def test_search_logs_with_mock_client(self):
        mock_client = MagicMock()
        mock_client.search.return_value = {
            "hits": {
                "hits": [
                    {
                        "_source": {
                            "id": "log-1",
                            "decision": "Allow",
                            "principal": 'Agent::"refund-bot"',
                            "timestamp": "2026-09-17T12:00:00Z"
                        }
                    }
                ]
            }
        }

        results = search_logs(agent='refund-bot', decision='Allow', limit=10, client=mock_client)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "log-1")
        mock_client.search.assert_called_once()

    def test_get_log_by_id_with_mock_client(self):
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "_source": {
                "id": "log-123",
                "decision": "Allow",
                "reason": "Matched policy: refund-under-100"
            }
        }

        log = get_log_by_id("log-123", client=mock_client)
        self.assertIsNotNone(log)
        self.assertEqual(log["id"], "log-123")
        mock_client.get.assert_called_once()

    @patch("audit.query_helpers.get_opensearch_client", return_value=None)
    def test_query_helpers_fallback_when_no_client(self, _mock_get_client):
        results = search_logs(client=None)
        self.assertEqual(results, [])

        log = get_log_by_id("non-existent", client=None)
        self.assertIsNone(log)


if __name__ == "__main__":
    unittest.main()
