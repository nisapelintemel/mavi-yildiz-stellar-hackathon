"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlantingFormProps {
  onSubmit: (city: string, crop: string) => void
  onSelectionChange: (city: string, crop: string) => void
}

export default function PlantingForm({ onSubmit, onSelectionChange }: PlantingFormProps) {
  const [city, setCity] = useState("")
  const [crop, setCrop] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const cities = ["Konya", "Ankara", "Yozgat", "Adana", "Manisa"]
  const crops = ["Mısır", "Nohut", "Mercimek", "Arpa", "Buğday", "Pamuk"]

  const handleCityChange = (value: string) => {
    setCity(value)
    onSelectionChange(value, crop)
  }

  const handleCropChange = (value: string) => {
    setCrop(value)
    onSelectionChange(city, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city && crop) {
      onSubmit(city, crop)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-green-700 mb-4">Ekim Bildirimi</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Şehir Seçin</Label>
            <Select value={city} onValueChange={handleCityChange}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((cityOption) => (
                  <SelectItem key={cityOption} value={cityOption}>
                    {cityOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop">Ürün Seçin</Label>
            <Select value={crop} onValueChange={handleCropChange}>
              <SelectTrigger id="crop">
                <SelectValue placeholder="Ürün seçin" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((cropOption) => (
                  <SelectItem key={cropOption} value={cropOption}>
                    {cropOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!city || !crop}>
          Ekim Bildir
        </Button>
      </form>

      {submitted && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          <p className="font-medium">Ekim bildirimi alındı!</p>
          <p>
            Şehir: {city}, Ürün: {crop}
          </p>
        </div>
      )}
    </div>
  )
}
