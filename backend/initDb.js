const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Veritabanı bağlantısı
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
        return;
    }
    console.log('Veritabanına bağlandı.');

    // Şema dosyasını oku ve çalıştır
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Şema oluşturma hatası:', err.message);
            return;
        }
        console.log('Tablolar oluşturuldu.');

        // Örnek verileri oku ve çalıştır
        const seed = fs.readFileSync('./seed.sql', 'utf8');
        db.exec(seed, (err) => {
            if (err) {
                console.error('Örnek veri yükleme hatası:', err.message);
                return;
            }
            console.log('Örnek veriler yüklendi.');
            
            // Bağlantıyı kapat
            db.close((err) => {
                if (err) {
                    console.error('Bağlantı kapatma hatası:', err.message);
                    return;
                }
                console.log('Veritabanı bağlantısı kapatıldı.');
            });
        });
    });
}); 