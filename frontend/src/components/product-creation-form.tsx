"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Package, Loader2 } from "lucide-react"

interface ProductCreationFormProps {
  wallet: string | null
  onSubmit: (productId: string, serialNumber: string, manufacturer: string, location: string) => Promise<void>
  onNotification?: (type: "success" | "error", message: string) => void
}

export default function ProductCreationForm({ wallet, onSubmit, onNotification }: ProductCreationFormProps) {
  const [productId, setProductId] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) {
      onNotification?.("error", "Lütfen önce cüzdanınızı bağlayın")
      return
    }

    if (!productId || !serialNumber || !location) {
      onNotification?.("error", "Lütfen tüm alanları doldurun")
      return
    }

    setLoading(true)
    try {
      await onSubmit(productId, serialNumber, wallet, location)
      setSubmitted(true)
      onNotification?.("success", "Ürün başarıyla oluşturuldu!")
      
      // Formu temizle
      setTimeout(() => {
        setProductId("")
        setSerialNumber("")
        setLocation("")
        setSubmitted(false)
      }, 3000)
    } catch (error) {
      onNotification?.("error", error instanceof Error ? error.message : "Ürün oluşturulurken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <CardTitle>Yeni Ürün Oluştur</CardTitle>
        </div>
        <CardDescription>
          Ürününüzü blockchain'e kaydedin ve tedarik zinciri takibine başlayın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Ürün Kodu *</Label>
            <Input
              id="productId"
              placeholder="Örn: PROD-001"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              disabled={loading || !wallet}
            />
            <p className="text-xs text-gray-500">Benzersiz ürün tanımlayıcısı</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Seri Numarası *</Label>
            <Input
              id="serialNumber"
              placeholder="Örn: SN-12345"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              required
              disabled={loading || !wallet}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Üretim Yeri *</Label>
            <Input
              id="location"
              placeholder="Örn: İstanbul, Türkiye"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              disabled={loading || !wallet}
            />
          </div>

          {!wallet && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                Ürün oluşturmak için cüzdanınızı bağlamanız gerekiyor.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading || !wallet || !productId || !serialNumber || !location}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Ürün Oluştur
              </>
            )}
          </Button>
        </form>

        {submitted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-700">✅ Ürün başarıyla oluşturuldu!</p>
            <p className="text-xs text-green-600 mt-1">
              Ürün Kodu: {productId} - Seri No: {serialNumber}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

