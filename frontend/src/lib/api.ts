// lib/api.ts
import type { Product, SupplyChainStep, CreateProductRequest, AddStepRequest, ProductStatus, StepType } from "./types";

const API_BASE_URL = "http://localhost:4000";

// ========== ESKİ FONKSİYONLAR (Geriye dönük uyumluluk) ==========

export async function fetchTokenBalance(wallet: string) {
  if (!wallet) return 0;
  const res = await fetch(`${API_BASE_URL}/api/balance/${wallet}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.success ? data.balance : 0;
}

// ========== TEDARİK ZİNCİRİ API FONKSİYONLARI ==========

/**
 * Yeni bir ürün oluşturur
 */
export async function createProduct(request: CreateProductRequest): Promise<{ success: boolean; productId: string; txHash: string }> {
  const res = await fetch(`${API_BASE_URL}/api/products/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: request.productId,
      serialNumber: request.serialNumber,
      manufacturer: request.manufacturer,
      location: request.location,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Ürün oluşturulamadı");
  }

  return res.json();
}

/**
 * Tedarik zincirine yeni bir adım ekler
 */
export async function addStep(
  productId: string,
  request: AddStepRequest
): Promise<{ success: boolean; productId: string; stepType: number; txHash: string }> {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stepType: request.stepType,
      location: request.location,
      responsibleParty: request.responsibleParty,
      trackingNumber: request.trackingNumber,
      metadata: request.metadata,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Adım eklenemedi");
  }

  return res.json();
}

/**
 * Ürün bilgilerini getirir
 */
export async function getProduct(productId: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Ürün bulunamadı");
  }

  const data = await res.json();
  return data.product;
}

/**
 * Ürünün tedarik zinciri geçmişini getirir
 */
export async function getProductHistory(productId: string): Promise<SupplyChainStep[]> {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}/history`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Geçmiş bulunamadı");
  }

  const data = await res.json();
  return data.steps || [];
}

/**
 * Ürünün mevcut durumunu getirir
 */
export async function getProductStatus(productId: string): Promise<{ status: ProductStatus; statusName: string }> {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}/status`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Durum sorgulanamadı");
  }

  const data = await res.json();
  return {
    status: data.status as ProductStatus,
    statusName: data.statusName,
  };
}

/**
 * Tüm ürünleri getirir (JSON dosyasından)
 */
export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/products`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Ürünler alınamadı");
  }

  const data = await res.json();
  return data.products || [];
}

/**
 * Ürün bilgilerini JSON'dan getirir (daha hızlı, adımlarla birlikte)
 */
export async function getProductFromJSON(productId: string): Promise<{ product: Product; steps: SupplyChainStep[] }> {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}/json`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Ürün bulunamadı");
  }

  const data = await res.json();
  return {
    product: data.product,
    steps: data.product.steps || [],
  };
}