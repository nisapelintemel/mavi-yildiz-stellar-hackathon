# Frontend Component Kılavuzu

## 📦 Oluşturulan Component'ler

### 1. ProductCreationForm
**Dosya:** `frontend/src/components/product-creation-form.tsx`

**Açıklama:** Yeni ürün oluşturma formu component'i.

**Props:**
- `wallet: string | null` - Bağlı cüzdan adresi
- `onSubmit: (productId, serialNumber, manufacturer, location) => Promise<void>` - Form submit handler
- `onNotification?: (type, message) => void` - Bildirim callback'i

**Kullanım:**
```tsx
<ProductCreationForm
  wallet={wallet}
  onSubmit={handleCreateProduct}
  onNotification={showNotification}
/>
```

### 2. AddStepForm
**Dosya:** `frontend/src/components/add-step-form.tsx`

**Açıklama:** Tedarik zinciri adımı ekleme formu.

**Props:**
- `productId: string` - Ürün kodu
- `wallet: string | null` - Bağlı cüzdan adresi
- `onSubmit: (stepType, location, responsibleParty, trackingNumber?, metadata?) => Promise<void>`
- `onNotification?: (type, message) => void`

**Kullanım:**
```tsx
<AddStepForm
  productId="PROD-001"
  wallet={wallet}
  onSubmit={handleAddStep}
  onNotification={showNotification}
/>
```

### 3. ProductHistoryTimeline
**Dosya:** `frontend/src/components/product-history-timeline.tsx`

**Açıklama:** Ürünün tedarik zinciri geçmişini timeline formatında gösterir.

**Props:**
- `steps: SupplyChainStep[]` - Tedarik zinciri adımları
- `currentStatus: ProductStatus` - Ürünün mevcut durumu

**Kullanım:**
```tsx
<ProductHistoryTimeline
  steps={history}
  currentStatus={status}
/>
```

## 📄 Sayfalar

### 1. ProductsPage (Dashboard)
**Dosya:** `frontend/src/app/products/page.tsx`

**Açıklama:** Ürün yönetimi ana sayfası. Ürün oluşturma ve genel bilgiler.

**Route:** `/products`

### 2. ProductTrackingPage
**Dosya:** `frontend/src/app/products/track/page.tsx`

**Açıklama:** Ürün takip sayfası. Ürün arama ve geçmiş görüntüleme.

**Route:** `/products/track`

## 🎨 Component Stil Rehberi

### Renkler
- **Mavi**: Ürün oluşturma, genel bilgiler
- **Mor**: Tedarik zinciri adımları
- **Yeşil**: Başarılı işlemler, teslimat
- **Turuncu**: Ara duraklar
- **Kırmızı**: Hatalar

### İkonlar
- `Package`: Ürün
- `Truck`: Kargolama
- `MapPin`: Konum, ara duraklar
- `CheckCircle`: Teslimat
- `Clock`: Zaman damgası
- `Search`: Arama

## 🔧 Component Oluşturma Adımları

### 1. Component Dosyası Oluştur
```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
// ... diğer import'lar

export default function MyComponent() {
  // Component logic
  return (
    // JSX
  )
}
```

### 2. Type Tanımlamaları
`frontend/src/lib/types.ts` dosyasına yeni type'lar ekleyin.

### 3. API Fonksiyonları
`frontend/src/lib/api.ts` dosyasına yeni API fonksiyonları ekleyin.

### 4. UI Component'leri
Shadcn UI component'lerini kullanın:
- `Button`, `Input`, `Label`
- `Card`, `CardHeader`, `CardContent`
- `Select`, `Badge`, `Alert`

## 📝 Örnek Component Yapısı

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface MyComponentProps {
  // Props tanımlamaları
}

export default function MyComponent({ ...props }: MyComponentProps) {
  const [state, setState] = useState("")

  const handleSubmit = async () => {
    // Submit logic
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Başlık</CardTitle>
      </CardHeader>
      <CardContent>
        {/* İçerik */}
      </CardContent>
    </Card>
  )
}
```

## 🚀 Kullanım Örnekleri

### Ürün Oluşturma Sayfası
```tsx
import ProductCreationForm from "@/components/product-creation-form"
import { createProduct } from "@/lib/api"

export default function CreateProductPage() {
  const handleCreate = async (productId, serialNumber, manufacturer, location) => {
    await createProduct({
      productId,
      serialNumber,
      manufacturer,
      location,
    })
  }

  return (
    <ProductCreationForm
      wallet={wallet}
      onSubmit={handleCreate}
    />
  )
}
```

### Ürün Takip Sayfası
```tsx
import ProductHistoryTimeline from "@/components/product-history-timeline"
import { getProductHistory } from "@/lib/api"

export default function TrackPage() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    getProductHistory("PROD-001").then(setHistory)
  }, [])

  return (
    <ProductHistoryTimeline
      steps={history}
      currentStatus={ProductStatus.InTransit}
    />
  )
}
```

## 📚 İlgili Dosyalar

- **Types:** `frontend/src/lib/types.ts`
- **API:** `frontend/src/lib/api.ts`
- **UI Components:** `frontend/src/components/ui/`
- **Pages:** `frontend/src/app/`

## ⚠️ Önemli Notlar

1. **"use client"** direktifi: Client component'ler için gerekli
2. **Async fonksiyonlar**: API çağrıları için async/await kullanın
3. **Error handling**: Try-catch blokları ekleyin
4. **Loading states**: Kullanıcı deneyimi için loading göstergeleri ekleyin
5. **Validation**: Form validation yapın

## 🎯 Sonraki Adımlar

1. QR kod entegrasyonu
2. Dashboard sayfası (ürün listesi)
3. Responsive tasarım iyileştirmeleri
4. Animasyonlar ve geçişler

