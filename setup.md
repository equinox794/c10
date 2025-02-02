Bu döküman, projeyi ilk kez kuracak veya güncelleyecek kullanıcıların/ekip üyelerinin hızlıca çalışır hale gelmesi için gereken adımları içerir.
1. Gereksinimler

    Node.js (v14+ veya v16+ önerilir)
    npm veya yarn
    Gerekirse Git (koda erişim için)
    (Opsiyonel) SQLite CLI veya GUI (veritabanını manuel incelemek istersen)

2. Proje Klasör Yapısı

my-project/
  ├─ backend/
  │   ├─ server.js            # Express giriş noktası
  │   ├─ db.sqlite            # SQLite veritabanı
  │   ├─ package.json
  │   └─ ...
  ├─ frontend/
  │   ├─ package.json
  │   ├─ pages/ or app/
  │   └─ ...
  ├─ README.md
  ├─ SETUP.md                 # Bu dosya
  ├─ API.md                   # Endpoint dökümantasyonu
  └─ .cursorules              # Cursor kuralları (opsiyonel)

    Dizindeki dosya ve klasör isimleri projeye göre değişebilir.

3. Kurulum Adımları
3.1. Projeyi İndirme

git clone https://github.com/user/my-project.git
cd my-project

3.2. Backend Kurulumu

    cd backend
    npm install
    Veritabanı Hazırlığı
        “db.sqlite” dosyası mevcutsa kullanılır. Yoksa “server.js” içinde CREATE TABLE IF NOT EXISTS ... sorguları varsa onlar ilk çalışmada tabloyu oluşturur.
    Çalıştırma

    node server.js

        Varsayılan port (örn. 3001) üzerinden API yayına geçer.

3.3. Frontend Kurulumu

    cd ../frontend
    npm install
    Geliştirme Modunda Çalıştırma

    npm run dev

        Genellikle localhost:3000 adresinde frontend arayüzüne erişebilirsin.

3.4. Ortam Değişkenleri (Opsiyonel)

    Eğer .env dosyası veya benzeri bir konfigürasyon gerekiyor ise, proje içinde bir .env.example görebilirsin.
    Bu dosyayı .env olarak kopyalayıp değerleri düzenle.

3.5. Yedekleme

    database.sqlite dosyasını bir backups/ klasörüne kopyalayarak yedek alabilirsin.
    Örnek bash script:

    cp backend/database.sqlite backups/database_$(date +%Y%m%d%H%M%S).sqlite

4. Sık Karşılaşılan Sorunlar

    Port Çakışması
        Port 3001 (backend) veya 3000 (frontend) dolu olabilir. .env veya server.js’te port numarasını değiştirebilirsin.

    Veritabanı Dosyası Eksik
        db.sqlite dosyası projeyle birlikte gelmediyse server.js tablosu oluşturma kodlarını ilk sefer çalıştırdığında otomatik oluşturabilir. Aksi takdirde hata alabilirsin.

    API Erişim Sorunu
        Frontend .env veya config dosyasında BASE_URL hatalı olabilir.
        Doğru port ve host bilgisini kontrol et (localhost:3001 vb.).

    Permission Hatası (Unix)
        Shell script veya kopyalama sırasında izinle ilgili hata alırsan chmod +x backup.sh gibi komutlarla izinleri ayarla.