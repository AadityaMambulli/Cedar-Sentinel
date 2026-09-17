// Permit refund-bot to issue refunds up to 100
@id("refund-under-100")
permit(
    principal == Agent::"refund-bot",
    action == Action::"IssueRefund",
    resource is Order
) when {
    context.amount <= 100
};

// Permit refund-bot to read order details
@id("read-order")
permit(
    principal == Agent::"refund-bot",
    action == Action::"ReadOrder",
    resource is Order
);
