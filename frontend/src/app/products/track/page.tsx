"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/navbar"
import ProductHistoryTimeline from "@/components/product-history-timeline"
import { getProduct, getProductHistory, getProductStatus } from "@/lib/api"
import { Product, SupplyChainStep, ProductStatus } from "@/lib/types"
import { Search, Loader2, Package, MapPin, Calendar, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ProductTrackingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [history, setHistory] = useState<SupplyChainStep[]>([])
  const [status, setStatus] = useState<ProductStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallet, setWallet] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Lütfen bir ürün kodu girin")
      return
    }

    setLoading(true)
    setError(null)
    setProduct(null)
    setHistory([])
    setStatus(null)

    try {
      // Ürün bilgilerini getir
      const productData = await getProduct(searchQuery.trim())
      setProduct(productData)

      // Ürün geçmişini getir
      const historyData = await getProductHistory(searchQuery.trim())
      setHistory(historyData)

      // Ürün durumunu getir
      const statusData = await getProductStatus(searchQuery.trim())
      setStatus(statusData.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürün bulunamadı")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatDate = (timestamp: number | string) => {
    // Accept either a numeric unix timestamp (seconds) or an ISO/string/number
    let tsNum: number
    if (typeof timestamp === "string") {
      // try numeric string first
      const n = Number(timestamp)
      if (!Number.isNaN(n)) {
        tsNum = n
      } else {
        // parse as ISO date string
        const parsed = Date.parse(timestamp)
        tsNum = Number.isNaN(parsed) ? 0 : Math.floor(parsed / 1000)
      }
    } else {
      tsNum = timestamp
    }

    const date = new Date(tsNum * 1000)
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.slice(0, 8)}...${address.slice(-6)}`
    }
    return address
  }

  const STATUS_LABELS = {
    [ProductStatus.Production]: "Üretim",
    [ProductStatus.InTransit]: "Yolda",
    [ProductStatus.InWarehouse]: "Depoda",
    [ProductStatus.Delivered]: "Teslim Edildi",
  }

  const STATUS_COLORS = {
    [ProductStatus.Production]: "bg-blue-100 text-blue-800",
    [ProductStatus.InTransit]: "bg-purple-100 text-purple-800",
    [ProductStatus.InWarehouse]: "bg-orange-100 text-orange-800",
    [ProductStatus.Delivered]: "bg-green-100 text-green-800",
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar wallet={wallet} onWalletConnect={setWallet} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürün Takibi</h1>
          <p className="text-gray-600">Ürün kodunu veya QR kodunu kullanarak tedarik zinciri geçmişini görüntüleyin</p>
        </div>

        {/* Arama Kutusu */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Ürün Ara
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ürün kodunu girin (örn: PROD-001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aranıyor...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Ara
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hata Mesajı */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Ürün Bilgileri */}
        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Ürün Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Ürün Kodu</p>
                  <p className="font-mono font-semibold">{product.product_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seri Numarası</p>
                  <p className="font-semibold">{product.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <Badge className={status !== null ? STATUS_COLORS[status] : ""}>
                    {status !== null ? STATUS_LABELS[status] : "Bilinmiyor"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Konum Bilgisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-gray-500">Mevcut Konum</p>
                  <p className="font-semibold">{product.current_location}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Tarih Bilgisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-gray-500">Oluşturulma Tarihi</p>
                  <p className="font-semibold">{formatDate(product.created_at)}</p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Üretici</p>
                  <p className="font-mono text-xs">{formatAddress(product.manufacturer)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tedarik Zinciri Geçmişi */}
        {product && (
          <ProductHistoryTimeline steps={history} currentStatus={status || ProductStatus.Production} />
        )}

        {/* Boş Durum */}
        {!product && !loading && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Ürün Ara</h3>
              <p className="text-gray-500">Ürün kodunu girerek tedarik zinciri geçmişini görüntüleyin</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

