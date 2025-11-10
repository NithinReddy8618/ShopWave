
-- Remove the index and column
DROP INDEX idx_cart_items_user_id;
ALTER TABLE cart_items DROP COLUMN user_id;
