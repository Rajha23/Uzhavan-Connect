-- ============================================================
-- AGRIPULSE (SIH2026 - SIH26033) - Relational PostgreSQL Schema
-- Problem Statement: "Multiple intermediaries reduce farmers' earnings and increase consumer prices."
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(32) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('FARMER', 'FPO', 'BUYER', 'RETAILER', 'BULK_BUYER', 'BULK_PURCHASER', 'LOGISTICS', 'ADMIN', 'GOVERNMENT', 'SYSADMIN')),
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    organization VARCHAR(255),
    location VARCHAR(255),
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 1B. PROFILES TABLE (Canonical Application Profile linked to Auth User)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('FARMER', 'RETAIL_BUYER', 'BULK_BUYER', 'FPO_AGGREGATOR', 'LOGISTICS', 'ADMIN')),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(32),
    location VARCHAR(255),
    organization VARCHAR(255),
    village VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    farm_size_acres NUMERIC(10, 2),
    main_crops TEXT[],
    fpo_name VARCHAR(255),
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. FARMER PROFILES
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    village VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(16),
    main_crop VARCHAR(255),
    farm_size NUMERIC(10, 2), -- acres
    fpo_id VARCHAR(64),
    rating NUMERIC(3, 2) DEFAULT 4.9,
    total_listings INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    quantity_sold_kg NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user ON farmer_profiles(user_id);

-- 2B. BULK BUYER PROFILES (Food Processors, Wholesalers, Retail Chains)
CREATE TABLE IF NOT EXISTS bulk_buyer_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    buyer_type VARCHAR(128) DEFAULT 'Food Processor',
    procurement_capacity_mt NUMERIC(10, 2) DEFAULT 50.00,
    receiving_facility_address VARCHAR(255),
    gstin VARCHAR(32),
    rating NUMERIC(3, 2) DEFAULT 4.95,
    completed_bulk_orders INT DEFAULT 0,
    total_procured_kg NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bulk_buyer_profiles_user ON bulk_buyer_profiles(user_id);

-- 3. FPOS (Farmer Producer Organisations)
CREATE TABLE IF NOT EXISTS fpos (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    mobile VARCHAR(32),
    email VARCHAR(255),
    village VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    registration_number VARCHAR(128) UNIQUE,
    member_count INT DEFAULT 125,
    available_produce_kg NUMERIC(12, 2) DEFAULT 8500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCE LISTINGS
CREATE TABLE IF NOT EXISTS produce_listings (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    fpo_id VARCHAR(64) REFERENCES fpos(id) ON DELETE SET NULL,
    crop VARCHAR(128) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    quality VARCHAR(64) DEFAULT 'Standard',
    expected_price NUMERIC(10, 2) NOT NULL,
    available_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'POOLED', 'MATCHED', 'SOLD', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_produce_crop ON produce_listings(crop);
CREATE INDEX IF NOT EXISTS idx_produce_status ON produce_listings(status);

-- 5. DEMAND REQUESTS
CREATE TABLE IF NOT EXISTS demand_requests (
    id VARCHAR(64) PRIMARY KEY,
    buyer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    crop VARCHAR(128) NOT NULL DEFAULT 'Tomato',
    product VARCHAR(128) NOT NULL DEFAULT 'Tomato',
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
    quantity_kg NUMERIC(12, 2) DEFAULT 1000.00,
    location VARCHAR(255) NOT NULL,
    required_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '5 days',
    delivery_date DATE DEFAULT CURRENT_DATE + INTERVAL '5 days',
    delivery_time_window VARCHAR(128),
    quality VARCHAR(64) DEFAULT 'Grade A',
    quality_requirement VARCHAR(64) DEFAULT 'Grade A',
    max_price NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
    max_target_price_per_kg NUMERIC(10, 2) DEFAULT 35.00,
    buyer_name VARCHAR(255),
    buyer_type VARCHAR(64),
    status VARCHAR(32) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'POOLED', 'MATCHED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent column alignment: ensures both crop and product exist on pre-existing tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demand_requests') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demand_requests' AND column_name = 'crop') THEN
            ALTER TABLE demand_requests ADD COLUMN crop VARCHAR(128) DEFAULT 'Tomato';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demand_requests' AND column_name = 'product') THEN
            ALTER TABLE demand_requests ADD COLUMN product VARCHAR(128) DEFAULT 'Tomato';
            UPDATE demand_requests SET product = crop WHERE product IS NULL;
        ELSE
            UPDATE demand_requests SET crop = product WHERE crop IS NULL;
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demand_pools') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demand_pools' AND column_name = 'product') THEN
            ALTER TABLE demand_pools ADD COLUMN product VARCHAR(128) DEFAULT 'Tomato';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demand_pools' AND column_name = 'crop') THEN
            ALTER TABLE demand_pools ADD COLUMN crop VARCHAR(128) DEFAULT 'Tomato';
            UPDATE demand_pools SET crop = product WHERE crop IS NULL;
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forecasts') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forecasts' AND column_name = 'product') THEN
            ALTER TABLE forecasts ADD COLUMN product VARCHAR(128) DEFAULT 'Tomato';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forecasts' AND column_name = 'crop') THEN
            ALTER TABLE forecasts ADD COLUMN crop VARCHAR(128) DEFAULT 'Tomato';
            UPDATE forecasts SET crop = product WHERE crop IS NULL;
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'produce_batches') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produce_batches' AND column_name = 'product') THEN
            ALTER TABLE produce_batches ADD COLUMN product VARCHAR(128) DEFAULT 'Tomato';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produce_batches' AND column_name = 'crop') THEN
            ALTER TABLE produce_batches ADD COLUMN crop VARCHAR(128) DEFAULT 'Tomato';
            UPDATE produce_batches SET crop = product WHERE crop IS NULL;
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shipments' AND column_name = 'product') THEN
            ALTER TABLE shipments ADD COLUMN product VARCHAR(128) DEFAULT 'Tomato';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shipments' AND column_name = 'crop') THEN
            ALTER TABLE shipments ADD COLUMN crop VARCHAR(128) DEFAULT 'Tomato';
            UPDATE shipments SET crop = product WHERE crop IS NULL;
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_demand_product ON demand_requests(product);
CREATE INDEX IF NOT EXISTS idx_demand_crop ON demand_requests(crop);
CREATE INDEX IF NOT EXISTS idx_demand_status ON demand_requests(status);

