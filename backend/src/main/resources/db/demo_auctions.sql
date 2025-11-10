-- Demo Auctions Data
-- This file contains sample auction data for testing and demonstration purposes
-- Run this after creating admin and test users

-- Note: Adjust seller_id based on your actual user IDs in the database
-- You can check user IDs with: SELECT user_id, username FROM users;

-- Sample Auction 1: Vintage Rolex Watch
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,  -- Change this to your seller's user_id
    'Vintage Rolex Submariner Watch',
    'Authentic 1960s Rolex Submariner in excellent condition. Comes with original box and papers. This timepiece is a true collector''s item with a beautiful patina on the dial. Recently serviced and keeping excellent time.',
    'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600',
    5000.00,
    5000.00,
    NOW(),
    NOW() + INTERVAL '7 days',
    INTERVAL '120 seconds',
    NOW() + INTERVAL '7 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 2: MacBook Pro M3
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'MacBook Pro 16" M3 Max (2024)',
    'Brand new MacBook Pro 16-inch with M3 Max chip, 48GB RAM, 2TB SSD. Space Black finish. Still sealed in original packaging with full warranty. Perfect for developers and creative professionals.',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
    2500.00,
    2500.00,
    NOW(),
    NOW() + INTERVAL '5 days',
    INTERVAL '120 seconds',
    NOW() + INTERVAL '5 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 3: PlayStation 5 Pro
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'Sony PlayStation 5 Pro Console',
    'Brand new PlayStation 5 Pro with 2TB storage. Includes one DualSense controller and cables. Never opened, factory sealed. Rare limited edition model.',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600',
    700.00,
    700.00,
    NOW(),
    NOW() + INTERVAL '3 days',
    INTERVAL '90 seconds',
    NOW() + INTERVAL '3 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 4: Vintage Vinyl Collection
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'Rare Beatles Vinyl Collection (1960s)',
    'Complete collection of original Beatles vinyl records from the 1960s. All albums in excellent condition with minimal wear. Includes Please Please Me, Rubber Soul, Revolver, Sgt. Pepper''s, and more. A must-have for serious collectors.',
    'https://images.unsplash.com/photo-1560173538-e8bb77d6d3b2?w=600',
    1500.00,
    1500.00,
    NOW(),
    NOW() + INTERVAL '10 days',
    INTERVAL '150 seconds',
    NOW() + INTERVAL '10 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 5: Canon EOS R5 Camera
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'Canon EOS R5 Mirrorless Camera + Lens Kit',
    'Professional-grade mirrorless camera with 45MP full-frame sensor. Includes RF 24-70mm f/2.8 lens, 3 batteries, charger, and camera bag. Shutter count under 5,000. Perfect condition.',
    'https://images.unsplash.com/photo-1606980668001-066a5e36bc66?w=600',
    3200.00,
    3200.00,
    NOW(),
    NOW() + INTERVAL '6 days',
    INTERVAL '120 seconds',
    NOW() + INTERVAL '6 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 6: Rare Pokemon Cards Set
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    '1st Edition Charizard Pokemon Card PSA 9',
    'Graded PSA 9 1st Edition Charizard from the Base Set. Mint condition, professionally graded and sealed. Serial number verified. Extremely rare and valuable collectible.',
    'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=600',
    8000.00,
    8000.00,
    NOW(),
    NOW() + INTERVAL '4 days',
    INTERVAL '180 seconds',
    NOW() + INTERVAL '4 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 7: Designer Handbag
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'Louis Vuitton Neverfull MM Bag',
    'Authentic Louis Vuitton Neverfull MM in Monogram canvas. Excellent condition with minimal signs of use. Comes with original dust bag and proof of purchase. Serial number verified.',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    1200.00,
    1200.00,
    NOW(),
    NOW() + INTERVAL '2 days',
    INTERVAL '90 seconds',
    NOW() + INTERVAL '2 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 8: Electric Bicycle
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'RadPower RadRunner Plus E-Bike',
    'High-performance electric bicycle with 750W motor. 45+ mile range, hydraulic disc brakes, and premium accessories included. Only 200 miles on odometer. Like new condition.',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600',
    1800.00,
    1800.00,
    NOW(),
    NOW() + INTERVAL '8 days',
    INTERVAL '120 seconds',
    NOW() + INTERVAL '8 days',
    'ACTIVE',
    NOW()
);

-- Sample Auction 9: Pending Auction (Scheduled for Future)
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'Gaming PC - RTX 4090 Build',
    'High-end gaming PC with RTX 4090, Intel i9-13900K, 64GB DDR5 RAM, 2TB NVMe SSD. Custom water cooling. Built 2 months ago, perfect condition. Includes all accessories.',
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600',
    3500.00,
    3500.00,
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '12 days',
    INTERVAL '120 seconds',
    NOW() + INTERVAL '12 days',
    'PENDING',
    NOW()
);

-- Sample Auction 10: Ended Auction (For Testing)
INSERT INTO auctions (
    seller_id,
    item_name,
    description,
    image_url,
    starting_price,
    current_price,
    start_time,
    mandatory_end_time,
    bid_gap_duration,
    current_deadline,
    status,
    created_at
) VALUES (
    2,
    'Antique Grandfather Clock',
    'Beautiful 19th-century oak grandfather clock. Fully working Westminster chime mechanism. Recently restored by professional clockmaker. A stunning piece of history.',
    'https://images.unsplash.com/photo-1594832506511-e7f18f138e31?w=600',
    2200.00,
    3200.00,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '3 days',
    INTERVAL '120 seconds',
    NOW() - INTERVAL '3 days',
    'ENDED',
    NOW() - INTERVAL '10 days'
);

-- Verification Query
-- Run this to see all demo auctions:
-- SELECT auction_id, item_name, starting_price, status, start_time, mandatory_end_time
-- FROM auctions
-- ORDER BY created_at DESC;
