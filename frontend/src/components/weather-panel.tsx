"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Cloud, CloudRain, Wind, Droplets, RefreshCw, CloudSun } from "lucide-react"
import type { WeatherData } from "@/lib/types"

interface WeatherPanelProps {
  selectedCity: string
  onCityChange: (city: string) => void
  weatherData: WeatherData | null
  loading: boolean
  onRefresh: () => void
}

export default function WeatherPanel({
  selectedCity,
  onCityChange,
  weatherData,
  loading,
  onRefresh,
}: WeatherPanelProps) {
  const cities = ["Ankara", "Konya", "Adana", "Yozgat", "Manisa"]

  // Function to render weather icon based on condition
  const renderWeatherIcon = (condition: string) => {
    switch (condition) {
      case "Güneşli":
      case "Açık":
      case "Sıcak":
        return <Sun className="h-16 w-16 text-yellow-500" />
      case "Bulutlu":
        return <Cloud className="h-16 w-16 text-gray-500" />
      case "Yağmurlu":
        return <CloudRain className="h-16 w-16 text-blue-500" />
      case "Parçalı Bulutlu":
        return <CloudSun className="h-16 w-16 text-gray-500" />
      default:
        return <Sun className="h-16 w-16 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Anlık Hava Durumu</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Güncelle
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Şehir Seçin
          </label>
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder="Şehir seçin" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center">
              {renderWeatherIcon(weatherData.condition)}
              <div className="text-4xl font-bold mt-2">{weatherData.temperature}°C</div>
              <div className="text-gray-500">{weatherData.condition}</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Nem: %{weatherData.humidity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Rüzgar: {weatherData.windSpeed} km/s</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Yağmur Olasılığı: %{weatherData.rainChance}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700">Yarın:</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-700">{weatherData.forecast.tomorrow.condition}</span>
                  <span className="text-sm text-gray-500">(Yağmur: %{weatherData.forecast.tomorrow.rainChance})</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">Hava durumu bilgisi yüklenemedi.</div>
        )}
      </CardContent>
    </Card>
  )
}
