const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Veritabanı düzeltme işlemleri
db.serialize(() => {
    // 1. Mevcut siparişleri yedekle
    db.run(`CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders`);
    
    // 2. Mevcut orders tablosunu sil
    db.run(`DROP TABLE IF EXISTS orders`);
    
    // 3. Yeni şema ile orders tablosunu oluştur
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        recipe_id INTEGER,
        quantity REAL DEFAULT 0,
        charge_count REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT CHECK(status IN ('Beklemede', 'Onaylandı', 'İptal')) DEFAULT 'Beklemede',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
    )`);
    
    // 4. Yedeklenen verileri geri yükle (sadece uyumlu alanları)
    db.run(`INSERT INTO orders (id, customer_id, total, status, created_at)
            SELECT id, customer_id, total, status, created_at 
            FROM orders_backup`);
            
    // 5. Yedek tabloyu sil
    db.run(`DROP TABLE IF EXISTS orders_backup`);
    
    console.log('Veritabanı şeması başarıyla güncellendi!');
    
    // Bağlantıyı kapat
    db.close();
}); 