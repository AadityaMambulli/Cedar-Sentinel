"""Tests for the end-to-end pipeline."""

import unittest
from unittest.mock import MagicMock
from pipeline import run_pipeline
from executor.sandbox_resources import reset_sandbox


class TestPipeline(unittest.TestCase):

    def setUp(self):
        reset_sandbox()

    def test_pipeline_allowed_action(self):
        req = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {
                "amount": 49.99,
                "currency": "USD"
            }
        }
        mock_os = MagicMock()
        audit_entry = run_pipeline(req, os_client=mock_os)

        self.assertEqual(audit_entry["decision"], "Allow")
        self.assertEqual(audit_entry["policy_id"], "base.cedar#refund-under-100")
        self.assertIsNotNone(audit_entry["action_result"])
        self.assertEqual(audit_entry["action_result"]["status"], "success")
        self.assertEqual(audit_entry["action_result"]["order_id"], "12345")
        mock_os.index.assert_called_once()

    def test_pipeline_denied_action_over_limit(self):
        req = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {
                "amount": 150.00,
                "currency": "USD"
            }
        }
        mock_os = MagicMock()
        audit_entry = run_pipeline(req, os_client=mock_os)

        self.assertEqual(audit_entry["decision"], "Deny")
        self.assertIsNone(audit_entry["policy_id"])
        self.assertIsNone(audit_entry["action_result"])
        mock_os.index.assert_called_once()

    def test_pipeline_denied_unpermitted_action(self):
        req = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"DeleteOrder"',
            "resource": 'Order::"12345"',
            "context": {}
        }
        mock_os = MagicMock()
        audit_entry = run_pipeline(req, os_client=mock_os)

        self.assertEqual(audit_entry["decision"], "Deny")
        self.assertIsNone(audit_entry["policy_id"])
        self.assertIsNone(audit_entry["action_result"])
        mock_os.index.assert_called_once()


if __name__ == "__main__":
    unittest.main()
