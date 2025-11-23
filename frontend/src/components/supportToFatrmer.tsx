"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Send, Users, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SupportFarmerPanelProps {
  wallet: string
  onNotification?: (type: "success" | "error", message: string) => void
}

export default function SupportFarmerPanel({ wallet, onNotification }: SupportFarmerPanelProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  const handleSend = async () => {
    if (!wallet) {
      setStatus("Lütfen önce cüzdanınızı bağlayın.")
      onNotification?.("error", "Lütfen önce cüzdanınızı bağlayın.")
      return
    }

    if (!recipient) {
      setStatus("Alıcı cüzdan adresi gerekli.")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setStatus("Geçerli bir miktar giriniz.")
      return
    }

    setLoading(true)
    setStatus("Gönderiliyor...")

    try {
      const res = await fetch("http://localhost:4000/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toWallet: recipient,
          amount: Number(amount),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus("Başarıyla gönderildi!")
        onNotification?.("success", `${amount} AquaToken başarıyla gönderildi!`)
        // Başarılı işlemden sonra formu temizle
        setRecipient("")
        setAmount("")
      } else {
        setStatus("Hata: " + data.error)
        onNotification?.("error", "Hata: " + data.error)
      }
    } catch (error) {
      setStatus("İşlem sırasında bir hata oluştu.")
      onNotification?.("error", "İşlem sırasında bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Çiftçiye Destek Ol
        </CardTitle>
        <CardDescription>
          AquaToken'larınızı diğer çiftçilere göndererek onların sürdürülebilir tarım uygulamalarını
          destekleyebilirsiniz.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-green-50 p-3 rounded-md text-sm text-green-800">
          <p className="font-medium mb-1">Neden Çiftçileri Desteklemeliyim?</p>
          <p>
            Sürdürülebilir tarım uygulamaları, daha sağlıklı gıda üretimi ve çevrenin korunmasına katkı sağlar.
            Desteğiniz, çiftçilerin doğa dostu yöntemler kullanmasını teşvik eder.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="recipient">Alıcı Cüzdan Adresi</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">Destek olmak istediğiniz çiftçinin cüzdan adresini girin.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Token Miktarı</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">Göndermek istediğiniz AquaToken miktarını girin.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="10"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch">
        <Button
          onClick={handleSend}
          disabled={loading || !recipient || !amount}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              İşleniyor...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Token Gönder
            </>
          )}
        </Button>

        {status && (
          <div
            className={`mt-3 text-sm text-center ${status.includes("Başarıyla") ? "text-green-600" : "text-red-600"}`}
          >
            {status}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
