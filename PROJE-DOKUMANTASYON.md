# BIOPLANT CRM - TAM PROJE DOKÜMANTASYONU

## 📋 PROJE GENEL BİLGİLER

### Proje Adı
**Bioplant CRM & Reçete Yönetim Sistemi**

### Proje Amacı
Tarımsal gübre ve kimyasal ürün üreten firmalar için geliştirilmiş, reçete bazlı üretim yönetimi, müşteri takibi, stok kontrolü ve teklif oluşturma sistemi.

### Hedef Kullanıcı
- Başlangıç: Tek kullanıcı (firma sahibi)
- Gelecek: Multi-tenant SaaS modeli

### Teknoloji Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI (UI Components)
- Lucide React (Icons)
- date-fns (Date manipulation)
- xlsx (Excel import/export)

**Backend:**
- Node.js
- Express.js 4.18
- SQLite3 (Veritabanı)
- PDFKit (PDF oluşturma)
- JWT (Authentication)
- bcrypt (Password hashing)
- winston (Logging)
- multer (File upload)
- cors

**DevOps:**
- Docker & Docker Compose
- Git

---

## 🗂️ PROJE KLASÖR YAPISI

```
c10/
├── backend/
│   ├── server.js                 # Ana Express sunucusu
│   ├── pdfGenerator.js           # PDF oluşturma servisi
│   ├── database.sqlite           # SQLite veritabanı
│   ├── package.json
│   ├── Dockerfile
│   ├── utils/
│   │   ├── logger.js             # Winston logger
│   │   └── auth/
│   │       ├── authService.js    # Auth işlemleri
│   │       └── authMiddleware.js # JWT middleware
│   ├── uploads/                  # Yüklenen dosyalar
│   ├── backups/                  # Veritabanı yedekleri
│   ├── images/                   # Statik görseller
│   └── fonts/                    # PDF fontları
│
├── frontend/
│   ├── app/
│   │   ├── page.js               # Dashboard (Ana sayfa)
│   │   ├── layout.js             # Root layout (Sidebar dahil)
│   │   ├── globals.css           # Global stiller
│   │   ├── login/
│   │   │   └── page.js           # Login sayfası
│   │   ├── stok/
│   │   │   └── page.js           # Stok yönetimi
│   │   ├── cari/
│   │   │   └── page.js           # Cari hesap yönetimi
│   │   ├── recete/
│   │   │   └── page.js           # Reçete yönetimi
│   │   ├── siparis/
│   │   │   └── page.js           # Sipariş & Teklif
│   │   └── ayarlar/
│   │       └── page.js           # Ayarlar
│   ├── components/
│   │   ├── sidebar.tsx           # Sol menü
│   │   ├── ui/                   # Shadcn UI bileşenleri
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   └── label.tsx
│   │   └── multi-packaging-selector.tsx
│   ├── services/
│   │   └── api.js                # API servis katmanı
│   ├── lib/
│   │   └── utils.ts              # Yardımcı fonksiyonlar
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml
├── schema.sql                     # Veritabanı şeması
├── seed.sql                       # Örnek veriler
├── setup.md                       # Kurulum talimatları
├── api.md                         # API dokümantasyonu
└── README.md
```

---

## 🗄️ VERİTABANI ŞEMASI

### Tablolar ve İlişkiler

#### 1. **customers** (Cari Hesaplar)
```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Müşteri', 'Tedarikçi', 'Fason', 'Diğer', 'Bioplant')),
    email TEXT,
    phone TEXT,
    address TEXT,
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);
```

**Özellikler:**
- Soft delete (deleted_at)
- Müşteri/Tedarikçi ayrımı
- Bakiye takibi

#### 2. **stock** (Stok/Hammaddeler)
```sql
CREATE TABLE stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT DEFAULT NULL,
    quantity REAL DEFAULT 0,
    min_quantity REAL DEFAULT 0,
    unit TEXT DEFAULT 'kg',
    category TEXT DEFAULT 'hammadde',
    price REAL DEFAULT 0,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    deleted_at DATETIME DEFAULT NULL
);
```

**Özellikler:**
- Kritik stok takibi (min_quantity)
- Birim yönetimi (kg, L, etc.)
- Kategori (hammadde, mamul, vb.)
- Soft delete

