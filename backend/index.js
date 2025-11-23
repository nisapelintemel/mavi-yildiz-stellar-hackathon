import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { mintTokenToUser, getBalanceOf, transferTokens, createProduct, createProductWithTs, addStep, addStepWithTs, getProduct, getProductHistory, getCurrentStatus } from "./mint-soroban.js";
import { createClient } from "@supabase/supabase-js";
import { 
  addProduct as addProductToJSON, 
  getAllProducts, 
  getProductFromJSON, 
  updateProduct,
  addStep as addStepToJSON,
  getProductSteps
} from "./utils/json-storage.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Supabase server client (service role) - must be set in backend env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} else {
  console.warn("Supabase service role key or URL not set; DB inserts will be skipped.");
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "Supply Chain Backend API"
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Supply Chain Backend API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      token: {
        balance: "GET /api/balance/:wallet",
        mint: "POST /api/mint-reward",
        transfer: "POST /api/transfer"
      },
      products: {
        create: "POST /api/products/create",
        get: "GET /api/products/:productId",
        addStep: "POST /api/products/:productId/steps",
        history: "GET /api/products/:productId/history",
        status: "GET /api/products/:productId/status"
      }
    }
  });
});

// Token bakiyesi endpoint (cüzdan adresi parametreyle)
app.get("/api/balance/:wallet", async (req, res) => {
  const { wallet } = req.params;
  try {
    const balance = await getBalanceOf(wallet);
    res.json({ success: true, balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Token mint endpoint
app.post("/api/mint-reward", async (req, res) => {
  const { wallet, amount } = req.body;
  try {
    const result = await mintTokenToUser(wallet, amount);
    res.json({ success: true, tx: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});




app.post("/api/transfer", async (req, res) => {
  const { toWallet, amount } = req.body;
  if (!toWallet || !amount) {
    return res.status(400).json({ success: false, error: "Eksik parametre" });
  }
  try {
    // amount'u integer'a çevirerek gönder!
    const result = await transferTokens(toWallet, parseInt(amount, 10));
    res.json({ success: true, tx: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== TEDARİK ZİNCİRİ API ENDPOINT'LERİ ==========

// Ürün oluştur
app.post("/api/products/create", async (req, res) => {
  const { productId, serialNumber, manufacturer, location } = req.body;
  
  if (!productId || !serialNumber || !manufacturer || !location) {
    return res.status(400).json({ 
      success: false, 
      error: "Eksik parametre: productId, serialNumber, manufacturer, location gerekli" 
    });
  }

  try {
    // Timestamp split into high/low u32
    const ts = BigInt(Date.now());
    const tsLow = Number(ts & 0xffffffffn);
    const tsHigh = Number((ts >> 32n) & 0xffffffffn);

    // Önce blockchain'e kaydet using timestamp-aware invocation
    let txHash;
    try {
      txHash = await createProductWithTs(productId, serialNumber, manufacturer, location, tsHigh, tsLow);
    } catch (e) {
      // fallback to original if new entrypoint isn't available
      console.warn("createProductWithTs failed, falling back to createProduct:", e.message || e);
      txHash = await createProduct(productId, serialNumber, manufacturer, location);
    }

    // Sonra JSON dosyasına kaydet
    const productData = {
      product_id: productId,
      serial_number: serialNumber,
      manufacturer: manufacturer,
      location: location,
      current_status: 0, // Production
      current_location: location,
      tx_hash: txHash,
      created_at: new Date().toISOString(),
    };

    addProductToJSON(productData);

    // Insert into Supabase if available
    if (supabase) {
      try {
        await supabase.from('products').insert([{ 
          product_id: productId,
          serial_number: serialNumber,
          manufacturer: manufacturer,
          location: location,
          current_status: 0,
          current_location: location,
          tx_hash: txHash,
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.warn('Supabase insert failed for product:', dbErr.message || dbErr);
      }
    }

    res.json({ 
      success: true, 
      productId,
      txHash 
    });
  } catch (err) {
    console.error("Ürün oluşturma hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tedarik zinciri adımı ekle
app.post("/api/products/:productId/steps", async (req, res) => {
  const { productId } = req.params;
  const { stepType, location, responsibleParty, trackingNumber, metadata } = req.body;

  if (!stepType || !location || !responsibleParty) {
    return res.status(400).json({ 
      success: false, 
      error: "Eksik parametre: stepType, location, responsibleParty gerekli" 
    });
  }

  // stepType validation (0-3 arası olmalı)
  if (stepType < 0 || stepType > 3) {
    return res.status(400).json({ 
      success: false, 
      error: "Geçersiz stepType: 0 (Production), 1 (Shipping), 2 (Transit), 3 (Delivery)" 
    });
  }

  try {
    // timestamp split
    const ts = BigInt(Date.now());
    const tsLow = Number(ts & 0xffffffffn);
    const tsHigh = Number((ts >> 32n) & 0xffffffffn);

    // Önce blockchain'e kaydet (use timestamp-aware function)
    let txHash;
    try {
      txHash = await addStepWithTs(
        productId,
        parseInt(stepType, 10),
        location,
        responsibleParty,
        tsHigh,
        tsLow,
        trackingNumber || null,
        metadata || {}
      );
    } catch (e) {
      console.warn('addStepWithTs failed, falling back to addStep:', e.message || e);
      txHash = await addStep(
        productId, 
        parseInt(stepType, 10), 
        location, 
        responsibleParty, 
        trackingNumber || null,
        metadata || {}
      );
    }
    
    // Sonra JSON dosyasına kaydet
    const stepData = {
      product_id: productId,
      step_type: parseInt(stepType, 10),
      location: location,
      responsible_party: responsibleParty,
      tracking_number: trackingNumber || null,
      metadata: metadata || {},
      tx_hash: txHash,
    };
    
    addStepToJSON(stepData);
    
    // Insert into Supabase
    if (supabase) {
      try {
        await supabase.from('product_steps').insert([{ 
          product_id: productId,
          step_type: parseInt(stepType, 10),
          location: location,
          responsible_party: responsibleParty,
          tracking_number: trackingNumber || null,
          metadata: metadata || {},
          tx_hash: txHash,
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.warn('Supabase insert failed for step:', dbErr.message || dbErr);
      }
    }

    // Ürün durumunu güncelle
    try {
      updateProduct(productId, {
        current_status: parseInt(stepType, 10),
        current_location: location,
      });
    } catch (updateErr) {
      console.warn("Ürün güncellenemedi (JSON):", updateErr.message);
    }
    
    res.json({ 
      success: true, 
      productId,
      stepType,
      txHash 
    });
  } catch (err) {
    console.error("Adım ekleme hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ürün bilgilerini getir
app.get("/api/products/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await getProduct(productId);
    res.json({ success: true, product });
  } catch (err) {
    console.error("Ürün sorgulama hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ürün geçmişini getir
app.get("/api/products/:productId/history", async (req, res) => {
  const { productId } = req.params;

  try {
    const history = await getProductHistory(productId);
    res.json({ success: true, productId, steps: history });
  } catch (err) {
    console.error("Geçmiş sorgulama hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ürün durumunu getir
app.get("/api/products/:productId/status", async (req, res) => {
  const { productId } = req.params;

  try {
    const status = await getCurrentStatus(productId);
    const statusNames = ["Production", "InTransit", "InWarehouse", "Delivered"];
    res.json({ 
      success: true, 
      productId,
      status,
      statusName: statusNames[status] || "Unknown"
    });
  } catch (err) {
    console.error("Durum sorgulama hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tüm ürünleri listele (JSON'dan)
app.get("/api/products", async (req, res) => {
  try {
    // If Supabase is configured, prefer server-side listing from DB
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.json({ success: true, products: data, count: Array.isArray(data) ? data.length : 0 });
      } catch (dbErr) {
        console.warn('Supabase products fetch failed, falling back to local JSON:', dbErr.message || dbErr);
      }
    }

    const products = getAllProducts();
    res.json({ 
      success: true, 
      products,
      count: products.length
    });
  } catch (err) {
    console.error("Ürün listesi hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supabase-backed products listing (explicit)
app.get('/api/products/supabase', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Supabase not configured on server' });
  }

  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, products: data, count: Array.isArray(data) ? data.length : 0 });
  } catch (err) {
    console.error('Supabase products fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supabase-backed single product with steps
app.get('/api/products/:productId/supabase', async (req, res) => {
  const { productId } = req.params;
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Supabase not configured on server' });
  }

  try {
    const { data: product, error: pErr } = await supabase.from('products').select('*').eq('product_id', productId).single();
    if (pErr) {
      if (pErr.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      throw pErr;
    }

    const { data: steps, error: sErr } = await supabase.from('product_steps').select('*').eq('product_id', productId).order('created_at', { ascending: true });
    if (sErr) throw sErr;

    res.json({ success: true, product: { ...product, steps } });
  } catch (err) {
    console.error('Supabase product fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ürün bilgilerini getir (JSON'dan - daha hızlı)
app.get("/api/products/:productId/json", async (req, res) => {
  const { productId } = req.params;

  try {
    const product = getProductFromJSON(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Ürün bulunamadı" });
    }
    
    // Adımları da ekle
    const steps = getProductSteps(productId);
    
    res.json({ 
      success: true, 
      product: {
        ...product,
        steps: steps
      }
    });
  } catch (err) {
    console.error("Ürün sorgulama hatası (JSON):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));