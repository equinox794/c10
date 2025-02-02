# **API.md**

Bu dosyada, **Backend API** için oluşturduğun **endpointler**in dökümantasyonu ve örnek istek/yanıtlar yer alır. Örnekler, gerçek proje tablolarına ve işlevlerine göre güncellenmelidir.

## 1. Genel Bilgiler

- **Taban URL**: `http://localhost:3001/api` (varsayılan)  
- **Veri Formatı**: JSON  
- **Kimlik Doğrulama**: Bu projede **tek kullanıcı** olduğu için özel bir login/auth mekanizması yoktur. İsteğe göre ileride eklenebilir.

## 2. Endpoint Listesi

### 2.1. **Müşteriler** (/customers)

#### GET /customers
Tüm müşterileri listeler.

- **İstek Örneği**  
  ```
  GET /api/customers
  ```
- **Yanıt Örneği**  
  ```json
  [
    { "id": 1, "name": "Firma A", "balance": 1200.50 },
    { "id": 2, "name": "Firma B", "balance": 0 }
  ]
  ```

#### GET /customers/:id
Belirli bir müşterinin detaylarını döndürür.

- **İstek Örneği**  
  ```
  GET /api/customers/1
  ```
- **Yanıt Örneği**  
  ```json
  { "id": 1, "name": "Firma A", "balance": 1200.50, "phone": "555-123-4567" }
  ```

#### POST /customers
Yeni müşteri ekler.

- **İstek Body**  
  ```json
  {
    "name": "Firma C",
    "balance": 0
  }
  ```
- **Yanıt Örneği**  
  ```json
  { "success": true, "insertedId": 3 }
  ```

#### PUT /customers/:id
Var olan müşteriyi günceller.

- **İstek Body**  
  ```json
  {
    "name": "Firma C (Güncel)",
    "balance": 500
  }
  ```
- **Yanıt Örneği**  
  ```json
  { "success": true }
  ```

#### DELETE /customers/:id
Müşteriyi siler.

- **Yanıt Örneği**  
  ```json
  { "success": true }
  ```

### 2.2. **Stok** (/stock)

#### GET /stock
Tüm stok kayıtlarını döndürür.

```bash
GET /api/stock
```

- **Yanıt Örneği**  
  ```json
  [
    { "id": 1, "name": "Hammadde A", "quantity": 100, "min_quantity": 10 },
    { "id": 2, "name": "Ürün B", "quantity": 50, "min_quantity": 5 }
  ]
  ```

#### POST /stock
Yeni stok (ürün/hammadde) ekler.

```bash
POST /api/stock
```
- **İstek Body**  
  ```json
  {
    "name": "Yeni Ürün",
    "quantity": 0,
    "min_quantity": 2
  }
  ```
- **Yanıt**  
  ```json
  { "success": true, "insertedId": 5 }
  ```

#### PUT /stock/:id
Stok bilgilerini günceller.

#### DELETE /stock/:id
Stok kaydını siler.

### 2.3. **Cari Hesap** (/transactions)

#### GET /transactions
Tüm cari hareketleri döndürür (borç/alacak, vade bilgisi vb.).

```bash
GET /api/transactions
```

### 2.4. **Reçeteler & Formülasyon** (/recipes)

#### GET /recipes
Tüm reçete kayıtlarını listele.

```bash
GET /api/recipes
```

#### POST /recipes
Yeni reçete ekler (örnek NPK formülasyon verisi varsa body’de geçilebilir).

```bash
POST /api/recipes
```

### 2.5. **Sipariş & Teklif** (/orders)

- **GET /orders**: Siparişleri listeler.  
- **GET /orders/:id**: Belirli siparişi veya teklifi döndürür.  
- **POST /orders**: Yeni sipariş veya teklif ekler.  
  - **Not**: `status="Teklif"` veya `status="Sipariş"` gibi bir kullanım olabilir.  
- **PUT /orders/:id**: Sipariş güncellemesi  
- **DELETE /orders/:id**: Siparişi siler

### 2.6. **Ayarlar** (/settings)

- **Ambalaj Tipleri** (örn. /settings/packaging)  
- **Şirket Bilgileri** (örn. /settings/company)  
- **Sabit Değerler** (örn. /settings/constants)

--- 

## 3. Hata Yanıtları

- **200 OK**: Başarılı işlemlerde döner.  
- **400 Bad Request**: Eksik veya geçersiz parametre.  
- **404 Not Found**: İstenen kayıt veya endpoint bulunamadı.  
- **500 Internal Server Error**: Sunucu veya veritabanı kaynaklı beklenmedik hata.  

Her hata yanıtı bir JSON nesnesi içerebilir, örn.  
```json
{ "error": "Record not found" }
```

---

## 4. Örnek Akış

**Yeni Stok Ekleme ve Güncelleme**

1. Stok listesi çek: `GET /api/stock`
2. Yeni stok ekle: `POST /api/stock`  
   Body:  
   ```json
   { "name": "Gubre X", "quantity": 0, "min_quantity": 5 }
   ```
3. Düzenlenen stok kaydını al: `GET /api/stock/:id`
4. Gerekirse güncelle: `PUT /api/stock/:id`  
   ```json
   { "name": "Gubre X v2", "quantity": 10, "min_quantity": 5 }
   ```

**Cari Hareket Ekleme**

1. `POST /api/transactions`  
   ```json
   { 
     "customer_id": 1, 
     "type": "Tahsilat", 
     "amount": 200, 
     "due_date": "2025-02-20" 
   }
   ```
2. Müşteri bakiyesi otomatik güncelleniyorsa, “customer_id = 1” olan kaydın `balance` alanı güncellenir.  
3. `GET /api/customers/1` ile değişikliği doğrula.

---

## 5. Notlar ve Genişletme

- Eğer **Formülasyon Modülü** çok ayrıntılıysa (N, P, K değerleri, oran hesaplamaları vb.), `/recipes` alt endpoint’lerinde ek alanlar (n_value, p_value, k_value vb.) olabilir.  
- “Teklif” ve “Sipariş” aynı tablo içinde `status` ile ayırt edilebileceği gibi tamamen ayrı endpoint’ler olarak da planlanabilir.

---

### Son

Bu **API.md** dosyası, projenin **API uç noktalarını** ve temel istek/yanıt yapısını özetler. Yeni endpoint’ler ekledikçe veya mevcutları değiştirdikçe bu dokümanı güncel tutmak, ekibin doğru ve tutarlı bir şekilde geliştirme yapmasını kolaylaştırır. 

> Her endpoint için girdi (body, params) ve çıktı (response) örneklerini **mutlaka** güncel bilgilerle tutmaya özen göster.