"""Tests for Cedar policy authorization."""

import unittest
from policy.authorize import authorize


class TestCedarPolicies(unittest.TestCase):

    def test_authorize_refund_allowed_under_100(self):
        """Test that a refund under $100 for refund-bot is allowed."""
        request = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {
                "amount": 49.99,
                "currency": "USD"
            }
        }
        response = authorize(request)
        self.assertEqual(response["decision"], "Allow")
        self.assertEqual(response["policy_id"], "base.cedar#refund-under-100")
        self.assertIn("refund-under-100", response["reason"])

    def test_authorize_refund_denied_over_100(self):
        """Test that a refund over $100 for refund-bot is denied."""
        request = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {
                "amount": 150.00,
                "currency": "USD"
            }
        }
        response = authorize(request)
        self.assertEqual(response["decision"], "Deny")
        self.assertIsNone(response["policy_id"])
        self.assertTrue(
            "no matching permit policy" in response["reason"] or "Denied" in response["reason"]
        )

    def test_authorize_unpermitted_action_denied(self):
        """Test that an unpermitted action (with no matching policy) is denied by default."""
        request = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"DeleteDatabase"',
            "resource": 'Order::"12345"',
            "context": {}
        }
        response = authorize(request)
        self.assertEqual(response["decision"], "Deny")
        self.assertIsNone(response["policy_id"])

    def test_authorize_unauthorized_agent_denied(self):
        """Test that an unpermitted agent principal is denied."""
        request = {
            "principal": 'Agent::"unauthorized-agent"',
            "action": 'Action::"IssueRefund"',
            "resource": 'Order::"12345"',
            "context": {
                "amount": 25,
                "currency": "USD"
            }
        }
        response = authorize(request)
        self.assertEqual(response["decision"], "Deny")
        self.assertIsNone(response["policy_id"])

    def test_authorize_read_order_allowed(self):
        """Test that ReadOrder action for refund-bot is allowed."""
        request = {
            "principal": 'Agent::"refund-bot"',
            "action": 'Action::"ReadOrder"',
            "resource": 'Order::"12345"',
            "context": {}
        }
        response = authorize(request)
        self.assertEqual(response["decision"], "Allow")
        self.assertEqual(response["policy_id"], "base.cedar#read-order")
        self.assertIn("read-order", response["reason"])


if __name__ == "__main__":
    unittest.main()
