// mint-soroban.js
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();
const CONTRACT_ID         = process.env.CONTRACT_ID;
const ADMIN_ALIAS         = process.env.ADMIN_ALIAS || "admin";
const ADMIN_PUBLIC_KEY    = process.env.ADMIN_PUBLIC_KEY; 
const SOROBAN_RPC_URL     = process.env.SOROBAN_RPC_URL;
const SOROBAN_NETWORK_PASSPHRASE = process.env.SOROBAN_NETWORK_PASSPHRASE;

// Helper: run shell command, but check that `stellar` CLI is available first
let _stellarChecked = false;
function checkStellarAvailable() {
  return new Promise((resolve, reject) => {
    if (_stellarChecked) return resolve(true);
    exec("stellar --version", (err, stdout, stderr) => {
      if (err) {
        const msg = `The 'stellar' CLI was not found in PATH. Install the Soroban/Stellar CLI and ensure it's on your PATH. On Windows you can install Rust+cargo and then run 'cargo install --locked soroban-cli' (or follow the official Soroban CLI install instructions). Error details: ${stderr || err.message}`;
        return reject(new Error(msg));
      }
      _stellarChecked = true;
      resolve(true);
    });
  });
}

function runCmd(cmd) {
  return new Promise(async (resolve, reject) => {
    try {
      await checkStellarAvailable();
      if (!CONTRACT_ID) {
        return reject(new Error("CONTRACT_ID is not set in environment. Set CONTRACT_ID in backend/.env or your environment variables."));
      }
    } catch (e) {
      return reject(e);
    }
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else if (/error|❌/.test(stdout)) {
        reject(new Error(stdout));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export async function mintTokenToUser(wallet, amount) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- mint",
    `--to ${wallet}`,
    `--amount ${amount}`
  ].join(" ");

  const out = await runCmd(cmd);
  return out;
}
export async function getBalanceOf(wallet) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- balance",
    `--id ${wallet}`
  ].join(" ");

  const out = await runCmd(cmd);
  const num = Number(out.replace(/"/g, "").trim());
  return num;
}


export async function transferTokens(toWallet, amount) {
  // amount'u integer'a çevir
  const intAmount = parseInt(amount, 10);
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- transfer",
    `--from ${ADMIN_PUBLIC_KEY}`,
    `--to ${toWallet}`,
    `--amount ${intAmount}`
  ].join(" ");

  const out = await runCmd(cmd);
  return out;
}

// ========== TEDARİK ZİNCİRİ FONKSİYONLARI ==========

/**
 * Yeni bir ürün oluşturur ve blockchain'e kaydeder
 * @param {string} productId - Benzersiz ürün kodu
 * @param {string} serialNumber - Seri numarası
 * @param {string} manufacturer - Üretici cüzdan adresi
 * @param {string} location - Üretim yeri
 * @returns {Promise<string>} Transaction hash
 */
export async function createProduct(productId, serialNumber, manufacturer, location) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- create_product",
    `--product_id "${productId}"`,
    `--serial_number "${serialNumber}"`,
    `--manufacturer ${manufacturer}`,
    `--location "${location}"`
  ].join(" ");

  const out = await runCmd(cmd);
  return out;
}

// Create product with explicit timestamp split into high/low u32 parts
export async function createProductWithTs(productId, serialNumber, manufacturer, location, tsHigh, tsLow) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- create_product_with_ts",
    `--product_id "${productId}"`,
    `--serial_number "${serialNumber}"`,
    `--manufacturer ${manufacturer}`,
    `--location "${location}"`,
    `--timestamp_high ${tsHigh}`,
    `--timestamp_low ${tsLow}`
  ].join(" ");

  const out = await runCmd(cmd);
  return out;
}