#### 3. **recipes** (Reçeteler)
```sql
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    customer_id INTEGER NOT NULL,
    density TEXT,
    total_cost REAL DEFAULT 0,
    is_price_updated BOOLEAN DEFAULT true,
    last_price_update DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**Özellikler:**
- Müşteriye özel reçeteler
- Otomatik maliyet hesaplama
- Fiyat güncelleme takibi

#### 4. **recipe_ingredients** (Reçete İçerikleri)
```sql
CREATE TABLE recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stock(id)
);
```

#### 5. **packages** (Ambalajlar)
```sql
CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    size REAL NOT NULL,
    unit TEXT NOT NULL CHECK(unit IN ('L', 'Kg')),
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);
```

#### 6. **recipe_packages** (Reçete-Ambalaj İlişkisi)
```sql
CREATE TABLE recipe_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id)
);
```

#### 7. **orders** (Siparişler)
```sql
CREATE TABLE orders (
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
);
```

#### 8. **settings** (Sistem Ayarları)
```sql
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dolar_kuru REAL DEFAULT 0,
    liste_a_kar_orani REAL DEFAULT 20,
    liste_b_kar_orani REAL DEFAULT 35,
    liste_c_kar_orani REAL DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Varsayılan Değerler:**
- Dolar kuru: 36.0
- Liste A kar oranı: %20
- Liste B kar oranı: %35
- Liste C kar oranı: %50

---

## 🎨 KULLANICI ARAYÜZÜ (UI)

### Renk Paleti (Tailwind)
- **Arka Plan**: bg-slate-900 (Ana), bg-slate-800 (Kartlar)
- **Kenarlık**: border-slate-700
- **Metin**: text-white, text-slate-300, text-slate-400
- **Vurgu Renkleri**:
  - Mavi: blue-500 (Müşteriler)
  - Mor: purple-500 (Siparişler)
  - Kırmızı: red-500 (Kritik Stok)
  - Yeşil: green-500 (Reçeteler)

### Layout Yapısı
```
┌─────────────────────────────────────┐
│  [Sidebar]  │   [Main Content]      │
│             │                       │
│  Dashboard  │   Content Area        │
│  Stok       │                       │
│  Cari       │                       │
│  Sipariş    │                       │
│  Reçete     │                       │
│  Ayarlar    │                       │
└─────────────────────────────────────┘
```

---

## 📱 SAYFALAR VE ÖZELLİKLER

### 1. Dashboard (Ana Sayfa)

**Path:** `/`

**Özellikler:**
- İstatistik kartları (4 adet):
  - Toplam Müşteri
  - Aktif Siparişler
  - Kritik Stok
  - Aktif Reçeteler
- Aktif siparişler tablosu
- Uyarılar paneli (kritik stok bildirimleri)

**API Çağrıları:**
- `GET /api/active-orders`

**UI Bileşenleri:**
- Stat Cards (Icons: Users, ClipboardList, AlertTriangle, FileText)
- Table (Aktif siparişler)
- Alert Box (Kritik stok uyarısı)

---

### 2. Stok Yönetimi

**Path:** `/stok`

**Özellikler:**
- Stok listesi (tablo)
- Yeni stok ekleme (dialog)
- Stok düzenleme
- Stok silme (soft delete)
- Excel ile toplu stok ekleme
- Kritik stok filtresi
- Arama fonksiyonu

**Form Alanları:**
- Ürün adı (zorunlu)
- Ürün kodu
- Miktar
- Kritik stok seviyesi
- Birim (kg, L)
- Kategori (hammadde, mamul)
- Fiyat

**API Endpoints:**
```
GET    /api/stock              # Tüm stokları getir
POST   /api/stock              # Yeni stok ekle
PUT    /api/stock/:id          # Stok güncelle
DELETE /api/stock/:id          # Stok sil (soft)
POST   /api/stock/bulk         # Toplu stok ekleme (Excel)
PUT    /api/stock/:id/price    # Fiyat güncelle
```

**Excel Import Formatı:**
| urun_adi | miktar | birim | fiyat | stok_turu | kritik_stok_miktari |
|----------|--------|-------|-------|-----------|---------------------|
| MAP      | 1000   | KG    | 15.0  | hammadde  | 100                 |

**Özel Özellikler:**
- Mükerrer kayıt kontrolü
- Fiyat değiştiğinde ilgili reçeteleri otomatik işaretleme
- Kritik stok altındaki ürünleri vurgulama

---

### 3. Cari Hesaplar

**Path:** `/cari`

