BEGIN TRANSACTION;

-- Yabancı anahtarları aktif etmek (SQLite)
PRAGMA foreign_keys = ON;

-------------------------------------------------------------------------------
-- 1. MÜŞTERİLER / FİRMALAR
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT (datetime('now'))
);

-------------------------------------------------------------------------------
-- 2. STOK (ÜRÜNLER / HAMMADDELER)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    min_quantity REAL DEFAULT 0,
    cost REAL DEFAULT 0,
    price REAL DEFAULT 0,
    unit TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
);

-------------------------------------------------------------------------------
-- 3. REÇETELER
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    segment TEXT,          -- örn: "Ekonomik", "Standart", "Premium"
    total_cost REAL DEFAULT 0,
    created_at DATETIME DEFAULT (datetime('now'))
);

-- 3.1 Reçete İçerikleri (Hammadde Listesi)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    quantity REAL DEFAULT 0,         -- kullanılan miktar
    unit_cost REAL DEFAULT 0,        -- eklenme anındaki cost
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE
);

-------------------------------------------------------------------------------
-- 4. SİPARİŞ & TEKLİF
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_date DATETIME DEFAULT (datetime('now')),
    status TEXT DEFAULT 'Beklemede',   -- "Teklif", "Beklemede", "Onaylandı", vb.
    total REAL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4.1 Sipariş Kalemleri
CREATE TABLE IF NOT EXISTS order_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    quantity REAL DEFAULT 1,
    price REAL DEFAULT 0,         -- eklenme anındaki satış fiyatı
    total REAL DEFAULT 0,         -- quantity * price (backend veya trigger ile hesaplanır)
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE
);

-------------------------------------------------------------------------------
-- 5. CARİ İŞLEMLER (BORÇ / ALACAK)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    date DATETIME DEFAULT (datetime('now')),
    type TEXT,                 -- örn: "Tahsilat", "Ödeme", "Fatura", vb.
    amount REAL NOT NULL,      -- pozitif = alacak, negatif = borç (veya type'a göre işlenir)
    due_date DATETIME,         -- vade tarihi (opsiyonel)
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

COMMIT;
