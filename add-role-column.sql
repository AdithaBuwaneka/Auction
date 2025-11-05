-- Add role column to users table for authentication

-- Add role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Update existing users to have USER role (if any exist without role)
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- Create an admin user (update an existing user or create new one)
-- Option 1: Update existing user to admin
-- UPDATE users SET role = 'ADMIN' WHERE username = 'john_seller';

-- Option 2: Or manually set after registration
-- First register via API, then run:
-- UPDATE users SET role = 'ADMIN' WHERE username = 'admin';

-- Verify
SELECT user_id, username, email, role FROM users;