**Özellikler:**
- Cari listesi
- Yeni cari ekleme
- Cari düzenleme
- Cari silme
- Excel ile toplu cari ekleme
- Tip filtreleme (Müşteri/Tedarikçi/Fason/Diğer/Bioplant)
- Arama

**Form Alanları:**
- Cari adı (zorunlu)
- Cari tipi (select - zorunlu)
- Email
- Telefon
- Adres

**API Endpoints:**
```
GET    /api/customers          # Tüm cariler
GET    /api/customers/:id      # Tek cari
POST   /api/customers          # Yeni cari
PUT    /api/customers/:id      # Cari güncelle
DELETE /api/customers/:id      # Cari sil
POST   /api/customers/bulk     # Toplu ekleme
```

**Özel Özellikler:**
- Mükerrer isim kontrolü (case-insensitive)
- Bakiye gösterimi
- Tip bazlı renklendirme

---

### 4. Reçete Yönetimi

**Path:** `/recete`

**Özellikler:**
- Reçete listesi
- Yeni reçete oluşturma
- Reçete düzenleme
- Reçete silme
- Reçete kopyalama
- Hammadde seçimi ve miktar belirleme
- Ambalaj seçimi (çoklu)
- Otomatik maliyet hesaplama
- Besin içeriği hesaplama (NPK vb.)

**Form Alanları:**
- Reçete adı (zorunlu)
- Müşteri (select - zorunlu)
- Yoğunluk
- Hammaddeler (dinamik liste):
  - Hammadde seçimi
  - Miktar
  - Birim fiyat (otomatik)
  - Toplam (otomatik)
- Ambalajlar (çoklu seçim)

**API Endpoints:**
```
GET    /api/recipes                # Tüm reçeteler
GET    /api/recipes/:id            # Tek reçete detayı
POST   /api/recipes                # Yeni reçete
PUT    /api/recipes/:id            # Reçete güncelle
DELETE /api/recipes/:id            # Reçete sil
POST   /api/recipes/:id/copy       # Reçete kopyala
POST   /api/recipes/update-prices  # Toplu fiyat güncelle
GET    /api/recipes/check-price-updates  # Güncelleme gereken reçeteler
```

**Hesaplama Mantığı:**
```javascript
// Her hammadde için
total = quantity * price

// Reçete toplam maliyeti
total_cost = sum(ingredient.total)

// Besin içeriği
nutrient_ratio = ingredient.quantity / total_quantity
nutrient_value = ingredient.nutrient_content * nutrient_ratio
```

**Özel Özellikler:**
- Fiyat güncelleme takibi (is_price_updated)
- Hammadde fiyatı değiştiğinde uyarı
- Besin içeriği görüntüleme (N, P, K, Mg, Ca, S, Fe, Zn, B, Mn, Cu, Mo, Na, Si, H, C, O, Cl, Al)

---

### 5. Sipariş & Teklif

**Path:** `/siparis`

**Özellikler:**
- Sipariş listesi
- Yeni sipariş/teklif oluşturma
- Durum güncelleme (Beklemede/Onaylandı/İptal)
- Sipariş silme
- PDF teklif oluşturma
- Müşteri ve reçete seçimi
- Miktar belirleme
- Fiyat hesaplama (kar oranı ile)

**Form Alanları:**
- Müşteri (select)
- Reçete (select)
- Miktar
- Charge sayısı
- Toplam tutar
- Durum

**API Endpoints:**
```
GET    /api/orders              # Tüm siparişler
GET    /api/orders/:id          # Tek sipariş
POST   /api/orders              # Yeni sipariş
PUT    /api/orders/:id/status   # Durum güncelle
DELETE /api/orders/:id          # Sipariş sil
GET    /api/active-orders       # Aktif siparişler
POST   /api/teklif/create-pdf   # PDF teklif oluştur
```

**PDF Teklif Yapısı:**
- Firma logosu ve bilgileri
- Müşteri bilgileri
- Teklif tarihi ve numarası
- Ürün listesi (reçete, miktar, birim fiyat, toplam)
- Genel toplam
- Şartlar ve koşullar
- İmza alanı

---

### 6. Ayarlar

**Path:** `/ayarlar`

**Özellikler:**
- Genel ayarlar
  - Dolar kuru
  - Kar oranları (Liste A, B, C)
- Ambalaj yönetimi
  - Ambalaj ekleme
  - Ambalaj düzenleme
  - Ambalaj silme
  - Boyut ve birim (L/Kg)
