-- -------------------------
-- USERS & AUTH
-- -------------------------

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',   -- customer | driver | admin
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- -------------------------
-- RESTAURANTS
-- -------------------------

CREATE TABLE restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    rating NUMERIC(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
    created_at TIMESTAMP DEFAULT NOW(),
    restaurant_img TEXT
);

-- -------------------------
-- MENU STRUCTURE
-- -------------------------

CREATE TABLE menu_categories (
    category_id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(restaurant_id),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE menu_items (
    item_id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(restaurant_id),
    category_id INT REFERENCES menu_categories(category_id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- Customization options (e.g., size, toppings)
CREATE TABLE item_options (
    option_id SERIAL PRIMARY KEY,
    item_id INT REFERENCES menu_items(item_id),
    name VARCHAR(100),
    additional_price NUMERIC(10,2) DEFAULT 0
);

-- Tags for foods
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, --pizza, burger, asian cuisine, dessert, doner, sushi, vegan
    img_url TEXT
);

--Restaurant tags
CREATE TABLE restaurant_tags (
    restaurant_tag_id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Multiple Tags for items
CREATE TABLE item_tags (
    item_tag_id SERIAL PRIMARY KEY,
    item_id INT REFERENCES menu_items(item_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE
);


-- -------------------------
-- ORDER MANAGEMENT
-- -------------------------

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    restaurant_id INT REFERENCES restaurants(restaurant_id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',  
        -- pending, accepted, preparing, picked_up, delivering, delivered, cancelled
    total_amount NUMERIC(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    placed_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    item_id INT REFERENCES menu_items(item_id),
    quantity INT NOT NULL,
    price_at_purchase NUMERIC(10,2) NOT NULL
);

-- options selected for each item
CREATE TABLE order_item_options (
    order_item_option_id SERIAL PRIMARY KEY,
    order_item_id INT REFERENCES order_items(order_item_id),
    option_id INT REFERENCES item_options(option_id)
);

-- -------------------------
-- PROMOTIONS
-- -------------------------

CREATE TABLE promotions (
    promo_id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(restaurant_id),
    code VARCHAR(50) UNIQUE,
    description TEXT,
    discount_percent INT,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE orders_promotions (
    order_promo_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    promo_id INT REFERENCES promotions(promo_id)
);

-- ----------------------
-- CART AND CART ITEMS
-- ----------------------
-- CART
CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) UNIQUE
);

-- CART ITEMS
CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES cart(cart_id),
    item_id INT REFERENCES menu_items(item_id),
    quantity INT NOT NULL,
    price_at_add NUMERIC(10,2) NOT NULL
);

-- CART ITEM OPTIONS
CREATE TABLE cart_item_options (
    cart_item_option_id SERIAL PRIMARY KEY,
    cart_item_id INT REFERENCES cart_items(cart_item_id),
    option_id INT REFERENCES item_options(option_id)
);

-- --------------------
-- DELIVERY TRACKING
-- --------------------
CREATE TABLE deliveries (
    delivery_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    driver_id INT REFERENCES users(user_id),
    status VARCHAR(30) NOT NULL DEFAULT 'assigned',
       -- assigned, picked_up, delivering, delivered, cancelled
    assigned_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- ---------------------
-- PAYMENT
-- ---------------------
CREATE TABLE credit_cards (
    card_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    card_nickname VARCHAR(50),
    card_brand VARCHAR(30),
    last_four VARCHAR(4),
    payment_method_token TEXT,
    expiry_month INT CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year INT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);