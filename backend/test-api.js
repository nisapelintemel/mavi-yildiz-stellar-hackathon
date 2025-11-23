// Backend API Test Script
// Kullanım: node test-api.js

const API_BASE_URL = "http://localhost:4000";

// Test verileri
const TEST_WALLET = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const TEST_PRODUCT_ID = "PROD-001";
const TEST_SERIAL_NUMBER = "SN-12345";
const TEST_MANUFACTURER = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const TEST_LOCATION = "İstanbul, Türkiye";

// Renkli console çıktıları için
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Test fonksiyonu
async function testEndpoint(name, method, url, body = null) {
  try {
    logInfo(`Testing: ${name}`);
    
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      logSuccess(`${name}: ${response.status} ${response.statusText}`);
      console.log("Response:", JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      logError(`${name}: ${response.status} ${response.statusText}`);
      console.log("Error:", JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (error) {
    logError(`${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test suite
async function runTests() {
  log("\n" + "=".repeat(60), "blue");
  log("🚀 Backend API Test Suite", "blue");
  log("=".repeat(60) + "\n", "blue");

  // 1. Health Check
  log("\n📋 1. Health Check Tests", "yellow");
  await testEndpoint(
    "Health Check",
    "GET",
    `${API_BASE_URL}/health`
  );

  // 2. API Info
  await testEndpoint(
    "API Info",
    "GET",
    `${API_BASE_URL}/api`
  );

  // 3. Token Endpoints
  log("\n📋 2. Token Endpoints Tests", "yellow");
  await testEndpoint(
    "Get Balance",
    "GET",
    `${API_BASE_URL}/api/balance/${TEST_WALLET}`
  );

  // 4. Product Endpoints
  log("\n📋 3. Product Endpoints Tests", "yellow");
  
  // Ürün oluştur
  const createResult = await testEndpoint(
    "Create Product",
    "POST",
    `${API_BASE_URL}/api/products/create`,
    {
      productId: TEST_PRODUCT_ID,
      serialNumber: TEST_SERIAL_NUMBER,
      manufacturer: TEST_MANUFACTURER,
      location: TEST_LOCATION,
    }
  );

  if (createResult.success) {
    // Ürün bilgilerini getir
    await testEndpoint(
      "Get Product",
      "GET",
      `${API_BASE_URL}/api/products/${TEST_PRODUCT_ID}`
    );

    // Ürün durumunu getir
    await testEndpoint(
      "Get Product Status",
      "GET",
      `${API_BASE_URL}/api/products/${TEST_PRODUCT_ID}/status`
    );

    // Ürün geçmişini getir
    await testEndpoint(
      "Get Product History",
      "GET",
      `${API_BASE_URL}/api/products/${TEST_PRODUCT_ID}/history`
    );

    // Adım ekle
    await testEndpoint(
      "Add Step (Shipping)",
      "POST",
      `${API_BASE_URL}/api/products/${TEST_PRODUCT_ID}/steps`,
      {
        stepType: 1, // Shipping
        location: "Ankara, Türkiye",
        responsibleParty: TEST_MANUFACTURER,
        trackingNumber: "TRACK-12345",
        metadata: {
          vehicle: "Kamyon-001",
          driver: "Ahmet Yılmaz"
        }
      }
    );
  }

  // 5. Error Tests
  log("\n📋 4. Error Handling Tests", "yellow");
  
  // Eksik parametre testi
  await testEndpoint(
    "Create Product (Missing Parameters)",
    "POST",
    `${API_BASE_URL}/api/products/create`,
    {
      productId: TEST_PRODUCT_ID,
      // serialNumber eksik
    }
  );

  // Geçersiz stepType testi
  await testEndpoint(
    "Add Step (Invalid stepType)",
    "POST",
    `${API_BASE_URL}/api/products/${TEST_PRODUCT_ID}/steps`,
    {
      stepType: 99, // Geçersiz
      location: "Test",
      responsibleParty: TEST_MANUFACTURER,
    }
  );

  // Olmayan ürün testi
  await testEndpoint(
    "Get Non-existent Product",
    "GET",
    `${API_BASE_URL}/api/products/NON-EXISTENT-123`
  );

  log("\n" + "=".repeat(60), "blue");
  log("✨ Test Suite Completed", "blue");
  log("=".repeat(60) + "\n", "blue");
}

// Test çalıştır
runTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});

