// JSON dosyası tabanlı basit veritabanı
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");
const STEPS_FILE = path.join(__dirname, "../data/steps.json");

// Dosya yoksa oluştur
function ensureFilesExist() {
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(STEPS_FILE)) {
    fs.writeFileSync(STEPS_FILE, JSON.stringify([], null, 2));
  }
}

// Ürünleri oku
export function readProducts() {
  ensureFilesExist();
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Ürünler okunurken hata:", error);
    return [];
  }
}

// Ürünleri yaz
export function writeProducts(products) {
  ensureFilesExist();
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Ürünler yazılırken hata:", error);
    return false;
  }
}

// Ürün ekle
export function addProduct(product) {
  const products = readProducts();
  
  // Ürün zaten var mı kontrol et
  if (products.find(p => p.product_id === product.product_id)) {
    throw new Error("Ürün zaten mevcut");
  }
  
  // created_at zaten varsa kullan, yoksa şimdiki zamanı ekle
  const productData = {
    ...product,
    created_at: product.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  products.push(productData);
  writeProducts(products);
  return productData;
}

// Ürün güncelle
export function updateProduct(productId, updates) {
  const products = readProducts();
  const index = products.findIndex(p => p.product_id === productId);
  
  if (index === -1) {
    throw new Error("Ürün bulunamadı");
  }
  
  products[index] = {
    ...products[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  writeProducts(products);
  return products[index];
}

// Ürün getir
export function getProductFromJSON(productId) {
  const products = readProducts();
  return products.find(p => p.product_id === productId);
}

// Tüm ürünleri getir
export function getAllProducts() {
  return readProducts();
}

// Adımları oku
export function readSteps() {
  ensureFilesExist();
  try {
    const data = fs.readFileSync(STEPS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Adımlar okunurken hata:", error);
    return [];
  }
}

// Adımları yaz
export function writeSteps(steps) {
  ensureFilesExist();
  try {
    fs.writeFileSync(STEPS_FILE, JSON.stringify(steps, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Adımlar yazılırken hata:", error);
    return false;
  }
}

// Adım ekle
export function addStep(step) {
  const steps = readSteps();
  
  step.step_id = steps.filter(s => s.product_id === step.product_id).length;
  step.timestamp = new Date().toISOString();
  
  steps.push(step);
  writeSteps(steps);
  
  return step;
}

// Ürün adımlarını getir
export function getProductSteps(productId) {
  const steps = readSteps();
  return steps.filter(s => s.product_id === productId);
}

