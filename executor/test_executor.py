"""Tests for executor actions and sandbox resources."""

import unittest
from executor.sandbox_resources import get_order, apply_refund, reset_sandbox
from executor.actions import issue_refund, read_order, execute_action


class TestExecutor(unittest.TestCase):

    def setUp(self):
        reset_sandbox()

    def test_get_order_success(self):
        order = get_order("12345")
        self.assertIsNotNone(order)
        self.assertEqual(order["id"], "12345")
        self.assertEqual(order["amount"], 100)
        self.assertEqual(order["refunded"], 0)

    def test_get_order_not_found(self):
        order = get_order("non-existent")
        self.assertIsNone(order)

    def test_apply_refund_success(self):
        updated = apply_refund("12345", 30)
        self.assertIsNotNone(updated)
        self.assertEqual(updated["refunded"], 30)

        # Apply another refund and check accumulation
        updated2 = apply_refund("12345", 20)
        self.assertEqual(updated2["refunded"], 50)

    def test_apply_refund_not_found(self):
        updated = apply_refund("non-existent", 30)
        self.assertIsNone(updated)

    def test_action_issue_refund_success(self):
        res = issue_refund("12345", 49.99)
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["action"], "IssueRefund")
        self.assertEqual(res["order_id"], "12345")
        self.assertEqual(res["amount"], 49.99)
        self.assertEqual(res["refunded_total"], 49.99)

    def test_action_issue_refund_not_found(self):
        res = issue_refund("99999", 50)
        self.assertEqual(res["status"], "error")
        self.assertIn("not found", res["message"])

    def test_action_read_order_success(self):
        res = read_order("67890")
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["action"], "ReadOrder")
        self.assertEqual(res["order_id"], "67890")
        self.assertEqual(res["order"]["id"], "67890")
        self.assertEqual(res["order"]["amount"], 250)

    def test_action_read_order_not_found(self):
        res = read_order("99999")
        self.assertEqual(res["status"], "error")
        self.assertIn("not found", res["message"])

    def test_execute_action_dispatch(self):
        res1 = execute_action('Action::"IssueRefund"', 'Order::"12345"', {"amount": 25})
        self.assertEqual(res1["status"], "success")
        self.assertEqual(res1["action"], "IssueRefund")

        res2 = execute_action('Action::"ReadOrder"', 'Order::"12345"')
        self.assertEqual(res2["status"], "success")
        self.assertEqual(res2["action"], "ReadOrder")

        res_unknown = execute_action('Action::"UnknownAction"', 'Order::"12345"')
        self.assertEqual(res_unknown["status"], "error")


if __name__ == "__main__":
    unittest.main()
