# 🚂 RAILWAY DEPLOYMENT KILAVUZU

## 📋 GEREKSİNİMLER

- GitHub hesabı
- Railway.app hesabı (GitHub ile giriş yapabilirsiniz)
- Projenin GitHub'da olması

---

## 🚀 ADIM ADIM DEPLOYMENT

### 1. Railway Hesabı Oluştur

1. **railway.app** adresine git
2. **Login with GitHub** ile giriş yap
3. GitHub'a erişim izni ver

---

### 2. Backend Servisini Deploy Et

#### 2.1. Yeni Proje Oluştur

1. Railway dashboard'da **New Project** butonuna tıkla
2. **Deploy from GitHub repo** seç
3. **equinox794/c10** repository'sini seç
4. İzinleri onayla

#### 2.2. Backend Servis Ayarları

1. Servis adını **backend** olarak değiştir (Settings → Service Name)

2. **Settings** → **Root Directory** → `/backend` yaz

3. **Settings** → **Build Command** → Boş bırak (otomatik)

4. **Settings** → **Start Command** → `npm start` yaz

5. **Variables** sekmesine git ve şunları ekle:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secret-key-change-this
   ```

6. **Deploy** butonuna tıkla

7. Deploy tamamlandığında **Settings** → **Networking** → **Public Networking**'i aç

8. **Domain** kısmında verilen URL'i kopyala (örn: `backend-production-xxxx.up.railway.app`)

---

### 3. Frontend Servisini Deploy Et

#### 3.1. Yeni Servis Ekle

1. Aynı projede (backend'in olduğu) **+ New** → **GitHub Repo**'ya tıkla
2. Yine aynı **equinox794/c10** repository'sini seç

#### 3.2. Frontend Servis Ayarları

1. Servis adını **frontend** olarak değiştir

2. **Settings** → **Root Directory** → `/frontend` yaz

3. **Settings** → **Build Command** → `npm run build` yaz

4. **Settings** → **Start Command** → `npm start` yaz

5. **Variables** sekmesine git ve şunları ekle:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_ORIGIN=https://BACKEND_URL_BURAYA
   NEXT_TELEMETRY_DISABLED=1
   ```

   **ÖNEMLİ:** `NEXT_PUBLIC_API_ORIGIN` değerine backend'in URL'ini yaz (Step 2.8'den kopyaladığın URL)

   Örnek:
   ```
   NEXT_PUBLIC_API_ORIGIN=https://backend-production-a1b2.up.railway.app
   ```

6. **Deploy** butonuna tıkla

7. Deploy tamamlandığında **Settings** → **Networking** → **Public Networking**'i aç

8. Frontend URL'ini kopyala (örn: `frontend-production-yyyy.up.railway.app`)

---

### 4. CORS Ayarı (Önemli!)

Backend'in frontend'den gelen istekleri kabul etmesi için:

1. **backend/server.js** dosyasında CORS ayarını güncelle:

```javascript
app.use(cors({
  origin: 'https://FRONTEND_URL_BURAYA', // Frontend Railway URL'i
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

2. Değişikliği commit et ve push et:
```bash
git add backend/server.js
git commit -m "Railway CORS ayarı"
git push
```

3. Railway otomatik yeniden deploy edecek

---

### 5. Veritabanı Kontrolü

Railway'de SQLite kullanıyorsunuz, bu şu anlama gelir:

**⚠️ UYARI:**
- Her deploy'da veritabanı sıfırlanabilir
- Kalıcı veri için **Railway Volumes** kullanmalısınız

#### Volumes Kurulumu (Önerilen):

1. Backend servisinde **Variables** → **Volumes** sekmesine git
2. **New Volume** butonuna tıkla
3. **Mount Path:** `/app/database`
4. Kaydet

5. **backend/server.js**'de veritabanı yolunu güncelle:
```javascript
const db = new sqlite3.Database(
  process.env.NODE_ENV === 'production'
    ? '/app/database/database.sqlite'
    : './database.sqlite',
  (err) => {
    // ...
  }
);
```

---

## ✅ KONTROL LİSTESİ

Deploy sonrası kontrol:

- [ ] Backend servisi çalışıyor (URL'e git → 404 almalısın)
- [ ] Frontend servisi çalışıyor (URL'e git → sayfa görünmeli)
- [ ] Login sayfası açılıyor
- [ ] API bağlantısı çalışıyor
- [ ] Veritabanı tablolar oluştu
- [ ] CORS hatası yok (Browser Console kontrol et)

---

## 🔍 HATA GİDERME

### 1. "Application failed to respond"

**Çözüm:**
- Logs sekmesini kontrol et
- Port numarasının 3001 (backend) veya 3000 (frontend) olduğunu kontrol et
- Start command doğru mu kontrol et

### 2. "CORS Error"

**Çözüm:**
- Backend'de CORS origin ayarını frontend URL'ine ayarla
- Frontend URL'inde `https://` olmalı

### 3. "Cannot connect to API"

**Çözüm:**
- Frontend environment variable `NEXT_PUBLIC_API_ORIGIN` doğru mu?
- Backend public networking açık mı?
- Backend URL'i çalışıyor mu?

### 4. "Module not found"

**Çözüm:**
- Root Directory doğru mu? (`/backend` veya `/frontend`)
- package.json dosyası doğru yerde mi?
- Build logs'u kontrol et

### 5. Veritabanı sıfırlanıyor

**Çözüm:**
- Railway Volumes kullan (yukarıda anlatıldı)
- Veya PostgreSQL'e geç (ileride SaaS için zaten gerekli)

---

## 💡 ÖNERİLER

### 1. Custom Domain

Railway'de custom domain ekleyebilirsiniz:
1. Settings → Networking → Custom Domain
2. Kendi domain'inizi ekleyin (örn: app.bioplant.com)
3. DNS ayarlarını yapın

### 2. PostgreSQL'e Geçiş (Gelecek için)

Railway'de PostgreSQL servisi eklemek çok kolay:
1. **+ New** → **Database** → **PostgreSQL**
2. Otomatik connection string verir
3. Backend'i PostgreSQL'e uyarla

### 3. Monitoring

Railway otomatik monitoring sağlar:
- CPU kullanımı
- Memory kullanımı
- Deploy history
- Logs (real-time)

### 4. Maliyet

Railway ücretsiz plan:
- $5 monthly credit
- Her deploy sonrası kredi tüketimi
- Upgrade gerekebilir

---

## 🎯 SONUÇ

Deployment tamamlandığında:

**Backend URL:** `https://backend-production-xxxx.up.railway.app`
**Frontend URL:** `https://frontend-production-yyyy.up.railway.app`

Frontend URL'ini ziyaret et → Giriş yap → Kullanmaya başla!

---

## 📞 DESTEK

Sorun yaşarsan:
1. Railway Logs sekmesini kontrol et
2. Browser Console'da hataları kontrol et
3. GitHub Issues'a yaz

---

**Hazırlayan:** Claude Code
**Tarih:** 2025-10-25
**Versiyon:** 1.0
