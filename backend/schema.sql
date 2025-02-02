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
    category TEXT DEFAULT 'hammadde',
    created_at DATETIME DEFAULT (datetime('now'))
);

-------------------------------------------------------------------------------
-- 3. REÇETELER
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    customer_id INTEGER NOT NULL,
    density TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS recipe_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (stock_id) REFERENCES stock(id)
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

-------------------------------------------------------------------------------
-- AMBALAJ
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    size REAL NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('L', 'Kg')),
    price REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    UNIQUE(size, unit)
);

-------------------------------------------------------------------------------
-- AYARLAR
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dolar_kuru REAL NOT NULL DEFAULT 0,
    liste_a_kar_orani REAL NOT NULL DEFAULT 20,
    liste_b_kar_orani REAL NOT NULL DEFAULT 35,
    liste_c_kar_orani REAL NOT NULL DEFAULT 50,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Varsayılan ayarları ekle (eğer tablo boşsa)
INSERT OR IGNORE INTO settings (id, dolar_kuru, liste_a_kar_orani, liste_b_kar_orani, liste_c_kar_orani)
VALUES (1, 30.0, 20.0, 35.0, 50.0);

-- Teklif Şablonu Ayarları
CREATE TABLE IF NOT EXISTS teklif_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Varsayılan teklif ayarlarını ekle
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
    'Banka: XXX Bank\nIBAN: TR00 0000 0000 0000 0000 0000 00\nŞube: Merkez',
    'Sayın yetkili,\nTalebiniz üzerine hazırlanan teklifimiz aşağıda bilgilerinize sunulmuştur.',
    '1. Fiyatlarımıza KDV dahil değildir.\n2. Ödeme peşin veya maksimum 30 gün vadelidir.\n3. Teslimat süresi sipariş tarihinden itibaren 7 iş günüdür.\n4. Minimum sipariş miktarı uygulanmaktadır.\n5. Nakliye alıcıya aittir.',
    'Teklifimizin tarafınızca olumlu değerlendirileceğini umar, işbirliğimizin devamını dileriz.\nSaygılarımızla.'
);

COMMIT; 