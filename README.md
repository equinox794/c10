# Bioplant CRM

Bioplant için geliştirilmiş production-ready, modern CRM (Customer Relationship Management) sistemi.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS
- **Components:** Radix UI, Lucide Icons
- **Hosting:** Vercel (Serverless)

### Backend
- **API:** Next.js API Routes (Vercel Serverless Functions)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage / Vercel Blob

### Features
- ✅ Müşteri yönetimi (CRM)
- ✅ Stok takibi (hammadde & ambalaj)
- ✅ Reçete yönetimi
- ✅ Sipariş takibi
- ✅ Teklif hazırlama & PDF export
- ✅ Excel import/export
- ✅ Real-time updates (Supabase)
- ✅ Responsive design

---

## 📦 Deployment (Production)

### Quick Start

1. **Supabase Projesi Oluştur**
   - https://supabase.com/dashboard → New Project
   - SQL Editor'da `supabase/migrations/001_initial_schema.sql` çalıştır

2. **Vercel'e Deploy**
   - https://vercel.com/new → Import from GitHub
   - Root directory: `frontend`
   - Environment variables ekle (Supabase keys)

3. **Test Et**
   - `https://your-app.vercel.app` → Site çalışmalı
   - `/api/customers` → JSON response dönmeli

Detaylı adımlar için: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 💻 Local Development

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase account (free tier)

### Kurulum

```bash
# 1. Repository'yi clone'la
git clone https://github.com/equinox794/c10.git
cd c10

# 2. Frontend dependencies
cd frontend
npm install

# 3. Environment variables
cp .env.example .env.local
# .env.local dosyasını düzenle (Supabase keys)

# 4. Development server
npm run dev
```

Frontend: http://localhost:3000
API Routes: http://localhost:3000/api/*

### Environment Variables

`.env.local` dosyasında:

```bash
# Supabase (https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## 📁 Proje Yapısı

```
c10/
├── frontend/                  # Next.js Frontend
│   ├── app/
│   │   ├── api/              # Serverless API Routes
│   │   │   ├── customers/    # Müşteri endpoints
│   │   │   ├── stock/        # Stok endpoints
│   │   │   ├── recipes/      # Reçete endpoints
│   │   │   ├── orders/       # Sipariş endpoints
│   │   │   ├── packages/     # Ambalaj endpoints
│   │   │   └── settings/     # Ayarlar endpoints
│   │   ├── cari/             # Müşteri yönetimi sayfası
│   │   ├── stok/             # Stok sayfası
│   │   ├── recete/           # Reçete sayfası
│   │   ├── siparis/          # Sipariş sayfası
│   │   └── ayarlar/          # Ayarlar sayfası
│   ├── components/           # React components
│   ├── lib/
│   │   └── supabase.js       # Supabase client
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # PostgreSQL schema
├── backend/                  # [LEGACY] Eski Express backend
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # Bu dosya
```

---

## 🗄️ Database Schema

### Ana Tablolar

- **customers** - Müşteriler (Müşteri, Tedarikçi, Fason, vb.)
- **stock** - Stok kalemleri (hammadde, ambalaj)
- **packages** - Ambalaj tipleri (L, Kg)
- **recipes** - Ürün reçeteleri
- **recipe_ingredients** - Reçete içerikleri (hammadde)
- **recipe_packages** - Reçete ambalajları
- **orders** - Siparişler
- **settings** - Sistem ayarları (dolar kuru, kar oranları)
- **teklif_settings** - Teklif şablonu ayarları

### Price History

- **stock_price_history** - Hammadde fiyat geçmişi
- **package_price_history** - Ambalaj fiyat geçmişi

Tam schema: `supabase/migrations/001_initial_schema.sql`

---

## 🔧 API Endpoints

### Customers (Müşteriler)
```
GET    /api/customers          # Tüm müşteriler
GET    /api/customers/:id      # Tek müşteri
POST   /api/customers          # Yeni müşteri
PUT    /api/customers/:id      # Güncelle
DELETE /api/customers/:id      # Sil (soft delete)
POST   /api/customers/bulk     # Toplu import
```

### Stock (Stok)
```
GET    /api/stock              # Tüm stok
GET    /api/stock/:id          # Tek stok
POST   /api/stock              # Yeni ekle
PUT    /api/stock/:id          # Güncelle
DELETE /api/stock/:id          # Sil
```

### Recipes, Orders, Packages, Settings...
Benzer CRUD operations. Detaylar için: `frontend/app/api/` klasörü

---

## 🛠️ Development Workflow

### Yeni Feature Eklemek

1. **Database değişikliği gerekiyorsa:**
   ```sql
   -- supabase/migrations/002_new_feature.sql
   ALTER TABLE customers ADD COLUMN tax_number TEXT;
   ```

2. **API Route oluştur:**
   ```javascript
   // frontend/app/api/new-endpoint/route.js
   import { NextResponse } from 'next/server'
   import { supabaseAdmin } from '@/lib/supabase'

   export async function GET(request) {
     const { data, error } = await supabaseAdmin.from('table').select('*')
     return NextResponse.json(data)
   }
   ```

3. **Frontend component:**
   ```jsx
   // frontend/app/new-page/page.js
   async function NewPage() {
     const res = await fetch('/api/new-endpoint')
     const data = await res.json()
     return <div>{/* UI */}</div>
   }
   ```

4. **Test → Commit → Push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

Vercel otomatik deploy eder!

---

## 📝 Migration Notes

### Eski Sistemden (SQLite + Express)

Eğer eski backend'den migration yapıyorsan:

1. **Veri Export:**
   ```bash
   sqlite3 backend/database.sqlite .dump > old_data.sql
   ```

2. **Convert to PostgreSQL:**
   - SQLite syntax → PostgreSQL syntax
   - Supabase SQL Editor'da çalıştır

3. **API Calls Güncelle:**
   ```javascript
   // Eski
   fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/api/customers`)

   // Yeni
   fetch('/api/customers')
   ```

