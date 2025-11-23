"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Star, Cloud, Home, Package } from "lucide-react"
import { connectWallet } from "@/lib/wallet"

export type NavbarProps = {
  wallet: string | null
  onWalletConnect: (address: string) => void
}

export default function Navbar({ wallet, onWalletConnect }: NavbarProps) {
  const pathname = usePathname()

  async function handleConnect() {
    try {
      const address = await connectWallet()
      onWalletConnect(address)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Bilinmeyen hata")
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Star className="h-6 w-6 text-blue-600 fill-blue-600" />
          <span className="ml-2 text-lg font-semibold text-blue-700">Mavi&Yıldız</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              pathname === "/" ? "text-green-700 bg-green-50" : "text-gray-600 hover:text-green-700 hover:bg-green-50"
            }`}
          >
            <Home className="h-4 w-4 mr-1" />
            Ana Sayfa
          </Link>
         
            
       
          <Link
            href="/products"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              pathname?.startsWith("/products")
                ? "text-blue-700 bg-blue-50"
                : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
            }`}
          >
            <Package className="h-4 w-4 mr-1" />
            Ürünler
          </Link>
          <button
            onClick={handleConnect}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          >
            {wallet ? wallet.slice(0, 8) + "..." : "Cüzdan Bağla"}
          </button>
        </div>
      </div>
    </nav>
  )
}