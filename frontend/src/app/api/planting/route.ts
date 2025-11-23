import { NextResponse } from "next/server"
import type { Planting } from "@/lib/types"

// Runtime configuration for Next.js
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// This would typically connect to a database
const plantings: Planting[] = []

export async function POST(request: Request) {
  try {
    // Check if request has body
    const contentType = request.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      )
    }

    let planting
    try {
      planting = await request.json()
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError)
      return NextResponse.json(
        { error: "Geçersiz JSON formatı" },
        { status: 400 }
      )
    }

    // Validate the planting data
    if (!planting || typeof planting !== "object") {
      return NextResponse.json(
        { error: "Geçersiz veri formatı" },
        { status: 400 }
      )
    }

    if (!planting.city || !planting.crop) {
      return NextResponse.json(
        { error: "Şehir ve ürün bilgisi gereklidir" },
        { status: 400 }
      )
    }

    // Add ID if not provided
    if (!planting.id) {
      planting.id = plantings.length + 1
    }

    // Add to our "database"
    plantings.push(planting)

    return NextResponse.json({ success: true, planting })
  } catch (error) {
    console.error("Error processing planting:", error)
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata"
    return NextResponse.json(
      { error: `İşlem sırasında bir hata oluştu: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    return NextResponse.json({ plantings })
  } catch (error) {
    console.error("Error fetching plantings:", error)
    return NextResponse.json(
      { error: "Veriler alınırken hata oluştu" },
      { status: 500 }
    )
  }
}
