# Backend API Test Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. Backend'i Başlat

```bash
cd backend
node index.js
```

Backend `http://localhost:4000` adresinde çalışacak.

### 2. Test Scripti ile Test Et

```bash
node test-api.js
```

## 📋 Test Yöntemleri

### Yöntem 1: Node.js Test Scripti (Önerilen)

```bash
cd backend
node test-api.js
```

Bu script tüm endpoint'leri otomatik olarak test eder.

### Yöntem 2: cURL Komutları

#### Health Check
```bash
curl http://localhost:4000/health
```

#### API Info
```bash
curl http://localhost:4000/api
```

#### Ürün Oluştur
```bash
curl -X POST http://localhost:4000/api/products/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PROD-001",
    "serialNumber": "SN-12345",
    "manufacturer": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "location": "İstanbul, Türkiye"
  }'
```

#### Ürün Bilgilerini Getir
```bash
curl http://localhost:4000/api/products/PROD-001
```

#### Ürün Geçmişini Getir
```bash
curl http://localhost:4000/api/products/PROD-001/history
```

#### Ürün Durumunu Getir
```bash
curl http://localhost:4000/api/products/PROD-001/status
```

#### Adım Ekle
```bash
curl -X POST http://localhost:4000/api/products/PROD-001/steps \
  -H "Content-Type: application/json" \
  -d '{
    "stepType": 1,
    "location": "Ankara, Türkiye",
    "responsibleParty": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "trackingNumber": "TRACK-12345",
    "metadata": {
      "vehicle": "Kamyon-001",
      "driver": "Ahmet Yılmaz"
    }
  }'
```

#### Token Bakiyesi
```bash
curl http://localhost:4000/api/balance/GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Yöntem 3: Postman/Insomnia

1. Postman veya Insomnia'yı açın
2. Yeni bir collection oluşturun
3. Aşağıdaki endpoint'leri ekleyin:

#### Endpoint Listesi

**Health Check**
- Method: `GET`
- URL: `http://localhost:4000/health`

**API Info**
- Method: `GET`
- URL: `http://localhost:4000/api`

**Ürün Oluştur**
- Method: `POST`
- URL: `http://localhost:4000/api/products/create`
- Body (JSON):
```json
{
  "productId": "PROD-001",
  "serialNumber": "SN-12345",
  "manufacturer": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "location": "İstanbul, Türkiye"
}
```

**Ürün Getir**
- Method: `GET`
- URL: `http://localhost:4000/api/products/:productId`

**Ürün Geçmişi**
- Method: `GET`
- URL: `http://localhost:4000/api/products/:productId/history`

**Ürün Durumu**
- Method: `GET`
- URL: `http://localhost:4000/api/products/:productId/status`

**Adım Ekle**
- Method: `POST`
- URL: `http://localhost:4000/api/products/:productId/steps`
- Body (JSON):
```json
{
  "stepType": 1,
  "location": "Ankara, Türkiye",
  "responsibleParty": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "trackingNumber": "TRACK-12345",
  "metadata": {
    "vehicle": "Kamyon-001"
  }
}
```

### Yöntem 4: Browser (GET istekleri için)

Tarayıcıda şu URL'leri açabilirsiniz:

- `http://localhost:4000/health`
- `http://localhost:4000/api`
- `http://localhost:4000/api/products/PROD-001`
- `http://localhost:4000/api/products/PROD-001/history`
- `http://localhost:4000/api/products/PROD-001/status`

## 📊 Step Type Değerleri

- `0`: Production (Üretim)
- `1`: Shipping (Kargolama)
- `2`: Transit (Ara Durak)
- `3`: Delivery (Teslimat)

## ⚠️ Önemli Notlar

1. **Soroban CLI Gereksinimleri**: 
   - Backend, Soroban CLI komutlarını çalıştırır
   - `.env` dosyasında gerekli ayarlar olmalı
   - Soroban CLI kurulu olmalı

2. **Test Wallet Adresleri**:
   - Test için geçerli Stellar adresleri kullanın
   - Format: `G` ile başlayan 56 karakter

3. **Hata Durumları**:
   - Smart contract henüz deploy edilmemişse hata alabilirsiniz
   - `.env` dosyasındaki `CONTRACT_ID` geçerli olmalı

## 🐛 Debug İpuçları

1. **Backend loglarını kontrol edin**: Terminal'de hata mesajlarını görürsünüz
2. **Network isteklerini kontrol edin**: Browser DevTools > Network tab
3. **Environment variables**: `.env` dosyasını kontrol edin

## 📝 Test Senaryoları

### Senaryo 1: Tam Ürün Yaşam Döngüsü

1. Ürün oluştur (Production)
2. Kargolama adımı ekle (Shipping)
3. Ara durağa giriş (Transit)
4. Teslimat (Delivery)
5. Tüm geçmişi sorgula

### Senaryo 2: Hata Durumları

1. Eksik parametre ile ürün oluşturma
2. Geçersiz stepType ile adım ekleme
3. Olmayan ürün sorgulama

## 🔧 Gelişmiş Test

Jest veya Mocha kullanarak unit testler yazabilirsiniz:

```bash
npm install --save-dev jest
```

`package.json`'a test script ekleyin:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

