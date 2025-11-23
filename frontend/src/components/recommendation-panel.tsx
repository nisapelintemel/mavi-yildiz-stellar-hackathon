//components/recommendation-panel.tsx
"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RecommendationPanelProps {
  city: string
  crop: string
}

export default function RecommendationPanel({ city, crop }: RecommendationPanelProps) {
  const [recommendation, setRecommendation] = useState("")
  const [loading, setLoading] = useState(true)
  const [isPositive, setIsPositive] = useState(true)

  useEffect(() => {
    setLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      const newRecommendation = getRecommendation(city, crop)
      setRecommendation(newRecommendation)

      // Check if recommendation is positive or negative
      setIsPositive(!newRecommendation.includes("risklidir") && !newRecommendation.includes("önerilmez"))

      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [city, crop])

  if (loading) {
    return (
      <div className="mt-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Öneri ve Uyarı</h3>
      <Alert variant={isPositive ? "default" : "destructive"}>
        {isPositive ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertTitle>{isPositive ? "Uygun Ekim" : "Dikkat"}</AlertTitle>
        <AlertDescription>{recommendation}</AlertDescription>
      </Alert>
    </div>
  )
}

// Simple recommendation function (could be replaced with API call)
function getRecommendation(city: string, crop: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    Konya: {
      Mısır: "Konya'da bu yıl mısır ekmek risklidir, su yetersiz. Nohut önerilir.",
      Nohut: "Konya'da nohut ekimi için ideal koşullar mevcut. İyi bir tercih!",
      Mercimek: "Konya'da mercimek ekimi orta düzeyde verimli olabilir.",
      Arpa: "Konya'da arpa ekimi için uygun koşullar var.",
      Buğday: "Konya'da buğday ekimi için uygun koşullar var, ancak su tasarrufu önemli.",
      Pamuk: "Konya'da pamuk ekimi önerilmez, su tüketimi çok yüksek.",
    },
    Ankara: {
      Mısır: "Ankara'da mısır ekimi için orta düzeyde uygun koşullar var.",
      Nohut: "Ankara'da nohut ekimi için ideal koşullar mevcut.",
      Mercimek: "Ankara'da mercimek ekimi verimli olabilir.",
      Arpa: "Ankara'da arpa ekimi için çok uygun koşullar var.",
      Buğday: "Ankara'da buğday ekimi için uygun koşullar var.",
      Pamuk: "Ankara'da pamuk ekimi önerilmez, iklim uygun değil.",
    },
    Yozgat: {
      Mısır: "Yozgat'ta mısır ekimi için orta düzeyde uygun koşullar var.",
      Nohut: "Yozgat'ta nohut ekimi için uygun koşullar var.",
      Mercimek: "Yozgat'ta mercimek ekimi verimli olabilir.",
      Arpa: "Yozgat'ta arpa ekimi için uygundur, buğday da tercih edilebilir.",
      Buğday: "Yozgat'ta buğday ekimi için çok uygun koşullar var.",
      Pamuk: "Yozgat'ta pamuk ekimi önerilmez, iklim uygun değil.",
    },
    Adana: {
      Mısır: "Adana'da mısır ekimi için ideal koşullar mevcut.",
      Nohut: "Adana'da nohut ekimi için uygun koşullar var.",
      Mercimek: "Adana'da mercimek ekimi orta düzeyde verimli olabilir.",
      Arpa: "Adana'da arpa ekimi için uygun koşullar var.",
      Buğday: "Adana'da buğday ekimi için uygun koşullar var.",
      Pamuk: "Adana'da pamuk ekimi için ideal koşullar mevcut. Çok iyi bir tercih!",
    },
    Manisa: {
      Mısır: "Manisa'da mısır ekimi için uygun koşullar var.",
      Nohut: "Manisa'da nohut ekimi için orta düzeyde uygun koşullar var.",
      Mercimek: "Manisa'da mercimek ekimi orta düzeyde verimli olabilir.",
      Arpa: "Manisa'da arpa ekimi için uygun koşullar var.",
      Buğday: "Manisa'da buğday ekimi için uygun koşullar var.",
      Pamuk: "Manisa'da pamuk ekimi için uygun koşullar var, ancak su yönetimi önemli.",
    },
  }

  return recommendations[city]?.[crop] || `${city} için ${crop} ekimi hakkında bilgi bulunmamaktadır.`
}
