"use client"

import { SupplyChainStep, StepType, ProductStatus } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, MapPin, CheckCircle, Clock } from "lucide-react"

interface ProductHistoryTimelineProps {
  steps: SupplyChainStep[]
  currentStatus: ProductStatus
}

const STEP_TYPE_CONFIG = {
  [StepType.Production]: {
    label: "Üretim",
    icon: Package,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  [StepType.Shipping]: {
    label: "Kargolama",
    icon: Truck,
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  [StepType.Transit]: {
    label: "Ara Durak",
    icon: MapPin,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  [StepType.Delivery]: {
    label: "Teslimat",
    icon: CheckCircle,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
}

const STATUS_LABELS = {
  [ProductStatus.Production]: "Üretim",
  [ProductStatus.InTransit]: "Yolda",
  [ProductStatus.InWarehouse]: "Depoda",
  [ProductStatus.Delivered]: "Teslim Edildi",
}

export default function ProductHistoryTimeline({ steps, currentStatus }: ProductHistoryTimelineProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000) // Unix timestamp'i milisaniyeye çevir
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.slice(0, 8)}...${address.slice(-6)}`
    }
    return address
  }

  if (steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tedarik Zinciri Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Henüz tedarik zinciri adımı bulunmuyor.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tedarik Zinciri Geçmişi</CardTitle>
          <Badge variant="outline" className="text-sm">
            {STATUS_LABELS[currentStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline çizgisi */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const config = STEP_TYPE_CONFIG[step.step_type]
              const Icon = config.icon
              const isLast = index === steps.length - 1

              return (
                <div key={step.step_id} className="relative flex items-start space-x-4">
                  {/* Timeline noktası */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.color} text-white shadow-lg`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* İçerik */}
                  <div className={`flex-1 p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} ${isLast ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold ${config.textColor} flex items-center gap-2`}>
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Konum:</span> {step.location}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Adım #{step.step_id + 1}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(step.timestamp)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Sorumlu:</span>
                        <span className="font-mono text-xs">{formatAddress(step.responsible_party)}</span>
                      </div>

                      {step.tracking_number && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Takip No:</span>
                          <span className="font-mono text-xs">{step.tracking_number}</span>
                        </div>
                      )}

                      {step.metadata && Object.keys(step.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-2">Ek Bilgiler:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(step.metadata).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium text-gray-600">{key}:</span>{" "}
                                <span className="text-gray-500">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

