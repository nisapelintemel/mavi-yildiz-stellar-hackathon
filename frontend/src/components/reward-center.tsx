"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Award } from "lucide-react"
import type { WeatherData } from "@/lib/types"
import { checkRewardEligibility, getActionRecommendation } from "@/lib/weather-service"

interface RewardCenterProps {
  onActionSubmit: (actionType: string) => void
  weatherData: WeatherData | null
  wallet: string | null
}

async function sendMintReward(wallet: string, amount: number) {
  const res = await fetch("http://localhost:4000/api/mint-reward", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet, amount }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Mint işlemi başarısız")
  }
  return res.json()
}

export default function RewardCenter({
  onActionSubmit,
  weatherData,
  wallet,
}: RewardCenterProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showResult, setShowResult]       = useState(false)
  const [lastResult, setLastResult]       = useState<{ eligible: boolean; recommendation: string } | null>(null)
  const [mintStatus, setMintStatus]       = useState<"idle"|"loading"|"success"|"error">("idle")
  const [mintError, setMintError]         = useState<string|null>(null)
  const actions = ["Gübreleme", "Sulama", "Ekim", "Hasat"]

  const handleActionClick = (action: string) => {
    setSelectedAction(action)
    setShowResult(false)
    setMintStatus("idle")
    setMintError(null)
    if (!weatherData) { setLastResult(null); return }
    const eligible = checkRewardEligibility(action, weatherData)
    const recommendation = getActionRecommendation(action, weatherData)
    setLastResult({ eligible, recommendation })
  }

  const handleSubmit = async () => {
    if (!wallet) { alert("Cüzdan bağlı değil!"); return }
    if (!selectedAction || !lastResult) return

    onActionSubmit(selectedAction)
    setShowResult(true)

    if (lastResult.eligible) {
      setMintStatus("loading")
      try {
        await sendMintReward(wallet, 15)
        setMintStatus("success")
      } catch (err: any) {
        setMintStatus("error")
        setMintError(err.message)
      }
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Doğru Zamanda Aksiyon Al, Ödül Kazan!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Hava durumuna göre en uygun tarımsal aksiyonu seçin ve doğru zamanda uygulayarak AquaToken kazanın.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {actions.map((a) => (
            <Button
              key={a}
              variant={selectedAction === a ? "default" : "outline"}
              className={selectedAction === a ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => handleActionClick(a)}
            >
              {a}
            </Button>
          ))}
        </div>

        {/* Öneri ve Bildir */}
        {selectedAction && lastResult && (
          <div className="mt-4">
            <Alert variant={lastResult.eligible ? "default" : "destructive"}>
              {lastResult.eligible ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{lastResult.eligible ? "Uygun Zaman!" : "Dikkat!"}</AlertTitle>
              <AlertDescription>{lastResult.recommendation}</AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                "{selectedAction} Yaptım" Bildir
              </Button>
            </div>
          </div>
        )}

        {/* Sonuç ve Mint Durumu */}
        {showResult && lastResult && (
          <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
            <div className="flex items-center gap-2">
              {lastResult.eligible ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Tebrikler! 15 AquaToken kazandınız.</span>
                  {mintStatus === "loading" && <span className="ml-2 text-xs text-gray-500 animate-pulse">Gönderiliyor…</span>}
                  {mintStatus === "success" && <span className="ml-2 text-xs text-green-600">Başarılı!</span>}
                  {mintStatus === "error" && <span className="ml-2 text-xs text-red-600">Hata: {mintError}</span>}
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Ödül kazanılamadı.</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {lastResult.eligible
                ? "Doğru zamanda aksiyon aldığınız için teşekkürler!"
                : "Daha uygun bir zamanda tekrar deneyin."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}