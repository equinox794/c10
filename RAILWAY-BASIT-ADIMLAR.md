# 🚂 RAILWAY MANUEL DEPLOYMENT - BASIT ADIMLAR

## ✅ ŞU ANDAKİ DURUM
Railway'e giriş yaptın → Şimdi adım adım ilerleyelim

---

## 📌 ADIM 1: YENİ PROJE OLUŞTUR

Railway ana sayfasında göreceğin butonlar:

1. **"New Project"** butonuna tıkla (sağ üstte mor/mavi buton)

2. Açılan menüde **"Deploy from GitHub repo"** seç

3. GitHub ile bağlantı izni iste
   - "Configure GitHub App" diyebilir
   - **equinox794/c10** repository'sine erişim ver

4. Repository listesinde **c10** seç

---

## 📌 ADIM 2: BACKEND SERVİSİNİ AYARLA

Deploy başladıktan sonra:

### 2.1. Servisi Durdur (Önemli!)

Sağ üstte **"..."** (3 nokta) → **"Settings"** tıkla

En altta **"Danger"** bölümünde **"Remove Service"** YOK
Bunun yerine → **"Pause"** butonuna bas (deploy'u durdur)

### 2.2. Ayarları Yap

**Settings** sekmesinde:

#### A) Service Name
```
backend
```

#### B) Root Directory (Önemli!)
```
backend
```
(Slash yok, sadece: backend)

#### C) Start Command
```
npm start
```

#### D) Environment Variables

**"Variables"** sekmesine git → **"New Variable"** ile ekle:

```
NODE_ENV=production
```
```
PORT=3001
```
```
JWT_SECRET=bioplant-super-secret-2025
```

Her birini ayrı ayrı ekle.

### 2.3. Public URL Al

**"Settings"** → **"Networking"** sekmesine git

**"Generate Domain"** butonuna bas

Verilen URL'i KOPYALA (örnek: `backend-production-a1b2.up.railway.app`)

### 2.4. Deploy Et

**"Deployments"** sekmesine dön

Sağ üstte **"Deploy"** butonuna bas

5-10 dakika bekle, logs'u izle

---

## 📌 ADIM 3: FRONTEND SERVİSİNİ EKLE

Aynı projede (sol sidebar):

### 3.1. Yeni Servis Ekle

**"+ New"** butonuna tıkla (sol üstte)

**"GitHub Repo"** seç

Yine **c10** repository'sini seç

### 3.2. Ayarları Yap

Yeni servis oluştu, şimdi ayarla:

#### A) Service Name
```
frontend
```

#### B) Root Directory
```
frontend
```

#### C) Build Command
```
npm run build
```

#### D) Start Command
```
npm start
```

#### E) Environment Variables

**ÖNEMLİ:** Backend URL'ini buraya yazacaksın!

```
NODE_ENV=production
```
```
NEXT_PUBLIC_API_ORIGIN=https://BACKEND_URL_BURAYA
```
```
NEXT_TELEMETRY_DISABLED=1
```

**BACKEND_URL_BURAYA** yerine Adım 2.3'te kopyaladığın URL'i yapıştır!

Örnek:
```
NEXT_PUBLIC_API_ORIGIN=https://backend-production-a1b2.up.railway.app
```

### 3.3. Public URL Al

**"Settings"** → **"Networking"** → **"Generate Domain"**

Frontend URL'ini al (örnek: `frontend-production-c3d4.up.railway.app`)

### 3.4. Deploy Et

**"Deployments"** → **"Deploy"**

10-15 dakika bekle

---

## 📌 ADIM 4: CORS AYARI (Zorunlu!)

Frontend'in backend'e erişebilmesi için:

### 4.1. Lokal Makinende (veya burada)

```bash
cd /home/user/c10/backend
```

**server.js** dosyasını aç, şu satırları bul:

```javascript
app.use(cors({
  origin: '*',
  ...
}));
```

Şöyle değiştir:

```javascript
app.use(cors({
  origin: 'https://FRONTEND_URL_BURAYA',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**FRONTEND_URL_BURAYA** yerine Adım 3.3'teki frontend URL'i yaz.

### 4.2. Git'e Push Et

```bash
git add backend/server.js
git commit -m "Railway CORS ayarı eklendi"
git push origin main
```

Railway otomatik yeniden deploy edecek.

---

## ✅ KONTROL

1. **Backend kontrol:**
   - `https://backend-production-xxx.up.railway.app/api/stock`
   - Boş array `[]` görmeli veya data

2. **Frontend kontrol:**
   - `https://frontend-production-yyy.up.railway.app`
   - Login sayfası görünmeli

3. **Login dene:**
   - Varsayılan kullanıcı yoksa oluşturman gerekebilir
   - Database ilk defa oluşuyor

---

## 🔥 HATA ÇÖZÜMÜ

### "Application failed to respond"

**Logs'a bak:**
Railway'de servis → **"Deployments"** → En son deployment → **"View Logs"**

**Çözümler:**
- Root Directory yanlış olabilir (backend veya frontend)
- Environment variables eksik
- Build hatası var (logs'da görünür)

### "Cannot connect to backend"

**Kontrol et:**
1. Backend URL doğru mu? (https ile başlamalı)
2. Frontend environment variable doğru mu?
3. CORS ayarı yapıldı mı?

### Build hatası

**Logs'da göreceğin hatalar:**
- Module not found → dependencies eksik
- Syntax error → kod hatası
- Memory error → Railway plan upgrade gerekebilir

---

## 💰 MALİYET

Railway ücretsiz plan:
- $5/ay kredi
- Her deploy kredi tüketir
- Hobby plan: $5/ay (sınırsız)

---

## 📱 İLETİŞİM

Takıldığın yeri söyle, beraber hallederiz!

**Hangi adımdasın şimdi?**
