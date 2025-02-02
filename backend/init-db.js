const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Veritabanı bağlantısını oluştur
const db = new sqlite3.Database('database.sqlite');

// schema.sql dosyasını oku
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Her bir SQL komutunu ayrı ayrı çalıştır
db.serialize(() => {
    // Foreign key desteğini aktif et
    db.run('PRAGMA foreign_keys = ON');

    // schema.sql içindeki her bir komutu çalıştır
    schema.split(';').forEach((command) => {
        if (command.trim()) {
            db.run(command + ';', (err) => {
                if (err) {
                    console.error('Hata:', command, err);
                }
            });
        }
    });
});

// Bağlantıyı kapat
db.close((err) => {
    if (err) {
        console.error('Veritabanı kapatılırken hata:', err);
    } else {
        console.log('Veritabanı başarıyla oluşturuldu ve başlatıldı.');
    }
}); 