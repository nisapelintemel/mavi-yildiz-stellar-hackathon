import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CloudSun, Tractor, Award } from "lucide-react"

export default function UserGuide() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Nasıl Çalışır?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col items-center text-center p-2">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">1. Şehir Seç</h3>
            <p className="text-gray-600 text-sm mt-1">Tarım arazinizin bulunduğu şehri seçin</p>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <CloudSun className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">2. Hava Durumunu Gör</h3>
            <p className="text-gray-600 text-sm mt-1">Güncel ve yarınki hava durumunu kontrol edin</p>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <Tractor className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">3. Aksiyon Bildir</h3>
            <p className="text-gray-600 text-sm mt-1">Yapmak istediğiniz tarımsal aksiyonu seçin</p>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">4. Ödül Kazan</h3>
            <p className="text-gray-600 text-sm mt-1">Doğru zamanda aksiyon alarak token kazanın</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-md mt-6">
          <p className="text-yellow-800 text-sm">
            <strong>İpucu:</strong> Yarınki hava durumu tahminlerini kontrol ederek, gübreleme gibi aksiyonları en
            verimli zamanda planlayabilirsiniz. Yağmur öncesi gübreleme ve kuru havada hasat en çok ödül kazandıran
            aksiyonlardır.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
