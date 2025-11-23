"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Navbar from "@/components/navbar"
import ProductCreationForm from "@/components/product-creation-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createProduct, getAllProducts, fetchTokenBalance } from "@/lib/api"
import { Product } from "@/lib/types"
import { Package, Search, TrendingUp, Shield, Globe, ArrowRight, Wallet, Activity } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [wallet, setWallet] = useState<string | null>(null)
  const [tokens, setTokens] = useState(0)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])

  // Cüzdan değiştiğinde bakiyeyi çek
  useEffect(() => {
    if (!wallet) return
    fetchTokenBalance(wallet).then(setTokens)
  }, [wallet])

  // Son ürünleri yükle
  useEffect(() => {
    const loadRecentProducts = async () => {
      try {
        const allProducts = await getAllProducts()
        // En yeni 5 ürünü al (tarihe göre sırala)
        const sorted = allProducts.sort((a, b) => {
          const dateA = typeof a.created_at === "string" ? new Date(a.created_at).getTime() : a.created_at * 1000
          const dateB = typeof b.created_at === "string" ? new Date(b.created_at).getTime() : b.created_at * 1000
          return dateB - dateA
        })
        setRecentProducts(sorted.slice(0, 5))
      } catch (error) {
        console.error("Son ürünler yüklenirken hata:", error)
      }
    }
    loadRecentProducts()
  }, [])

  // Bildirim gösterme fonksiyonu
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Ürün oluşturma handler
  const handleCreateProduct = async (productId: string, serialNumber: string, manufacturer: string, location: string) => {
    try {
      await createProduct({
        productId,
        serialNumber,
        manufacturer,
        location,
      })
      showNotification("success", `Ürün ${productId} başarıyla oluşturuldu!`)
      
      // Son ürünleri yeniden yükle
      try {
        const allProducts = await getAllProducts()
        const sorted = allProducts.sort((a, b) => {
          const dateA = typeof a.created_at === "string" ? new Date(a.created_at).getTime() : a.created_at * 1000
          const dateB = typeof b.created_at === "string" ? new Date(b.created_at).getTime() : b.created_at * 1000
          return dateB - dateA
        })
        setRecentProducts(sorted.slice(0, 5))
      } catch (error) {
        console.error("Ürünler yeniden yüklenirken hata:", error)
      }
      
      // Ürün takip sayfasına yönlendir
      setTimeout(() => {
        router.push(`/products/track?productId=${productId}`)
      }, 1500)
    } catch (error) {
      throw error // Form component'i zaten hata yönetiyor
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar wallet={wallet} onWalletConnect={setWallet} />
      <div className="container mx-auto px-4 py-8">
        <Header />

        {/* Bildirim alanı */}
        {notification && (
          <div className="mb-6">
            <Alert variant={notification.type === "success" ? "default" : "destructive"}>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Hızlı Erişim Butonları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Ürün Oluştur</h3>
                    <p className="text-sm text-gray-600">Yeni ürün kaydı</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products/track">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Ürün Ara</h3>
                    <p className="text-sm text-gray-600">Tedarik zinciri takibi</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Blockchain</h3>
                  <p className="text-sm text-gray-600">Stellar Soroban</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol sütun - Ürün Oluşturma */}
          <div className="lg:col-span-8 space-y-6">
            <ProductCreationForm
              wallet={wallet}
              onSubmit={handleCreateProduct}
              onNotification={showNotification}
            />

            {/* Özellikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Güvenli & Şeffaf</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Tüm kayıtlar blockchain'de saklanır. Değiştirilemez ve şeffaf takip.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Merkezi Olmayan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Stellar blockchain üzerinde çalışır. Herkes ürün geçmişini doğrulayabilir.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sağ sütun - Bilgi Paneli */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cüzdan bilgisi */}
            {wallet ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Bağlı Cüzdan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Adres</p>
                      <p className="font-mono text-sm">
                        {wallet.slice(0, 8)}...{wallet.slice(-6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Token Bakiyesi</p>
                      <p className="text-2xl font-bold text-blue-600">{tokens}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Ürün oluşturmak ve tedarik zinciri yönetmek için üst menüden cüzdanınızı bağlayın.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Son Oluşturulan Ürünler */}
            {recentProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Son Ürünler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentProducts.map((product) => (
                      <Link
                        key={product.product_id}
                        href={`/products/track?productId=${product.product_id}`}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className="flex-1">
                          <span className="font-mono text-sm font-semibold block">{product.product_id}</span>
                          <span className="text-xs text-gray-500">{product.current_location}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 ml-2" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bilgi Kartı */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Nasıl Çalışır?</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5">1</Badge>
                    <span>Ürün oluşturun ve blockchain'e kaydedin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5">2</Badge>
                    <span>Tedarik zinciri adımlarını ekleyin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5">3</Badge>
                    <span>Ürün geçmişini görüntüleyin</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
