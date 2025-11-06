-- Add index on orders.payment_intent_id for webhook lookups
-- This index is critical for webhook performance as every webhook event
-- queries orders by payment_intent_id

CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id
ON orders(payment_intent_id)
WHERE payment_intent_id IS NOT NULL;

-- Analyze the orders table to update query planner statistics
ANALYZE orders;
