"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import ProductCreationForm from "@/components/product-creation-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createProduct, getAllProducts } from "@/lib/api"
import { Product, ProductStatus } from "@/lib/types"
import { Package, Plus, Search, ArrowRight, Loader2, RefreshCw, Eye } from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Ürünleri yükle
  const loadProducts = async () => {
    setLoading(true)
    try {
      const allProducts = await getAllProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error)
    } finally {
      setLoading(false)
    }
  }

  // İlk yüklemede ve ürün oluşturulduğunda listeyi yenile
  useEffect(() => {
    loadProducts()
  }, [])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleCreateProduct = async (productId: string, serialNumber: string, manufacturer: string, location: string) => {
    try {
      await createProduct({
        productId,
        serialNumber,
        manufacturer,
        location,
      })
      showNotification("success", `Ürün ${productId} başarıyla oluşturuldu!`)
      // Listeyi yenile
      await loadProducts()
    } catch (error) {
      throw error // Form component'i zaten hata yönetiyor
    }
  }

  const formatDate = (dateValue: number | string) => {
    try {
      let date: Date
      if (typeof dateValue === "number") {
        // Unix timestamp (saniye cinsinden)
        date = new Date(dateValue * 1000)
      } else {
        // ISO string
        date = new Date(dateValue)
      }
      return date.toLocaleString("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return String(dateValue)
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürün Yönetimi</h1>
            <p className="text-gray-600">Yeni ürün oluşturun ve tedarik zinciri adımlarını yönetin</p>
          </div>
          <Link href="/products/track">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Ürün Ara
            </Button>
          </Link>
        </div>

        {/* Bildirim */}
        {notification && (
          <Alert
            variant={notification.type === "success" ? "default" : "destructive"}
            className="mb-6"
          >
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        {/* Ürün Oluşturma Formu */}
        <div className="mb-6">
          <ProductCreationForm
            wallet={wallet}
            onSubmit={handleCreateProduct}
            onNotification={showNotification}
          />
        </div>

        {/* Ürün Listesi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Tüm Ürünler ({products.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProducts}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Yenile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && products.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-500">Ürünler yükleniyor...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-2">Henüz ürün bulunmuyor</p>
                <p className="text-sm text-gray-400">Yukarıdaki formdan yeni ürün oluşturun</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün Kodu</TableHead>
                      <TableHead>Seri No</TableHead>
                      <TableHead>Konum</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Üretici</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.product_id}>
                        <TableCell className="font-mono font-semibold">
                          {product.product_id}
                        </TableCell>
                        <TableCell>{product.serial_number}</TableCell>
                        <TableCell>{product.current_location}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[product.current_status] || ""}>
                            {STATUS_LABELS[product.current_status] || "Bilinmiyor"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatAddress(product.manufacturer)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(product.created_at)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/track?productId=${product.product_id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Görüntüle
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Ürün Oluştur</h3>
              </div>
              <p className="text-sm text-gray-600">
                Yeni ürünlerinizi blockchain'e kaydedin ve benzersiz bir dijital kimlik verin.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Search className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Takip Et</h3>
              </div>
              <p className="text-sm text-gray-600">
                Ürünlerinizin tedarik zinciri geçmişini görüntüleyin ve şeffaf takip yapın.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Plus className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Adım Ekle</h3>
              </div>
              <p className="text-sm text-gray-600">
                Ürünlerinizin hareketlerini kaydedin ve tedarik zincirini güncel tutun.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