- Teklif ayarları
  - Firma bilgileri
  - Banka bilgileri
  - Teklif notları ve şartları
- Veritabanı yedekleme
  - Yedek alma
  - Yedek geri yükleme

**API Endpoints:**
```
GET    /api/settings                    # Ayarları getir
PUT    /api/settings                    # Ayarları güncelle
GET    /api/packages                    # Ambalajları getir
POST   /api/packages                    # Ambalaj ekle
PUT    /api/packages/:id                # Ambalaj güncelle
DELETE /api/packages/:id                # Ambalaj sil
POST   /api/backup/database             # Yedek al
POST   /api/backup/restore-file         # Yedek yükle
GET    /api/teklif-settings             # Teklif ayarları
PUT    /api/teklif-settings/:id         # Teklif ayarları güncelle
```

**Ambalaj Varsayılan Değerleri:**
- 1L: 46 TL
- 5L: 75 TL
- 20L: 170 TL
- 1Kg: 32 TL
- 5Kg: 44 TL
- 10Kg: 79 TL
- 25Kg: 45 TL
- 1000L: 2500 TL

---

### 7. Login Sayfası

**Path:** `/login`

**Özellikler:**
- Kullanıcı adı ve şifre girişi
- JWT token oluşturma
- Token localStorage'da saklama
- Otomatik yönlendirme

**API Endpoint:**
```
POST /api/auth/login
Body: { username, password }
Response: { success, token, user }
```

**Kimlik Doğrulama:**
- JWT tabanlı
- bcrypt ile şifre hashleme
- Middleware: authenticateToken

---

## 🔧 BACKEND API DETAYLARI

### Server Konfigürasyonu

**Port:** 3001

**CORS:**
```javascript
{
  origin: '*',  // Production'da değiştirilmeli
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

**Middleware:**
- express.json()
- express.urlencoded({ extended: true })
- UTF-8 charset
- Error handling
- Request logging (Winston)

### Önemli Özellikler

**1. Soft Delete:**
Tüm tablolarda `deleted_at` alanı ile silme işlemi yapılır.
```sql
UPDATE table SET deleted_at = datetime('now') WHERE id = ?
```

**2. Fiyat Güncelleme Sistemi:**
Hammadde fiyatı değiştiğinde:
```javascript
// Stok fiyatı güncellenir
UPDATE stock SET price = new_price WHERE id = ?

// İlgili reçeteler işaretlenir
UPDATE recipes SET is_price_updated = false
WHERE id IN (SELECT recipe_id FROM recipe_ingredients WHERE stock_id = ?)
```

**3. Transaction Yönetimi:**
Kritik işlemlerde transaction kullanılır:
```javascript
await dbRun('BEGIN TRANSACTION');
try {
  // İşlemler
  await dbRun('COMMIT');
} catch (error) {
  await dbRun('ROLLBACK');
}
```

**4. Cache Sistemi:**
Ayarlar için 5 dakikalık cache:
```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
```

**5. File Upload:**
- Multer ile dosya yükleme
- Excel import
- PDF export
- Veritabanı yedekleme

---

## 🎯 ÖNEMLİ İŞ KURALLARI

### 1. Stok Yönetimi
- Mükerrer ürün adı kontrolü (case-insensitive)
- Excel'den toplu yükleme sırasında mükerrer kontrol
- Fiyat değişiminde reçete fiyatlarını işaretleme
- Kritik stok altındaki ürünleri vurgulama

### 2. Cari Yönetimi
- Mükerrer cari adı kontrolü
- Tip bazlı filtreleme
- Bakiye hesaplama

### 3. Reçete Yönetimi
- Her reçete bir müşteriye bağlı
- Hammadde fiyatı değiştiğinde güncelleme gerekli uyarısı
- Ambalaj fiyatı değiştiğinde güncelleme gerekli uyarısı
- Otomatik maliyet hesaplama
- Besin içeriği hesaplama

### 4. Sipariş Yönetimi
- Reçete ve müşteri seçimi zorunlu
- Durum kontrolü (Beklemede/Onaylandı/İptal)
- PDF teklif oluşturma

### 5. Fiyatlandırma
Satış fiyatı = (Maliyet + Ambalaj) * (1 + Kar Oranı)

**Kar Oranları:**
- Liste A: %20
- Liste B: %35
- Liste C: %50

---

## 🔐 GÜVENLİK

### Şu An
- Tek kullanıcı
- JWT authentication
- bcrypt password hashing
- CORS koruması

### Gelecek (SaaS için)
- Multi-tenant yapı
- Role-based access control (RBAC)
- Kullanıcı yönetimi
- Ödeme entegrasyonu
- Rate limiting
- HTTPS zorunluluğu
- Environment variable'lar için .env

---

## 📦 DEPLOYMENT

### Development
```bash
# Backend
cd backend
npm install
npm start  # Port 3001

