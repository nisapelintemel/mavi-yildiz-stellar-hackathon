import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Leaf, Droplets } from "lucide-react"

export default function InfoBox() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          Tarımda Hava Durumu Neden Önemli?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-start">
          <div className="bg-green-100 p-2 rounded-full">
            <CloudRain className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Yağmurdan bir gün önce gübre atmak neden daha verimlidir?</h3>
            <p className="text-gray-600 text-sm mt-1">
              Yağmur, gübreyi toprağa karıştırarak bitkilerin kök sistemine ulaşmasını sağlar. Bu sayede gübre kaybı
              azalır ve bitkiler besinleri daha etkin kullanır.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="bg-blue-100 p-2 rounded-full">
            <Droplets className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Doğru zamanda sulama yapmanın önemi</h3>
            <p className="text-gray-600 text-sm mt-1">
              Yağmur bekleniyorsa sulama yapmak su israfına neden olur. Sıcak ve kuru günlerde yapılan sulama ise
              bitkilerin strese girmesini önler ve verimi artırır.
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-md mt-4">
          <p className="text-green-800 text-sm">
            <strong>AquaRunnel</strong>, size en doğru zamanı göstermek için anlık hava verisi kullanır. Böylece hem
            kaynaklarınızı verimli kullanır hem de daha yüksek verim elde edersiniz.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
