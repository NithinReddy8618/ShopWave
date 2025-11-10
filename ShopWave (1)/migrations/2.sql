
-- Add user_id column to cart_items table
ALTER TABLE cart_items ADD COLUMN user_id TEXT;

-- Create index for user-based cart lookups
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