-- 6. DEMAND POOLS
CREATE TABLE IF NOT EXISTS demand_pools (
    id VARCHAR(64) PRIMARY KEY,
    product VARCHAR(128) NOT NULL DEFAULT 'Tomato',
    crop VARCHAR(128) DEFAULT 'Tomato',
    total_quantity NUMERIC(12, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    required_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'AUCTIONING', 'ALLOCATED', 'FULFILLED')),
    forecast_baseline_kg NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. DEMAND POOL MEMBERS
CREATE TABLE IF NOT EXISTS demand_pool_members (
    id VARCHAR(64) PRIMARY KEY,
    pool_id VARCHAR(64) NOT NULL REFERENCES demand_pools(id) ON DELETE CASCADE,
    demand_request_id VARCHAR(64) NOT NULL REFERENCES demand_requests(id) ON DELETE CASCADE,
    contribution_kg NUMERIC(12, 2) NOT NULL
);

-- 8. FORECASTS
CREATE TABLE IF NOT EXISTS forecasts (
    id VARCHAR(64) PRIMARY KEY,
    product VARCHAR(128) NOT NULL,
    location VARCHAR(255) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_quantity NUMERIC(12, 2) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    current_supply NUMERIC(12, 2),
    shortage_gap NUMERIC(12, 2),
    model_version VARCHAR(64) DEFAULT 'v2.4-XGBoost-Ensemble',
    trend_signal VARCHAR(32) DEFAULT 'HIGH',
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. MATCHES
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    demand_id VARCHAR(64) REFERENCES demand_requests(id) ON DELETE SET NULL,
    farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    fpo_id VARCHAR(64) REFERENCES fpos(id) ON DELETE SET NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    distance NUMERIC(8, 2),
    quality_score NUMERIC(5, 2),
    reliability_score NUMERIC(5, 2),
    capacity_score NUMERIC(5, 2),
    match_score NUMERIC(5, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'ORDERED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PRICE OFFERS (Reverse Auction)
CREATE TABLE IF NOT EXISTS price_offers (
    id VARCHAR(64) PRIMARY KEY,
    demand_id VARCHAR(64) REFERENCES demand_requests(id) ON DELETE CASCADE,
    farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    fpo_id VARCHAR(64) REFERENCES fpos(id) ON DELETE SET NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    quality VARCHAR(64) DEFAULT 'Grade A',
    readiness_date TIMESTAMP WITH TIME ZONE,
    distance_km NUMERIC(8, 2),
    status VARCHAR(32) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'SELECTED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. SHIPMENTS
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(64) PRIMARY KEY,
    match_id VARCHAR(64) REFERENCES matches(id) ON DELETE SET NULL,
    product VARCHAR(128) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    delivery_location VARCHAR(255) NOT NULL,
    vehicle VARCHAR(128),
    driver_name VARCHAR(128),
    status VARCHAR(32) DEFAULT 'READY' CHECK (status IN ('READY', 'PICKUP', 'IN_TRANSIT', 'DELIVERED')),
    estimated_cost NUMERIC(10, 2),
    distance_km NUMERIC(8, 2),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. ROUTES
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(64) PRIMARY KEY,
    shipment_id VARCHAR(64) REFERENCES shipments(id) ON DELETE SET NULL,
    distance NUMERIC(8, 2) NOT NULL,
    distance_saved_km NUMERIC(8, 2),
    estimated_time VARCHAR(64),
    vehicle_utilization NUMERIC(5, 2),
    route_sequence JSONB,
    fuel_cost_saved NUMERIC(10, 2),
    status VARCHAR(32) DEFAULT 'OPTIMIZED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. PRODUCE BATCHES (Traceability Passport)
CREATE TABLE IF NOT EXISTS produce_batches (
    id VARCHAR(64) PRIMARY KEY,
    batch_code VARCHAR(128) UNIQUE NOT NULL,
    product VARCHAR(128) NOT NULL,
    farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    fpo_id VARCHAR(64) REFERENCES fpos(id) ON DELETE SET NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    harvest_date DATE NOT NULL,
    quality VARCHAR(64) DEFAULT 'Grade A',
    brix_sugar NUMERIC(4, 2),
    firmness NUMERIC(4, 2),
    pesticide_pass BOOLEAN DEFAULT TRUE,
    collection_center VARCHAR(255),
    status VARCHAR(64) DEFAULT 'In Transit' CHECK (status IN ('Harvested', 'Collected', 'Quality Checked', 'Packed', 'In Transit', 'Delivered')),
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_produce_batches_code ON produce_batches(batch_code);

-- 14. SETTLEMENTS
CREATE TABLE IF NOT EXISTS settlements (
    id VARCHAR(64) PRIMARY KEY,
    shipment_id VARCHAR(64) REFERENCES shipments(id) ON DELETE SET NULL,
    farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    fpo_id VARCHAR(64) REFERENCES fpos(id) ON DELETE SET NULL,
    gross_amount NUMERIC(12, 2) NOT NULL,
    transport_cost NUMERIC(10, 2) NOT NULL,
    packaging_cost NUMERIC(10, 2) NOT NULL,
    platform_cost NUMERIC(10, 2) NOT NULL,
    net_farmer_amount NUMERIC(12, 2) NOT NULL,
    farmer_realization_pct NUMERIC(5, 2) DEFAULT 85.90,
    utr_number VARCHAR(128),
    status VARCHAR(32) DEFAULT 'SETTLED' CHECK (status IN ('PENDING', 'PROCESSING', 'SETTLED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'INFO' CHECK (type IN ('DEMAND', 'MATCH', 'OFFER', 'LOGISTICS', 'PAYMENT', 'INFO')),
    is_read BOOLEAN DEFAULT FALSE,
    action_link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================
-- SEED DATA (SIH2026 Evaluation Scenarios)
-- Password for all default accounts is: AgriPulse@2026
-- BCrypt hash: $2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.
-- ============================================================

INSERT INTO users (id, name, email, mobile, password_hash, role, organization, location, avatar) VALUES
('usr_farmer_01', 'Rajesh Kumar', 'rajesh.kumar@agripulse.gov.in', '+91 94441 20001', '$2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.', 'FARMER', 'Sunguvarchatram Cluster', 'Kanchipuram, Tamil Nadu', '👨‍🌾'),
('usr_retailer_01', 'Anita Sharma', 'anita.procurement@abcretail.in', '+91 98840 30002', '$2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.', 'RETAILER', 'ABC Retail Stores', 'Chennai Metro Hub', '🏪'),
('usr_bulk_01', 'Vikram Mehta', 'vikram.mehta@grandfoodservice.com', '+91 97711 40003', '$2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.', 'BULK_PURCHASER', 'Grand Hospitality Group', 'Chennai Central Wholesale', '🏢'),
('usr_fpo_01', 'Ramanathan S.', 'contact@greenharvestfpo.org', '+91 96622 50004', '$2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.', 'FPO', 'GreenHarvest FPO', 'Sriperumbudur, Tamil Nadu', '🌾'),
('usr_logistics_01', 'Karthik S.', 'dispatch@greentransit.in', '+91 95533 60005', '$2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.', 'LOGISTICS', 'GreenTransit Cold Chain', 'Kanchipuram Corridor', '🚚'),
('usr_gov_01', 'Dr. A. Swaminathan', 'director.agripulse@consumeraffairs.gov.in', '+91 94422 70006', '$2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.', 'GOVERNMENT', 'Ministry of Consumer Affairs', 'New Delhi & Regional TN', '🏛️'),
('usr_sysadmin_01', 'Tejaswini V.', 'admin.tejas@agripulse.gov.in', '+91 93311 80007', '$2a$10$w8T0M57eGqH2cR3/m4L6qufQnF6lE8sW7bC1J2dE3fG4hI5jK6lM.', 'SYSADMIN', 'AgriPulse Tech Directorate', 'Chennai Tech Centre', '⚙️')
ON CONFLICT (id) DO NOTHING;

INSERT INTO farmer_profiles (id, user_id, village, district, state, pincode, main_crop, farm_size, fpo_id, total_listings, completed_orders, quantity_sold_kg) VALUES
('fp_01', 'usr_farmer_01', 'Sunguvarchatram', 'Kanchipuram', 'Tamil Nadu', '602106', 'Tomato', 3.5, 'fpo_01', 4, 28, 14200.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO fpos (id, name, contact_person, mobile, email, village, district, state, registration_number, member_count, available_produce_kg) VALUES
('fpo_01', 'GreenHarvest FPO', 'Ramanathan S.', '+91 96622 50004', 'contact@greenharvestfpo.org', 'Sriperumbudur', 'Kanchipuram', 'Tamil Nadu', 'FPO-TN-2024-8891', 125, 8500.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO forecasts (id, product, location, forecast_date, predicted_quantity, confidence, current_supply, shortage_gap, trend_signal, recommended_action) VALUES
('fc_tom_01', 'Tomato', 'Chennai Corridor', CURRENT_DATE + INTERVAL '7 days', 8500.00, 82.00, 6900.00, 1600.00, 'HIGH', 'Consider supplying more tomatoes if suitable for your farm.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO produce_batches (id, batch_code, product, farmer_id, fpo_id, quantity, harvest_date, quality, brix_sugar, firmness, pesticide_pass, collection_center, status, qr_code) VALUES
('pb_01', 'AGP-TOM-2026-001', 'Tomato', 'usr_farmer_01', 'fpo_01', 3000.00, '2026-09-06', 'Grade A', 4.85, 3.42, TRUE, 'Sriperumbudur Hub Bay 2', 'In Transit', 'https://agripulse.gov.in/trace/AGP-TOM-2026-001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, name, email, phone, role, organization, location, avatar) VALUES
('usr_farmer_01', 'Rajesh Kumar', 'rajesh.kumar@uzhavanconnect.gov.in', '9840123456', 'FARMER', 'Sunguvarchatram Cluster', 'Kanchipuram, Tamil Nadu', '👨‍🌾'),
('usr_retailer_01', 'Anita Sharma', 'anita.procurement@abcretail.in', '9884055667', 'RETAIL_BUYER', 'ABC Retail Stores', 'Chennai Metro Hub', '🏬'),
('usr_bulk_01', 'Vikramaditya Singhania', 'vikram.procurement@metroagri.in', '9840288990', 'BULK_BUYER', 'Metro Agri Wholesale', 'Ambattur Hub, Chennai', '🏭'),
('usr_fpo_01', 'Ramanathan S.', 'ravi.fpo@uzhavanconnect.gov.in', '9770011223', 'FPO_AGGREGATOR', 'GreenHarvest FPO', 'Sriperumbudur, Tamil Nadu', '🌾'),
('usr_logistics_01', 'Karthik S.', 'dispatch@sundartrans.in', '9660022334', 'LOGISTICS', 'GreenTransit Cold Chain', 'Kanchipuram Corridor', '🚚'),
('usr_admin_01', 'System Administrator', 'admin@uzhavanconnect.gov.in', '9900011122', 'ADMIN', 'Ministry of Consumer Affairs', 'Regional Directorate TN', '⚙️')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforces backend and database-level authorization independently from frontend UI
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- 0. Profiles table policies: authenticated users can view/edit their own profile; Admins can view all
DROP POLICY IF EXISTS profile_read_policy ON profiles;
CREATE POLICY profile_read_policy ON profiles
    FOR SELECT
    USING (id = current_setting('request.jwt.claim.sub', true) OR (SELECT role FROM profiles WHERE id = current_setting('request.jwt.claim.sub', true)) = 'ADMIN');

DROP POLICY IF EXISTS profile_update_policy ON profiles;
CREATE POLICY profile_update_policy ON profiles
    FOR UPDATE
    USING (id = current_setting('request.jwt.claim.sub', true))
    WITH CHECK (id = current_setting('request.jwt.claim.sub', true));

DROP POLICY IF EXISTS profile_insert_policy ON profiles;
CREATE POLICY profile_insert_policy ON profiles
    FOR INSERT
    WITH CHECK (id = current_setting('request.jwt.claim.sub', true));

-- 1. Users table policies: users can read their own profile or platform admins can inspect
DROP POLICY IF EXISTS user_read_policy ON users;
CREATE POLICY user_read_policy ON users
    FOR SELECT
    USING (id = current_setting('request.jwt.claim.sub', true) OR role IN ('ADMIN', 'SYSADMIN', 'GOVERNMENT'));

DROP POLICY IF EXISTS user_update_policy ON users;
CREATE POLICY user_update_policy ON users
    FOR UPDATE
    USING (id = current_setting('request.jwt.claim.sub', true));

-- 2. Farmer profiles policies: farmer can view/edit own profile, FPO/Admin can view
DROP POLICY IF EXISTS farmer_profile_policy ON farmer_profiles;
CREATE POLICY farmer_profile_policy ON farmer_profiles
    FOR ALL
    USING (user_id = current_setting('request.jwt.claim.sub', true) OR EXISTS (
        SELECT 1 FROM users WHERE id = current_setting('request.jwt.claim.sub', true) AND role IN ('ADMIN', 'FPO', 'SYSADMIN')
    ));

-- 3. Produce listings policies: readable for market matching; only Farmer/FPO/Admin can create
DROP POLICY IF EXISTS produce_read_policy ON produce_listings;
CREATE POLICY produce_read_policy ON produce_listings
    FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS produce_write_policy ON produce_listings;
CREATE POLICY produce_write_policy ON produce_listings
    FOR INSERT
    WITH CHECK (farmer_id = current_setting('request.jwt.claim.sub', true) OR EXISTS (
        SELECT 1 FROM users WHERE id = current_setting('request.jwt.claim.sub', true) AND role IN ('FARMER', 'FPO', 'ADMIN')
    ));

-- 4. Demand requests policies: readable for matching; only Buyer/Admin can create
DROP POLICY IF EXISTS demand_read_policy ON demand_requests;
CREATE POLICY demand_read_policy ON demand_requests
    FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS demand_write_policy ON demand_requests;
CREATE POLICY demand_write_policy ON demand_requests
    FOR INSERT
    WITH CHECK (buyer_id = current_setting('request.jwt.claim.sub', true) OR EXISTS (
        SELECT 1 FROM users WHERE id = current_setting('request.jwt.claim.sub', true) AND role IN ('BUYER', 'RETAILER', 'BULK_PURCHASER', 'ADMIN')
    ));

-- 5. Shipments policies: Logistics and Admins only
DROP POLICY IF EXISTS shipment_policy ON shipments;
CREATE POLICY shipment_policy ON shipments
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = current_setting('request.jwt.claim.sub', true) AND role IN ('LOGISTICS', 'ADMIN', 'SYSADMIN')
    ));

-- 6. Settlements policies: Farmer can view their own, Admins & FPOs can view
DROP POLICY IF EXISTS settlement_policy ON settlements;
CREATE POLICY settlement_policy ON settlements
    FOR SELECT
    USING (farmer_id = current_setting('request.jwt.claim.sub', true) OR EXISTS (
        SELECT 1 FROM users WHERE id = current_setting('request.jwt.claim.sub', true) AND role IN ('ADMIN', 'SYSADMIN', 'GOVERNMENT', 'FPO')
    ));

