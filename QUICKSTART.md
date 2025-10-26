# 🚀 Bioplant CRM - Hızlı Başlangıç

## Seçenek 1: ESKİ SİSTEM (Hızlı Test - 2 dakika)

Eski SQLite + Express sistemini çalıştırmak için:

### Adımlar:

```bash
# 1. Backend'i başlat (Terminal 1)
cd /home/user/c10/backend
node server.js

# 2. Frontend'i başlat (Terminal 2)
cd /home/user/c10/frontend
npm run dev
```

### Erişim:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

### Durdurma:
Her iki terminalde `Ctrl + C` tuşlarına bas

---

## Seçenek 2: YENİ SİSTEM (Production - 15 dakika)

Yeni Supabase + Vercel sistemini local'de çalıştırmak için:

### ÖN HAZIRLIK (Bir kere yapılır)

#### 1. Supabase Projesi Oluştur (5 dakika)

**1.1. Supabase'e üye ol:**
```
https://supabase.com/dashboard/sign-up
```
- Email ile kayıt ol (ücretsiz)
- Email'ini doğrula

**1.2. Yeni proje oluştur:**
```
https://supabase.com/dashboard → "New Project" butonu
```

Formu doldur:
- **Name:** `bioplant-crm`
- **Database Password:** Güçlü bir şifre belirle ⚠️ KAYDET!
- **Region:** `Europe West (Frankfurt)` (Türkiye'ye en yakın)
- **Pricing Plan:** `Free` seç

"Create new project" → 2-3 dakika bekle

**1.3. Database'i oluştur:**

Proje hazır olunca:

1. Sol menüden **"SQL Editor"** tıkla
2. **"New Query"** butonu
3. Dosyayı aç: `/home/user/c10/supabase/migrations/001_initial_schema.sql`
4. Tüm içeriği kopyala → SQL Editor'e yapıştır
5. Sağ üstte **"Run"** (veya F5) tuşuna bas
6. ✅ "Success. No rows returned" mesajını gör

**1.4. API Keys'leri al:**

1. Sol menüden **Settings** → **API**
2. Şunları kopyala (Not Defteri'ne yapıştır):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **service_role key'i GİZLİ! Kimseyle paylaşma!**

#### 2. Environment Variables Ayarla (2 dakika)

```bash
# .env.local dosyasını düzenle
nano /home/user/c10/frontend/.env.local
```

Şu satırları düzenle (kendi bilgilerinle değiştir):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Kaydet: `Ctrl + O`, Enter, `Ctrl + X`

#### 3. Dependencies Yükle (3 dakika)

```bash
cd /home/user/c10/frontend
npm install
```

### ÇALIŞTIRMA (Her seferinde)

```bash
# Frontend + API Routes
cd /home/user/c10/frontend
npm run dev
```

### Erişim:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api/customers (örnek)

### Test:
```bash
# Tarayıcıda aç:
http://localhost:3000/api/customers

# JSON response görmelisin (boş array olabilir)
[]
```

---

## 🆘 SORUN GİDERME

### Problem: "Module not found: @supabase/supabase-js"

**Çözüm:**
```bash
cd /home/user/c10/frontend
npm install @supabase/supabase-js
```

### Problem: "Invalid Supabase URL"

**Çözüm:**
- `.env.local` dosyasını kontrol et
- URL'nin başında `https://` olmalı
- Sondaki `/` işaretini kaldır

### Problem: Port 3000 kullanımda

**Çözüm:**
```bash
# Portları değiştir
npm run dev -- -p 3001
```

### Problem: Backend API 500 error

**Çözüm:**
```bash
# Console'da hataları kontrol et (F12)
# Supabase Dashboard → Logs → API Logs kontrol et
```

---

## 🎯 HANGİSİNİ SEÇMELİYİM?

### Eski Sistem seç eğer:
- ✅ Sadece test etmek istiyorsan
- ✅ Hızlı başlamak istiyorsan
- ✅ Local kullanım yeterli

### Yeni Sistem seç eğer:
- ✅ Production'a çıkacaksan
- ✅ Internet'ten erişim gerekiyorsa
- ✅ Çok kullanıcılı olacaksa
- ✅ Vercel'e deploy edeceksen

---

## 📚 DAHA FAZLA BİLGİ

- **Detaylı deployment:** `DEPLOYMENT.md`
- **API dokümantasyonu:** `README.md`
- **Genel bilgi:** `readme.md`

---

## ✅ BAŞARILI ÇALIŞMA KONTROL LİSTESİ

**Eski Sistem:**
- [ ] Backend çalışıyor (http://localhost:3001)
- [ ] Frontend çalışıyor (http://localhost:3000)
- [ ] Sayfalar yükleniyor
- [ ] Console'da hata yok (F12 → Console)

**Yeni Sistem:**
- [ ] Supabase projesi oluşturuldu
- [ ] SQL migration çalıştırıldı
- [ ] API keys kopyalandı
- [ ] .env.local düzenlendi
- [ ] npm install tamamlandı
- [ ] npm run dev çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] API endpoints JSON dönüyor

---

**İyi çalışmalar! 🚀**
