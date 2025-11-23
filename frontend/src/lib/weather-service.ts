// lib/weather-service.ts
import type { WeatherData } from "./types"
import { USE_MOCK } from "./config"

const mockWeatherData: Record<string, WeatherData> = {
  Ankara: {
    city: "Ankara",
    temperature: 22,
    condition: "Güneşli",
    icon: "sun",
    humidity: 45,
    windSpeed: 12,
    rainChance: 5,
    forecast: {
      tomorrow: {
        condition: "Parçalı Bulutlu",
        rainChance: 20,
      },
    },
  },
  Konya: {
    city: "Konya",
    temperature: 24,
    condition: "Açık",
    icon: "sun",
    humidity: 40,
    windSpeed: 8,
    rainChance: 0,
    forecast: {
      tomorrow: {
        condition: "Yağmurlu",
        rainChance: 80,
      },
    },
  },
  Adana: {
    city: "Adana",
    temperature: 30,
    condition: "Sıcak",
    icon: "sun",
    humidity: 55,
    windSpeed: 5,
    rainChance: 10,
    forecast: {
      tomorrow: {
        condition: "Açık",
        rainChance: 5,
      },
    },
  },
  Yozgat: {
    city: "Yozgat",
    temperature: 18,
    condition: "Bulutlu",
    icon: "cloud",
    humidity: 60,
    windSpeed: 15,
    rainChance: 40,
    forecast: {
      tomorrow: {
        condition: "Yağmurlu",
        rainChance: 90,
      },
    },
  },
  Manisa: {
    city: "Manisa",
    temperature: 26,
    condition: "Parçalı Bulutlu",
    icon: "cloud-sun",
    humidity: 50,
    windSpeed: 10,
    rainChance: 20,
    forecast: {
      tomorrow: {
        condition: "Parçalı Bulutlu",
        rainChance: 30,
      },
    },
  },
}

function mapWeatherCondition(condition: string): string {
  switch (condition) {
    case "Clear":
      return "Güneşli"
    case "Clouds":
      return "Bulutlu"
    case "Rain":
      return "Yağmurlu"
    case "Snow":
      return "Karlı"
    case "Thunderstorm":
      return "Fırtına"
    case "Mist":
    case "Fog":
    case "Haze":
      return "Sisli"
    default:
      return condition 
  }
}

export async function fetchWeatherData(city: string): Promise<WeatherData> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return mockWeatherData[city] || mockWeatherData["Ankara"]
  } else {
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    try {
      // Şu anki hava 
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},tr&units=metric&appid=${API_KEY}&lang=tr`
      )
      const current = await currentRes.json()

      // Yarın için forecast 
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city},tr&units=metric&appid=${API_KEY}&lang=tr`
      )
      const forecastData = await forecastRes.json()

      
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(12, 0, 0, 0)

      let tomorrowForecast = forecastData.list.find((f: any) => {
        const date = new Date(f.dt_txt)
        return (
          date.getDate() === tomorrow.getDate() &&
          date.getMonth() === tomorrow.getMonth() &&
          date.getFullYear() === tomorrow.getFullYear() &&
          date.getHours() === 12
        )
      })

      return {
        city: current.name,
        temperature: Math.round(current.main.temp),
        condition: mapWeatherCondition(current.weather[0].main),
        icon: current.weather[0].icon,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed),
        rainChance: current.rain ? 100 : 0,
        forecast: {
          tomorrow: {
            condition: tomorrowForecast
              ? mapWeatherCondition(tomorrowForecast.weather[0].main)
              : "Bilinmiyor",
            rainChance: tomorrowForecast && typeof tomorrowForecast.pop === "number"
              ? Math.round(tomorrowForecast.pop * 100)
              : 0,
          },
        },
      }
    } catch (error) {
      // API veya ağ hatasında mock veriye dön
      return mockWeatherData[city] || mockWeatherData["Ankara"]
    }
  }
}


export function checkRewardEligibility(actionType: string, weather: WeatherData): boolean {
  switch (actionType) {
    case "Gübreleme":
      // Yarın yağmur varsa ödül var (gübrelemede yağmur avantaj)
      return weather.forecast.tomorrow.rainChance > 60
    case "Sulama":
      // Sıcak ve yarın yağmur yoksa ödül var
      return weather.temperature > 25 && weather.forecast.tomorrow.rainChance < 30
    case "Ekim":
      // Toprak çok kuru olmasın, çok ıslak olmasın
      return weather.forecast.tomorrow.rainChance > 20 && weather.forecast.tomorrow.rainChance < 70
    case "Hasat":
      // Güneşli ya da açık hava en iyisi
      return weather.condition.includes("Güneşli") || weather.condition.includes("Açık")
    default:
      return false
  }
}

// Aksiyon önerisi (kullanıcıya neden ödül var/yok)
export function getActionRecommendation(actionType: string, weather: WeatherData): string {
  const isEligible = checkRewardEligibility(actionType, weather)
  switch (actionType) {
    case "Gübreleme":
      return isEligible
        ? `${weather.city}'de yarın yağmur bekleniyor. Gübreleme için ideal zaman!`
        : `${weather.city}'de yarın yağmur beklenmiyor. Gübreleme için daha uygun bir zaman seçebilirsiniz.`
    case "Sulama":
      return isEligible
        ? `${weather.city}'de hava sıcak ve kuru. Sulama için ideal zaman!`
        : `${weather.city}'de yağmur bekleniyor veya hava yeterince sıcak değil. Sulama gerekli olmayabilir.`
    case "Ekim":
      return isEligible
        ? `${weather.city}'de toprak nemi ekim için uygun görünüyor.`
        : `${weather.city}'de toprak koşulları ekim için ideal değil. Daha uygun bir zaman seçebilirsiniz.`
    case "Hasat":
      return isEligible
        ? `${weather.city}'de hava kuru ve güneşli. Hasat için ideal zaman!`
        : `${weather.city}'de hava koşulları hasat için uygun değil. Daha kuru bir gün seçebilirsiniz.`
    default:
      return "Hava durumu bilgisi alınamadı."
  }
}