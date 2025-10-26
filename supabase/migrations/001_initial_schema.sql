-- Bioplant CRM - Initial Schema Migration
-- SQLite to PostgreSQL Migration
-- Created: 2025-10-26

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-------------------------------------------------------------------------------
-- 1. CUSTOMERS (MÜŞTERİLER / FİRMALAR)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Müşteri', 'Tedarikçi', 'Fason', 'Diğer', 'Bioplant')),
    phone TEXT,
    email TEXT,
    address TEXT,
    balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for search and filtering
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_type ON customers(type);
CREATE INDEX idx_customers_deleted ON customers(deleted_at) WHERE deleted_at IS NULL;

-------------------------------------------------------------------------------
-- 2. STOCK (ÜRÜNLER / HAMMADDELER)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    quantity DECIMAL(12,3) DEFAULT 0,
    min_quantity DECIMAL(12,3) DEFAULT 0,
    cost DECIMAL(12,2) DEFAULT 0,
    price DECIMAL(12,2) DEFAULT 0,
    unit TEXT DEFAULT 'kg',
    category TEXT DEFAULT 'hammadde' CHECK(category IN ('hammadde', 'ambalaj')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Indexes
CREATE INDEX idx_stock_name ON stock(name);
CREATE INDEX idx_stock_category ON stock(category);
CREATE INDEX idx_stock_code ON stock(code);
CREATE INDEX idx_stock_deleted ON stock(deleted_at) WHERE deleted_at IS NULL;

-------------------------------------------------------------------------------
-- 3. STOCK PRICE HISTORY
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_price_history (
    id BIGSERIAL PRIMARY KEY,
    stock_id BIGINT NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    old_price DECIMAL(12,2) NOT NULL,
    new_price DECIMAL(12,2) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by TEXT
);

CREATE INDEX idx_price_history_stock ON stock_price_history(stock_id);

-------------------------------------------------------------------------------
-- 4. PACKAGES (AMBALAJ)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
    id BIGSERIAL PRIMARY KEY,
    size DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('L', 'Kg')),
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    UNIQUE(size, unit)
);

CREATE INDEX idx_packages_deleted ON packages(deleted_at) WHERE deleted_at IS NULL;

-------------------------------------------------------------------------------
-- 5. PACKAGE PRICE HISTORY
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS package_price_history (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    old_price DECIMAL(12,2) NOT NULL,
    new_price DECIMAL(12,2) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by TEXT
);

CREATE INDEX idx_pkg_price_history ON package_price_history(package_id);

-------------------------------------------------------------------------------
-- 6. RECIPES (REÇETELER)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    density TEXT,
    total_cost DECIMAL(12,2) DEFAULT 0,
    is_price_updated BOOLEAN DEFAULT true,
    last_price_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Indexes
CREATE INDEX idx_recipes_customer ON recipes(customer_id);
CREATE INDEX idx_recipes_deleted ON recipes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_recipes_price_update ON recipes(is_price_updated);

