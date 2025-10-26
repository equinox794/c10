# Bioplant CRM - Deployment Guide
## Vercel + Supabase Migration

Bu döküman, Bioplant CRM projesini Vercel ve Supabase kullanarak production'a deploy etme adımlarını içerir.

---

## 📋 Ön Koşullar

- GitHub hesabı
- Vercel hesabı (ücretsiz: https://vercel.com/signup)
- Supabase hesabı (ücretsiz: https://supabase.com/dashboard/sign-up)
- Git kurulu

---

## 🗄️ ADIM 1: Supabase Projesi Oluşturma

### 1.1 Supabase Dashboard'a Git
1. https://supabase.com/dashboard adresine git
2. "New Project" butonuna tıkla
3. Proje bilgilerini doldur:
   - **Name:** bioplant-crm
   - **Database Password:** Güçlü bir şifre belirle (kaydet!)
   - **Region:** Europe West (Frankfurt) - Türkiye'ye en yakın
   - **Pricing Plan:** Free tier seçebilirsin (500MB database, 2GB transfer)

4. "Create new project" butonuna tıkla (2-3 dakika sürer)

### 1.2 Database Migration'ı Çalıştır

Proje hazır olduğunda:

1. Sol menüden **"SQL Editor"** sekmesine git
2. "New Query" butonuna tıkla
3. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyala
4. SQL Editor'e yapıştır
5. **"Run"** butonuna tıkla (sağ üstte)
6. Başarılı mesajı gördüğünde migration tamamlanmıştır ✅

### 1.3 API Keys'leri Kopyala

1. Sol menüden **"Settings"** → **"API"** sekmesine git
2. Şu bilgileri kopyala (güvenli bir yere kaydet):
   - **Project URL** (örn: `https://abcdefgh.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ GİZLİ! Asla frontend'de kullanma)

---

## 🚀 ADIM 2: Vercel'e Deploy

### 2.1 GitHub Repository'ye Push

```bash
# Eğer henüz yapmadıysan, tüm değişiklikleri commit et
git add .
git commit -m "Migrate to Vercel + Supabase architecture"
git push origin main
```

### 2.2 Vercel Import

1. https://vercel.com/new adresine git
2. "Import Git Repository" seç
3. GitHub hesabını bağla
4. **c10** repository'sini seç
5. **Root Directory** ayarını **`frontend`** olarak değiştir
6. **Framework Preset:** Next.js (otomatik algılanmalı)

### 2.3 Environment Variables Ekle

"Environment Variables" bölümünde şu değişkenleri ekle:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL'iniz |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

⚠️ **ÖNEMLİ:** `NEXT_PUBLIC_` prefix'li değişkenler client-side'da görünür olacaktır. Service role key'i asla public yapma!

### 2.4 Deploy

1. "Deploy" butonuna tıkla
2. 2-3 dakika bekle
3. Deploy tamamlandığında Vercel size bir URL verecek: `https://bioplant-crm.vercel.app`

---

## ✅ ADIM 3: Deployment Testi

### 3.1 Site Çalışıyor mu?

1. Vercel URL'ini aç
2. Ana sayfa yüklenmeli
3. Console'da hata olmamalı (F12 → Console)

### 3.2 API Routes Testi

Tarayıcıda test et:
```
https://your-site.vercel.app/api/customers
https://your-site.vercel.app/api/stock
https://your-site.vercel.app/api/settings
```

Her biri JSON response dönmeli.

### 3.3 Database Bağlantısı

1. Müşteriler sayfasına git
2. Yeni müşteri ekle
3. Supabase Dashboard → Table Editor'da görünmeli

---

## 🔄 ADIM 4: Data Migration (Eski SQLite → Supabase)

Eğer eski sistemde veri varsa:

### 4.1 Export Data

Eski backend klasöründe:
```bash
# SQLite'dan verileri export et
sqlite3 backend/database.sqlite .dump > data_backup.sql
```

### 4.2 Convert to PostgreSQL

SQLite dump'ı PostgreSQL formatına çevir:
- `AUTOINCREMENT` → `SERIAL`
- `datetime('now')` → `NOW()`
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `BIGSERIAL PRIMARY KEY`

### 4.3 Import to Supabase

1. Supabase Dashboard → SQL Editor
2. Düzenlenmiş SQL'i yapıştır ve çalıştır
3. Table Editor'dan verileri kontrol et

---

## 🛠️ ADIM 5: Frontend Güncellemesi (Eski API Calls)

### 5.1 API Endpoint'leri Güncelle

Tüm frontend sayfalarında (`frontend/app/`) eski API çağrılarını güncelle:

**Eski:**
```javascript
fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/api/customers`)
```

**Yeni:**
```javascript
fetch('/api/customers')
```

Next.js otomatik olarak `/api` path'lerini Vercel Functions'a yönlendirir.

### 5.2 Test ve Deploy

```bash
git add .
git commit -m "Update API calls to use relative paths"
git push
```

Vercel otomatik deploy edecek (30 saniye - 1 dakika).

---

## 📊 ADIM 6: Monitoring & Maintenance

### 6.1 Vercel Dashboard

- **Analytics:** Ziyaretçi istatistikleri
- **Logs:** Runtime errors ve API logs
- **Usage:** Bandwidth ve function kullanımı

### 6.2 Supabase Dashboard

- **Database:** Size ve row count
- **API:** Request sayısı
- **Logs:** Query logs ve errors

### 6.3 Güncellemeler

Kod değişikliklerini push ettiğinde:
```bash
git add .
git commit -m "Your changes"
git push
```

Vercel otomatik deploy eder (CI/CD).

---

## 🔒 Güvenlik Önerileri

### Row Level Security (RLS)

Supabase'de RLS politikalarını özelleştir:

```sql
-- Örnek: Sadece authenticated kullanıcılar erişebilsin
ALTER POLICY "Enable all for service role" ON customers
  FOR ALL USING (auth.role() = 'authenticated');
```

### Environment Variables

- Asla `.env.local` dosyasını git'e commit etme
- Production'da Vercel Dashboard'dan yönet
- Geliştirme ve production için farklı Supabase projeleri kullan

---

## 🆘 Troubleshooting

### Problem: 500 Internal Server Error

**Çözüm:**
1. Vercel Dashboard → Logs kontrol et
2. Environment variables doğru mu?
3. Supabase connection string çalışıyor mu?

### Problem: Database Connection Failed

**Çözüm:**
1. Supabase project aktif mi? (paused olabilir)
2. API keys doğru kopyalandı mı?
3. RLS policies çok kısıtlayıcı olabilir

### Problem: API Routes 404

**Çözüm:**
1. `frontend/app/api/` klasörü doğru konumda mı?
2. `route.js` dosyaları export ediyor mu?
3. Vercel build logs kontrol et

---

## 📈 Ölçekleme

### Free Tier Limitler

**Vercel Free:**
- 100 GB bandwidth/month
- 100 hours serverless execution/month
- Unlimited team members

**Supabase Free:**
- 500 MB database
- 2 GB egress/month
- 50,000 monthly active users

### Pro'ya Yükseltme

Limitler aşılınca:
- **Vercel Pro:** $20/month
- **Supabase Pro:** $25/month

---

## ✅ Deployment Checklist

- [ ] Supabase projesi oluşturuldu
- [ ] Database migration çalıştırıldı
- [ ] API keys kopyalandı
- [ ] Vercel'e import edildi
- [ ] Environment variables eklendi
- [ ] İlk deploy başarılı
- [ ] API routes test edildi
- [ ] Database bağlantısı çalışıyor
- [ ] Eski veriler migrate edildi (varsa)
- [ ] Frontend API calls güncellendi
- [ ] Production test edildi
- [ ] Domain bağlandı (opsiyonel)

---

## 🎉 Tebrikler!

Bioplant CRM artık production-ready bir infrastructure'da çalışıyor!

**Avantajlar:**
- ✅ Otomatik deployment (git push = deploy)
- ✅ Global CDN (hızlı yükleme)
- ✅ Otomatik SSL/HTTPS
- ✅ Scalable database
- ✅ Otomatik backups (Supabase)
- ✅ Zero downtime

**İletişim:**
Sorularınız için: [GitHub Issues](https://github.com/equinox794/c10/issues)
