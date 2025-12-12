-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS bidding_app;
USE bidding_app;

---------------------------------------------------------
-- USERS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- PRODUCTS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    starting_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    auction_end DATETIME NULL,
    winner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_winner_user
        FOREIGN KEY (winner_id) REFERENCES users(id)
        ON DELETE SET NULL
);

-- Index for automatic auction closing
CREATE INDEX idx_auction_end ON products(auction_end);

---------------------------------------------------------
-- BIDS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

---------------------------------------------------------
-- SEED DEFAULT ADMIN (email: admin@example.com, password: admin123)
-- HASH FOR 'admin123' = $2b$10$h3qv7yp8fK3uG8mH7z2p2eZB9z1vQjzBq8YF1ZpJq7b1rJkP1Q5eW
---------------------------------------------------------
INSERT INTO users (name, email, password, is_admin)
VALUES (
    'Admin',
    'admin@example.com',
    '$2b$10$h3qv7yp8fK3uG8mH7z2p2eZB9z1vQjzBq8YF1ZpJq7b1rJkP1Q5eW',
    1
);