# Frontend
cd frontend
npm install
npm run dev  # Port 3000
```

### Docker Compose
```bash
docker-compose up -d
# Backend: Port 3002
# Frontend: Port 3003
```

### Production (Railway Önerisi)

**Backend Servisi:**
- Root Directory: `/backend`
- Start Command: `npm start`
- Environment:
  - NODE_ENV=production

**Frontend Servisi:**
- Root Directory: `/frontend`
- Start Command: `npm start`
- Environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_ORIGIN=https://backend-url.railway.app

---

## 🔄 GELECEKTEKİ GELİŞTİRMELER (SaaS)

### Veritabanı
- SQLite → PostgreSQL veya MySQL
- Multi-tenant schema design
- Tenant isolation

### Kullanıcı Yönetimi
```sql
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  subdomain VARCHAR(100) UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tenant_id INT REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP
);
```

### Ödeme Sistemi
- Stripe entegrasyonu
- Subscription planları
- Fatura yönetimi

### Yeni Özellikler
- Email bildirimleri
- SMS entegrasyonu
- Gelişmiş raporlama
- Dashboard analytics
- Stok hareketi takibi
- Üretim planlama
- QR kod etiketleme

---

## 📝 NOTLAR

### Dikkat Edilmesi Gerekenler
1. UTF-8 encoding her yerde kullanılmalı
2. Transaction yönetimi kritik işlemlerde zorunlu
3. Soft delete kullanımı tüm tablolarda standart
4. API error handling detaylı olmalı
5. Frontend'de loading states gösterilmeli
6. Form validasyonları hem frontend hem backend'de olmalı

### Bilinen Limitasyonlar
- SQLite tek kullanıcı için yeterli, SaaS'ta yetersiz
- Dosya yükleme lokal, cloud storage gerekebilir
- Raporlama özellikleri sınırlı
- Email/SMS bildirimi yok

---

## 🧪 TEST SENARYOLARI

### Stok Yönetimi
1. Yeni stok ekleme
2. Excel ile toplu stok yükleme (mükerrer kontrol)
3. Fiyat güncelleme ve reçetelere yansıma
4. Kritik stok uyarısı

### Reçete Yönetimi
1. Yeni reçete oluşturma
2. Hammadde ekleme ve maliyet hesaplama
3. Reçete kopyalama
4. Fiyat güncelleme uyarısı

### Sipariş Yönetimi
1. Yeni sipariş oluşturma
2. PDF teklif oluşturma
3. Durum değiştirme
4. Sipariş silme

---

## 📞 DESTEK BİLGİLERİ

### Ortam Değişkenleri

**Backend (.env):**
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_ORIGIN=http://localhost:3001
```

---

## ✅ KURULUM KONTROLLİSTESİ

- [ ] Node.js 14+ kurulu
- [ ] npm/yarn kurulu
- [ ] Git kurulu
- [ ] Backend dependencies yüklü
- [ ] Frontend dependencies yüklü
- [ ] .env dosyaları oluşturuldu
- [ ] Veritabanı oluşturuldu (ilk çalıştırmada otomatik)
- [ ] CORS ayarları yapıldı
- [ ] Port'lar müsait (3000, 3001)

---

## 🎨 UI/UX DETAYLARI

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

### Animasyonlar
- Hover effects
- Transition effects
- Loading spinners

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation

---

## 🏁 ÖZET

Bu proje, tarımsal ürün üreten firmaların:
- Stok yönetimi
- Reçete formülasyonu
- Müşteri takibi
- Teklif hazırlama
- Sipariş yönetimi

ihtiyaçlarını karşılayan kapsamlı bir ERP sistemidir.

**Şu an:** Tek kullanıcılı desktop uygulama mantığında
**Gelecek:** Multi-tenant SaaS platformu

**Teknoloji:** Modern, ölçeklenebilir stack (Next.js + Express + SQLite → PostgreSQL)

---

**Dokümantasyon Tarihi:** 2025-10-25
**Versiyon:** 1.0
**Yazar:** Claude Code
