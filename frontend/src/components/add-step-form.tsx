"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { StepType } from "@/lib/types"
import { Truck, Loader2, MapPin } from "lucide-react"

interface AddStepFormProps {
  productId: string
  wallet: string | null
  onSubmit: (stepType: StepType, location: string, responsibleParty: string, trackingNumber?: string, metadata?: Record<string, string>) => Promise<void>
  onNotification?: (type: "success" | "error", message: string) => void
}

const STEP_TYPE_OPTIONS = [
  { value: StepType.Shipping, label: "Kargolama", icon: "🚚" },
  { value: StepType.Transit, label: "Ara Durak", icon: "📍" },
  { value: StepType.Delivery, label: "Teslimat", icon: "✅" },
]

export default function AddStepForm({ productId, wallet, onSubmit, onNotification }: AddStepFormProps) {
  const [stepType, setStepType] = useState<StepType | "">("")
  const [location, setLocation] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [metadataKey, setMetadataKey] = useState("")
  const [metadataValue, setMetadataValue] = useState("")
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const addMetadata = () => {
    if (metadataKey && metadataValue) {
      setMetadata({ ...metadata, [metadataKey]: metadataValue })
      setMetadataKey("")
      setMetadataValue("")
    }
  }

  const removeMetadata = (key: string) => {
    const newMetadata = { ...metadata }
    delete newMetadata[key]
    setMetadata(newMetadata)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) {
      onNotification?.("error", "Lütfen önce cüzdanınızı bağlayın")
      return
    }

    // stepType kontrolü: boş string kontrolü
    if (stepType === "" || !location) {
      onNotification?.("error", "Lütfen adım tipi ve konum bilgilerini girin")
      return
    }

    // TypeScript için: stepType artık StepType (boş string değil)
    const validStepType = stepType as StepType

    setLoading(true)
    try {
      await onSubmit(
        validStepType,
        location,
        wallet,
        trackingNumber || undefined,
        Object.keys(metadata).length > 0 ? metadata : undefined
      )
      setSubmitted(true)
      onNotification?.("success", "Tedarik zinciri adımı başarıyla eklendi!")
      
      // Formu temizle
      setTimeout(() => {
        setStepType("")
        setLocation("")
        setTrackingNumber("")
        setMetadata({})
        setSubmitted(false)
      }, 3000)
    } catch (error) {
      onNotification?.("error", error instanceof Error ? error.message : "Adım eklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-purple-600" />
          <CardTitle>Tedarik Zinciri Adımı Ekle</CardTitle>
        </div>
        <CardDescription>
          Ürün: <span className="font-mono text-sm">{productId}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stepType">Adım Tipi *</Label>
            <Select
              value={stepType.toString()}
              onValueChange={(value) => setStepType(parseInt(value) as StepType)}
              disabled={loading || !wallet}
            >
              <SelectTrigger id="stepType">
                <SelectValue placeholder="Adım tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                {STEP_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.icon} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Konum *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                placeholder="Örn: Ankara, Türkiye"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={loading || !wallet}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Takip Numarası (Opsiyonel)</Label>
            <Input
              id="trackingNumber"
              placeholder="Örn: TRACK-12345"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={loading || !wallet}
            />
          </div>

          <div className="space-y-2">
            <Label>Ek Bilgiler (Metadata) - Opsiyonel</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Anahtar (örn: vehicle)"
                value={metadataKey}
                onChange={(e) => setMetadataKey(e.target.value)}
                disabled={loading || !wallet}
                className="flex-1"
              />
              <Input
                placeholder="Değer (örn: Kamyon-001)"
                value={metadataValue}
                onChange={(e) => setMetadataValue(e.target.value)}
                disabled={loading || !wallet}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addMetadata}
                disabled={loading || !wallet || !metadataKey || !metadataValue}
                variant="outline"
              >
                Ekle
              </Button>
            </div>
            {Object.keys(metadata).length > 0 && (
              <div className="mt-2 space-y-1">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span>
                      <span className="font-medium">{key}:</span> {value}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMetadata(key)}
                      disabled={loading}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!wallet && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                Adım eklemek için cüzdanınızı bağlamanız gerekiyor.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading || !wallet || !stepType || !location}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ekleniyor...
              </>
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Adım Ekle
              </>
            )}
          </Button>
        </form>

        {submitted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-700">✅ Adım başarıyla eklendi!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

