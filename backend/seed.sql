BEGIN TRANSACTION;

-------------------------------------------------------------------------------
-- 1. CUSTOMERS (Müşteriler / Firmalar)
-------------------------------------------------------------------------------
INSERT INTO customers (name, phone, email, address, balance)
VALUES
  ('Firma A', '555-111-1111', 'a@example.com', 'Ankara', 500),
  ('Firma B', '555-222-2222', 'b@example.com', 'Istanbul', 0);

-------------------------------------------------------------------------------
-- 2. STOCK (Stok / Ürünler / Hammaddeler)
-------------------------------------------------------------------------------
INSERT INTO stock (code, name, quantity, min_quantity, cost, price, unit, category)
VALUES
  ('ST-001', 'Hammadde A', 100, 10, 5.00, 8.00, 'kg', 'hammadde'),
  ('ST-002', 'Gubre X',    50,  5, 10.00, 15.00, 'kg', 'urun'),
  ('ST-003', 'Hammadde B', 200, 20, 3.00,  5.00, 'kg', 'hammadde');

-------------------------------------------------------------------------------
-- 3. RECIPES (Reçeteler / Formülasyonlar)
-------------------------------------------------------------------------------
INSERT INTO recipes (name, description, segment, total_cost)
VALUES
  ('NPK 20-20-20', '20-20-20 Formülü', 'Standart', 0),
  ('NPK 15-15-15', '15-15-15 Formülü', 'Ekonomik', 0);

-- 3.1 RECIPE_INGREDIENTS (Reçete İçeriği)
INSERT INTO recipe_ingredients (recipe_id, stock_id, quantity, unit_cost)
VALUES
  -- İlk reçete (NPK 20-20-20)
  (1, 1, 10, 5.00),  -- 10 birim Hammadde A
  (1, 3,  5, 3.00),  -- 5 birim Hammadde B

  -- İkinci reçete (NPK 15-15-15)
  (2, 3,  5, 3.00),
  (2, 1, 10, 5.00);

-------------------------------------------------------------------------------
-- 4. ORDERS (Sipariş & Teklif)
-------------------------------------------------------------------------------
INSERT INTO orders (customer_id, order_date, status, total, notes)
VALUES
  (1, datetime('now'), 'Beklemede', 0, 'Test siparişi'),
  (2, datetime('now'), 'Teklif',    0, 'Teklif örneği');

-- 4.1 ORDER_DETAILS (Sipariş Kalemleri)
INSERT INTO order_details (order_id, stock_id, quantity, price, total)
VALUES
  -- Sipariş 1, Firma A
  (1, 2, 5, 15.00, 75.00),  -- 5 adet Gubre X
  (1, 3, 3,  5.00, 15.00),  -- 3 adet Hammadde B

  -- Sipariş 2, Firma B (Teklif)
  (2, 2, 10, 15.00, 150.00);

-------------------------------------------------------------------------------
-- 5. TRANSACTIONS (Cari İşlemler)
-------------------------------------------------------------------------------
INSERT INTO transactions (customer_id, date, type, amount, due_date, notes)
VALUES
  (1, datetime('now'), 'Tahsilat',  200, '2025-03-01', 'Ödeme planı'),
  (1, datetime('now'), 'Fatura',   -100, '2025-03-05', 'Satış faturası'),
  (2, datetime('now'), 'Tahsilat',   50, '2025-03-10', 'Ön ödeme');

COMMIT; 