/**
 * Tedarik zincirine yeni bir adım ekler
 * @param {string} productId - Ürün kodu
 * @param {number} stepType - Adım tipi (0: Production, 1: Shipping, 2: Transit, 3: Delivery)
 * @param {string} location - Yeni konum
 * @param {string} responsibleParty - Sorumlu taraf cüzdan adresi
 * @param {string|null} trackingNumber - Takip numarası (opsiyonel)
 * @param {object} metadata - Ek metadata (opsiyonel)
 * @returns {Promise<string>} Transaction hash
 */
export async function addStep(productId, stepType, location, responsibleParty, trackingNumber = null, metadata = {}) {
  const sourceAccount = responsibleParty;
  const parts = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${sourceAccount}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- add_step",
    `--product_id "${productId}"`,
    `--step_type ${stepType}`,
    `--location "${location}"`,
    `--responsible_party ${responsibleParty}`
  ];

  if (trackingNumber) {
    parts.push(`--tracking_number "${trackingNumber}"`);
  }

  if (Object.keys(metadata).length > 0) {
    parts.push(`--metadata '${JSON.stringify(metadata)}'`);
  }

  const out = await runCmd(parts.join(" "));
  return out;
}

// Add step with explicit timestamp high/low parts
export async function addStepWithTs(productId, stepType, location, responsibleParty, tsHigh, tsLow, trackingNumber = null, metadata = {}) {
  const sourceAccount = responsibleParty;
  const parts = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${sourceAccount}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- add_step_with_ts",
    `--product_id "${productId}"`,
    `--step_type ${stepType}`,
    `--location "${location}"`,
    `--responsible_party ${responsibleParty}`,
    `--timestamp_high ${tsHigh}`,
    `--timestamp_low ${tsLow}`
  ];

  if (trackingNumber) {
    parts.push(`--tracking_number "${trackingNumber}"`);
  }

  if (Object.keys(metadata).length > 0) {
    parts.push(`--metadata '${JSON.stringify(metadata)}'`);
  }

  const out = await runCmd(parts.join(" "));
  return out;
}

/**
 * Ürün bilgilerini blockchain'den okur
 * @param {string} productId - Ürün kodu
 * @returns {Promise<object>} Ürün bilgileri
 */
export async function getProduct(productId) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- get_product",
    `--product_id "${productId}"`
  ].join(" ");

  const out = await runCmd(cmd);
  try {
    return JSON.parse(out.trim());
  } catch {
    return { raw: out.trim() };
  }
}

/**
 * Ürünün tedarik zinciri geçmişini blockchain'den okur
 * @param {string} productId - Ürün kodu
 * @returns {Promise<Array>} Tedarik zinciri adımları
 */
export async function getProductHistory(productId) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- get_product_history",
    `--product_id "${productId}"`
  ].join(" ");

  const out = await runCmd(cmd);
  try {
    const result = JSON.parse(out.trim());
    return Array.isArray(result) ? result : [result];
  } catch {
    return [{ raw: out.trim() }];
  }
}

/**
 * Ürünün mevcut durumunu blockchain'den okur
 * @param {string} productId - Ürün kodu
 * @returns {Promise<number>} Durum kodu (0: Production, 1: InTransit, 2: InWarehouse, 3: Delivered)
 */
export async function getCurrentStatus(productId) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- get_current_status",
    `--product_id "${productId}"`
  ].join(" ");

  const out = await runCmd(cmd);
  const status = Number(out.replace(/"/g, "").trim());
  return status;
}

// ========== ROLE WRAPPERS ==========
export async function grantRole(addr, role) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- grant_role",
    `--addr ${addr}`,
    `--role ${role}`,
  ].join(" ");

  const out = await runCmd(cmd);
  return out;
}

export async function revokeRole(addr) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- revoke_role",
    `--addr ${addr}`,
  ].join(" ");

  const out = await runCmd(cmd);
  return out;
}

export async function getRole(addr) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source-account ${ADMIN_ALIAS}`,
    `--network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}"`,
    `--rpc-url ${SOROBAN_RPC_URL}`,
    "-- get_role",
    `--addr ${addr}`,
  ].join(" ");

  const out = await runCmd(cmd);
  const num = Number(out.replace(/"/g, "").trim());
  return num;
}