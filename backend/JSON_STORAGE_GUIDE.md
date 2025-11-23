# JSON Storage Kullanım Kılavuzu

## 📁 Dosya Yapısı

Backend'de ürünler ve adımlar JSON dosyalarında saklanır:

- `backend/data/products.json` - Tüm ürünler
- `backend/data/steps.json` - Tüm tedarik zinciri adımları

## 🔄 Çalışma Mantığı

### 1. Ürün Oluşturma
- Ürün önce **blockchain'e** kaydedilir (Stellar Soroban)
- Sonra **JSON dosyasına** kaydedilir (hızlı erişim için)
- Her iki kayıt da yapılır

### 2. Adım Ekleme
- Adım önce **blockchain'e** kaydedilir
- Sonra **JSON dosyasına** kaydedilir
- Ürün durumu **JSON'da güncellenir**

### 3. Veri Okuma
- **Blockchain'den okuma**: `GET /api/products/:productId` (tam doğruluk)
- **JSON'dan okuma**: `GET /api/products/:productId/json` (hızlı, adımlarla birlikte)
- **Tüm ürünler**: `GET /api/products` (JSON'dan, liste için)

## 📊 JSON Formatı

### products.json
```json
[
  {
    "product_id": "PROD-001",
    "serial_number": "SN-12345",
    "manufacturer": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "location": "İstanbul, Türkiye",
    "current_status": 0,
    "current_location": "İstanbul, Türkiye",
    "created_at": "2024-11-23T12:00:00.000Z",
    "updated_at": "2024-11-23T12:00:00.000Z",
    "tx_hash": "transaction_hash_here"
  }
]
```

### steps.json
```json
[
  {
    "product_id": "PROD-001",
    "step_id": 0,
    "step_type": 0,
    "location": "İstanbul, Türkiye",
    "responsible_party": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "tracking_number": null,
    "metadata": {},
    "timestamp": "2024-11-23T12:00:00.000Z",
    "tx_hash": "transaction_hash_here"
  }
]
```

## 🛠️ API Endpoint'leri

### Ürün İşlemleri

**Tüm Ürünleri Listele (JSON)**
```
GET /api/products
Response: { success: true, products: [...], count: 10 }
```

**Ürün Getir (Blockchain)**
```
GET /api/products/:productId
Response: { success: true, product: {...} }
```

**Ürün Getir (JSON - Hızlı)**
```
GET /api/products/:productId/json
Response: { success: true, product: {...}, steps: [...] }
```

**Ürün Oluştur**
```
POST /api/products/create
Body: { productId, serialNumber, manufacturer, location }
Response: { success: true, productId, txHash }
```

**Adım Ekle**
```
POST /api/products/:productId/steps
Body: { stepType, location, responsibleParty, trackingNumber?, metadata? }
Response: { success: true, productId, stepType, txHash }
```

## 💡 Kullanım Senaryoları

### Senaryo 1: Hızlı Liste Görüntüleme
```javascript
// JSON'dan tüm ürünleri çek (hızlı)
const products = await getAllProducts()
```

### Senaryo 2: Detaylı Ürün Bilgisi
```javascript
// Blockchain'den tam bilgi (doğruluk garantili)
const product = await getProduct(productId)
```

### Senaryo 3: Ürün + Adımlar (Hızlı)
```javascript
// JSON'dan ürün + adımlar (tek istek)
const { product, steps } = await getProductFromJSON(productId)
```

## ⚠️ Önemli Notlar

1. **Blockchain Ana Kaynak**: Blockchain'deki veri kesin doğru kaynaktır
2. **JSON Cache**: JSON dosyası hızlı erişim için cache görevi görür
3. **Senkronizasyon**: Ürün oluşturulduğunda her iki yere de kaydedilir
4. **Dosya Yedekleme**: JSON dosyalarını düzenli yedekleyin
5. **Git**: JSON dosyaları `.gitignore`'da olabilir (opsiyonel)

## 🔧 Dosya Yönetimi

### Dosya Konumu
- `backend/data/products.json`
- `backend/data/steps.json`

### Dosya Oluşturma
Dosyalar otomatik olarak oluşturulur. İlk çalıştırmada boş array olarak başlar.

### Manuel Düzenleme
JSON dosyalarını manuel olarak düzenleyebilirsiniz, ancak dikkatli olun:
- Geçerli JSON formatında olmalı
- `product_id` benzersiz olmalı
- Tarih formatları ISO string olmalı

## 📝 Örnek Kullanım

```javascript
// Backend'de
import { addProduct, getAllProducts } from "./utils/json-storage.js";

// Ürün ekle
const product = addProduct({
  product_id: "PROD-001",
  serial_number: "SN-12345",
  manufacturer: "G...",
  location: "İstanbul",
  current_status: 0,
  current_location: "İstanbul",
  tx_hash: "0x123..."
});

// Tüm ürünleri getir
const allProducts = getAllProducts();
```

## 🚀 Avantajlar

1. **Hızlı Erişim**: Blockchain sorgusu yerine dosya okuma
2. **Kolay Yedekleme**: JSON dosyası kolayca yedeklenebilir
3. **Offline Erişim**: Blockchain bağlantısı olmadan da çalışabilir
4. **Basit Yapı**: Karmaşık veritabanı kurulumu gerekmez

## 🔄 Senkronizasyon

Ürün oluşturulduğunda:
1. Blockchain'e kaydedilir ✅
2. JSON'a kaydedilir ✅

Adım eklendiğinde:
1. Blockchain'e kaydedilir ✅
2. JSON'a kaydedilir ✅
3. Ürün durumu JSON'da güncellenir ✅