---

## 🧪 Testing

### Local Test
```bash
cd frontend
npm run dev
```

Browser: http://localhost:3000

### Production Test
```bash
npm run build
npm start
```

Vercel production build'i simüle eder.

---

## 🚨 Troubleshooting

### Problem: API 500 Error

**Çözüm:**
1. Environment variables doğru mu? (Vercel Dashboard kontrol et)
2. Supabase connection çalışıyor mu?
3. Vercel Logs'u kontrol et

### Problem: "Module not found: @/lib/supabase"

**Çözüm:**
```bash
cd frontend
npm install @supabase/supabase-js
```

### Problem: Database connection refused

**Çözüm:**
- Supabase project aktif mi? (paused olmayabilir)
- API keys doğru kopyalandı mı?
- RLS policies kontrol et

Daha fazla: [DEPLOYMENT.md](./DEPLOYMENT.md#-troubleshooting)

---

## 📊 Monitoring

### Vercel Dashboard
- **Analytics:** Traffic, visitors
- **Logs:** Runtime errors, API logs
- **Usage:** Bandwidth, function execution

### Supabase Dashboard
- **Database:** Size, rows, activity
- **API:** Request count, response times
- **Logs:** Query logs, errors

---

## 🔐 Güvenlik

- ✅ Row Level Security (RLS) enabled
- ✅ Environment variables encrypted
- ✅ HTTPS enforced (Vercel)
- ✅ SQL injection protected (Supabase)
- ✅ Soft delete (data recovery)

---

## 📚 Dokümantasyon

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[cursor-rules.txt](./cursor-rules.txt)** - Coding standards
- **[cursor-migration-prompt.txt](./cursor-migration-prompt.txt)** - Migration prompt for Cursor IDE

---

## 🤝 Contributing

```bash
# 1. Fork & clone
git clone https://github.com/your-username/c10.git

# 2. Create branch
git checkout -b feature/amazing-feature

# 3. Make changes & commit
git commit -m "feat: add amazing feature"

# 4. Push & create PR
git push origin feature/amazing-feature
```

---

## 📄 License

Bu proje Bioplant Tarım A.Ş. için özel olarak geliştirilmiştir.

---

## 🎯 Roadmap

- [ ] Authentication (Supabase Auth)
- [ ] User roles & permissions
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Barcode scanning
- [ ] WhatsApp integration

---

## 📞 İletişim

**Proje Sahibi:** Bioplant Tarım A.Ş.
**Developer:** [GitHub](https://github.com/equinox794)
**Issues:** [GitHub Issues](https://github.com/equinox794/c10/issues)

---

Made with ❤️ using Next.js & Supabase
