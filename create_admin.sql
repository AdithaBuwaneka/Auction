-- Create Admin User with BCrypt hashed password
-- Username: admin
-- Password: admin123
-- BCrypt hash generated for 'admin123'

INSERT INTO users (username, email, password_hash, role, balance, frozen_balance, is_active, created_at)
VALUES (
    'admin',
    'admin@auction.com',
    '$2a$10$dXJ3SW6G7P3EI8NHNqRr0.tMpfKWNlPV4DZwJp2vP8qCQJr7MHQEG',
    'ADMIN',
    100000.00,
    0.00,
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- Alternative: Update existing admin_user to have ADMIN role
UPDATE users
SET role = 'ADMIN'
WHERE username = 'admin_user';
