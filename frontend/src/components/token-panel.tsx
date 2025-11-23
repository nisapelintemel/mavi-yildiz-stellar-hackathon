import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleDollarSign, Sprout, Calendar } from "lucide-react"

interface TokenPanelProps {
  tokens: number
}

export default function TokenPanel({ tokens }: TokenPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5" />
            Token Bakiyesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{tokens}</div>
          <p className="text-green-100 mt-1">AquaRunnel Token</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            Ekim İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Toplam Ekim</span>
            <span className="font-semibold">{Math.floor(tokens / 10)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Başarılı Ekim</span>
            <span className="font-semibold">{Math.floor(tokens / 10)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Başarı Oranı</span>
            <span className="font-semibold">100%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ekim Takvimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Mayıs ayı için önerilen ürünler:</p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Mısır (Adana, Manisa)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Nohut (Konya, Ankara)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Buğday (Yozgat)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}