-------------------------------------------------------------------------------
-- 7. RECIPE INGREDIENTS (REÇETE İÇERİKLERİ - HAMMADDE)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    stock_id BIGINT NOT NULL REFERENCES stock(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_stock ON recipe_ingredients(stock_id);

-------------------------------------------------------------------------------
-- 8. RECIPE PACKAGES (REÇETE AMBALAJ)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_packages (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    package_id BIGINT NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_packages_recipe ON recipe_packages(recipe_id);
CREATE INDEX idx_recipe_packages_package ON recipe_packages(package_id);

-------------------------------------------------------------------------------
-- 9. ORDERS (SİPARİŞLER)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE SET NULL,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    quantity DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'Beklemede' CHECK(status IN ('Beklemede', 'Hazırlanıyor', 'Tamamlandı', 'İptal')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_recipe ON orders(recipe_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date DESC);

-------------------------------------------------------------------------------
-- 10. ORDER DETAILS (SİPARİŞ KALEMLERİ)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_details (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stock_id BIGINT NOT NULL REFERENCES stock(id) ON DELETE RESTRICT,
    quantity DECIMAL(12,3) DEFAULT 1,
    price DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0
);

CREATE INDEX idx_order_details_order ON order_details(order_id);
CREATE INDEX idx_order_details_stock ON order_details(stock_id);

-------------------------------------------------------------------------------
-- 11. TRANSACTIONS (CARİ İŞLEMLER)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    type TEXT,
    amount DECIMAL(12,2) NOT NULL,
    due_date TIMESTAMPTZ,
    notes TEXT
);

CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);

-------------------------------------------------------------------------------
-- 12. SETTINGS (AYARLAR)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    dolar_kuru DECIMAL(10,4) NOT NULL DEFAULT 0,
    liste_a_kar_orani DECIMAL(5,2) NOT NULL DEFAULT 20,
    liste_b_kar_orani DECIMAL(5,2) NOT NULL DEFAULT 35,
    liste_c_kar_orani DECIMAL(5,2) NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings (if not exists)
INSERT INTO settings (id, dolar_kuru, liste_a_kar_orani, liste_b_kar_orani, liste_c_kar_orani)
VALUES (1, 36.0, 20.0, 35.0, 50.0)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- 13. TEKLIF SETTINGS (TEKLİF AYARLARI)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teklif_settings (
    id BIGSERIAL PRIMARY KEY,
    firma_adi TEXT NOT NULL,
    firma_adresi TEXT,
    firma_telefon TEXT,
    firma_email TEXT,
    firma_web TEXT,
    firma_vergi_dairesi TEXT,
    firma_vergi_no TEXT,
    banka_bilgileri TEXT,
    teklif_notu TEXT,
    teklif_gecerlilik TEXT DEFAULT '7 gün',
    teklif_sartlari TEXT,
    teklif_alt_not TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default teklif settings
INSERT INTO teklif_settings (
    firma_adi,
    firma_adresi,
    firma_telefon,
    firma_email,
    firma_web,
    firma_vergi_dairesi,
    firma_vergi_no,
    banka_bilgileri,
    teklif_notu,
    teklif_sartlari,
    teklif_alt_not
) VALUES (
    'BİOPLANT TARIM A.Ş.',
    'Organize Sanayi Bölgesi 2.Kısım 24.Cadde No:3 Döşemealtı/ANTALYA',
    '+90 242 502 38 38',
    'info@bioplant.com.tr',
    'www.bioplant.com.tr',
    'Döşemealtı',
    '1234567890',
    'Banka: XXX Bank
IBAN: TR00 0000 0000 0000 0000 0000 00
Şube: Merkez',
    'Sayın yetkili,
Talebiniz üzerine hazırlanan teklifimiz aşağıda bilgilerinize sunulmuştur.',
    '1. Fiyatlarımıza KDV dahil değildir.
2. Ödeme peşin veya maksimum 30 gün vadelidir.
3. Teslimat süresi sipariş tarihinden itibaren 7 iş günüdür.
4. Minimum sipariş miktarı uygulanmaktadır.
5. Nakliye alıcıya aittir.',
    'Teklifimizin tarafınızca olumlu değerlendirileceğini umar, işbirliğimizin devamını dileriz.
Saygılarımızla.'
)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- TRIGGERS
-------------------------------------------------------------------------------

-- Auto update timestamp on packages
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teklif_settings_updated_at BEFORE UPDATE ON teklif_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) - Basic Setup
-- Note: Customize based on your authentication strategy
-------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teklif_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for service role, customize for authenticated users)
-- For now, we'll allow all operations for authenticated users
-- TODO: Implement proper RLS policies based on user roles

CREATE POLICY "Enable all for service role" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON stock FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON packages FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON recipes FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON recipe_ingredients FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON recipe_packages FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON order_details FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON transactions FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON settings FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON teklif_settings FOR ALL USING (true);

-- Note: Price history tables don't need RLS as they're append-only
CREATE POLICY "Enable all for service role" ON stock_price_history FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON package_price_history FOR ALL USING (true);
