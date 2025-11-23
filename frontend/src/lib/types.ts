// Eski tip tanımlamaları (geriye dönük uyumluluk için)
export type Planting = {
  id: number
  city: string
  crop: string
  earnsReward: boolean
  date: string
  wallet?: string
}

export interface WeatherData {
  city: string
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  rainChance: number
  forecast: {
    tomorrow: {
      condition: string
      rainChance: number
    }
  }
}

export interface FarmingAction {
  id: number
  date: string
  actionType: string
  weatherCondition: string
  temperature: number
  rewarded: boolean
  rewardAmount: number
  wallet: string
}

// ========== TEDARİK ZİNCİRİ TİP TANIMLAMALARI ==========

export enum ProductStatus {
  Production = 0,
  InTransit = 1,
  InWarehouse = 2,
  Delivered = 3,
}

export enum StepType {
  Production = 0,
  Shipping = 1,
  Transit = 2,
  Delivery = 3,
}

export interface Product {
  product_id: string
  serial_number: string
  manufacturer: string
  created_at: number | string // Unix timestamp veya ISO string
  current_status: ProductStatus
  current_location: string
  updated_at?: string // JSON'dan gelen
  tx_hash?: string // Blockchain transaction hash
}

export interface SupplyChainStep {
  step_id: number
  product_id: string
  step_type: StepType
  location: string
  responsible_party: string
  tracking_number?: string | null
  timestamp: number
  metadata?: Record<string, string>
}

export interface CreateProductRequest {
  productId: string
  serialNumber: string
  manufacturer: string
  location: string
}

export interface AddStepRequest {
  stepType: StepType
  location: string
  responsibleParty: string
  trackingNumber?: string
  metadata?: Record<string, string>
}
