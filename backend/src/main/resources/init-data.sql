-- Initial Test Data for Auction System
-- This will be populated after the application creates the tables

-- Insert sample users (passwords are plain text for demo - should be hashed in production)
INSERT INTO users (username, email, password_hash, balance, is_active, created_at) VALUES
('john_seller', 'john@example.com', 'password123', 5000.00, true, CURRENT_TIMESTAMP),
('jane_buyer', 'jane@example.com', 'password123', 10000.00, true, CURRENT_TIMESTAMP),
('bob_bidder', 'bob@example.com', 'password123', 8000.00, true, CURRENT_TIMESTAMP),
('alice_user', 'alice@example.com', 'password123', 12000.00, true, CURRENT_TIMESTAMP),
('admin_user', 'admin@example.com', 'admin123', 50000.00, true, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Insert sample auctions
-- Note: Adjust timestamps based on your current time
INSERT INTO auctions (seller_id, item_name, description, image_url, starting_price, current_price,
                      start_time, mandatory_end_time, bid_gap_duration, current_deadline, status, created_at)
SELECT
    u.user_id,
    'Vintage Laptop',
    'High-performance laptop in excellent condition. Perfect for students and professionals.',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    500.00,
    500.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '24 hours',
    INTERVAL '2 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 hours',
    'ACTIVE',
    CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'john_seller'
ON CONFLICT DO NOTHING;

INSERT INTO auctions (seller_id, item_name, description, image_url, starting_price, current_price,
                      start_time, mandatory_end_time, bid_gap_duration, current_deadline, status, created_at)
SELECT
    u.user_id,
    'Smartphone - Latest Model',
    'Brand new smartphone with all accessories included. Warranty valid.',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    800.00,
    800.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '12 hours',
    INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '1 hour',
    'ACTIVE',
    CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'john_seller'
ON CONFLICT DO NOTHING;

INSERT INTO auctions (seller_id, item_name, description, image_url, starting_price, current_price,
                      start_time, mandatory_end_time, bid_gap_duration, current_deadline, status, created_at)
SELECT
    u.user_id,
    'Gaming Console',
    'PlayStation 5 with 2 controllers and 5 games. Like new condition.',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db',
    400.00,
    400.00,
    CURRENT_TIMESTAMP + INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '48 hours',
    INTERVAL '3 hours',
    NULL,
    'PENDING',
    CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'alice_user'
ON CONFLICT DO NOTHING;

-- Insert some sample bids
INSERT INTO bids (auction_id, bidder_id, bid_amount, status, bid_time)
SELECT
    a.auction_id,
    u.user_id,
    550.00,
    'OUTBID',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes'
FROM auctions a, users u
WHERE a.item_name = 'Vintage Laptop' AND u.username = 'jane_buyer'
ON CONFLICT DO NOTHING;

INSERT INTO bids (auction_id, bidder_id, bid_amount, status, bid_time)
SELECT
    a.auction_id,
    u.user_id,
    600.00,
    'WINNING',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
FROM auctions a, users u
WHERE a.item_name = 'Vintage Laptop' AND u.username = 'bob_bidder'
ON CONFLICT DO NOTHING;
