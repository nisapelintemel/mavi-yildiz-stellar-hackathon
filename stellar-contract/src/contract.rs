// src/contract.rs

use soroban_sdk::{
    contract, contractimpl, Address, Env, String, Symbol, Map, Vec, Val,
    IntoVal, TryIntoVal,
};

use soroban_token_sdk::{TokenUtils, metadata::TokenMetadata};
use soroban_sdk::symbol_short;

const ADMIN_KEY: Symbol = symbol_short!("admin");
const META_KEY: Symbol = symbol_short!("meta");

const PRODUCTS_KEY: Symbol = symbol_short!("products");
const STEPS_KEY: Symbol = symbol_short!("steps");
const ROLE_KEY: Symbol = symbol_short!("roles");
const ADMIN_PUBKEY_KEY: Symbol = symbol_short!("admin_pub");
const KEYMAP_KEY: Symbol = symbol_short!("keymap");

// Product Status
#[derive(Clone, Copy)]
#[repr(u32)]
pub enum ProductStatus {
    Production = 0,
    InTransit = 1,
    InWarehouse = 2,
    Delivered = 3,
}

// Supply Chain Step Type
#[derive(Clone, Copy)]
#[repr(u32)]
pub enum StepType {
    Production = 0,
    Shipping = 1,
    Transit = 2,
    Delivery = 3,
}

#[derive(Clone, Copy)]
#[repr(u32)]
pub enum Role {
    None = 0,
    Manufacturer = 1,
    Shipper = 2,
    Warehouse = 3,
    Auditor = 4,
}

// Convert product into map (Soroban SDK 22 compatible)
fn product_to_map(
    e: &Env,
    product_id: String,
    serial_number: String,
    manufacturer: Address,
    created_at: u64,
    current_status: u32,
    current_location: String
) -> Map<String, Val> {

    let mut map: Map<String, Val> = Map::new(e);

    map.set(String::from_str(e, "product_id"), product_id.into_val(e));
    map.set(String::from_str(e, "serial_number"), serial_number.into_val(e));
    map.set(String::from_str(e, "manufacturer"), manufacturer.into_val(e));
    map.set(String::from_str(e, "created_at"), created_at.into_val(e));
    map.set(String::from_str(e, "current_status"), current_status.into_val(e));
    map.set(String::from_str(e, "current_location"), current_location.into_val(e));

    map
}

// Convert Map<String, Val> back into product struct fields
fn map_to_product(
    e: &Env,
    map: Map<String, Val>
) -> (String, String, Address, u64, u32, String) {

    let product_id: String = map
        .get(String::from_str(e, "product_id"))
        .unwrap()
        .try_into_val(e)
        .unwrap();

    let serial_number: String = map
        .get(String::from_str(e, "serial_number"))
        .unwrap()
        .try_into_val(e)
        .unwrap();

    let manufacturer: Address = map
        .get(String::from_str(e, "manufacturer"))
        .unwrap()
        .try_into_val(e)
        .unwrap();

    let created_at: u64 = map
        .get(String::from_str(e, "created_at"))
        .unwrap()
        .try_into_val(e)
        .unwrap();

    let current_status: u32 = map
        .get(String::from_str(e, "current_status"))
        .unwrap()
        .try_into_val(e)
        .unwrap();

    let current_location: String = map
        .get(String::from_str(e, "current_location"))
        .unwrap()
        .try_into_val(e)
        .unwrap();

    (
        product_id,
        serial_number,
        manufacturer,
        created_at,
        current_status,
        current_location,
    )
}

// Convert step data into map
fn step_to_map(
    e: &Env,
    step_id: u32,
    product_id: String,
    step_type: u32,
    location: String,
    responsible_party: Address,
    tracking_number: Option<String>,
    timestamp: u64,
    metadata: Map<String, String>
) -> Map<String, Val> {

    let mut map: Map<String, Val> = Map::new(e);

    map.set(String::from_str(e, "step_id"), step_id.into_val(e));
    map.set(String::from_str(e, "product_id"), product_id.into_val(e));
    map.set(String::from_str(e, "step_type"), step_type.into_val(e));
    map.set(String::from_str(e, "location"), location.into_val(e));
    map.set(String::from_str(e, "responsible_party"), responsible_party.into_val(e));

    if let Some(tn) = tracking_number {
        map.set(String::from_str(e, "tracking_number"), tn.into_val(e));
    }

    map.set(String::from_str(e, "timestamp"), timestamp.into_val(e));

    // Metadata stored as inner map
    let mut meta_map: Map<String, Val> = Map::new(e);
    for (k, v) in metadata.iter() {
        meta_map.set(k.clone(), v.clone().into_val(e));
    }

    map.set(String::from_str(e, "metadata"), meta_map.into_val(e));
    map
}

#[contract]
pub struct Token;

#[contractimpl]
impl Token {

    // Initialize: Set admin + token metadata
    pub fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        e.storage()
            .instance()
            .set(&ADMIN_KEY, &admin);

        e.storage()
            .instance()
            .set(
                &META_KEY,
                &TokenMetadata {
                    decimal,
                    name,
                    symbol,
                }
            );
    }

    // Mint tokens
    pub fn mint(e: Env, to: Address, amount: i128) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();

        let mut balance: i128 = e.storage().instance().get(&to).unwrap_or(0);
        balance += amount;

        e.storage().instance().set(&to, &balance);

        TokenUtils::new(&e).events().mint(admin, to, amount);
    }

    // Transfer tokens
    pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let mut from_balance: i128 = e.storage().instance().get(&from).unwrap_or(0);
        let mut to_balance: i128 = e.storage().instance().get(&to).unwrap_or(0);

        if from_balance < amount {
            panic!("Yetersiz bakiye");
        }

        from_balance -= amount;
        to_balance += amount;

        e.storage().instance().set(&from, &from_balance);
        e.storage().instance().set(&to, &to_balance);

        TokenUtils::new(&e).events().transfer(from, to, amount);
    }

    /// Allow a role-holder (Manufacturer) to mint tokens by authorizing their own address.
    /// This provides a non-admin mint path for manufacturers.
    pub fn mint_by_role(e: Env, minter: Address, to: Address, amount: i128) {
        // Check that minter holds Manufacturer role
        let role = Self::get_role(e.clone(), minter.clone());
        if role != Role::Manufacturer as u32 {
            panic!("minter does not hold Manufacturer role");
        }
        // Require minter auth
        minter.require_auth();

        let mut balance: i128 = e.storage().instance().get(&to).unwrap_or(0);
        balance += amount;
        e.storage().instance().set(&to, &balance);

        TokenUtils::new(&e).events().mint(minter, to, amount);
    }

    /// Allow an operator with an appropriate role (Shipper or Warehouse) to move tokens on behalf of `from`.
    /// Operator must be authorized and hold Shipper or Warehouse role.
    pub fn operator_transfer(e: Env, operator: Address, from: Address, to: Address, amount: i128) {
        let role = Self::get_role(e.clone(), operator.clone());
        if role != Role::Shipper as u32 && role != Role::Warehouse as u32 {
            panic!("operator does not have permission to transfer");
        }
        operator.require_auth();

        let mut from_balance: i128 = e.storage().instance().get(&from).unwrap_or(0);
        let mut to_balance: i128 = e.storage().instance().get(&to).unwrap_or(0);

        if from_balance < amount {
            panic!("Yetersiz bakiye");
        }

        from_balance -= amount;
        to_balance += amount;

        e.storage().instance().set(&from, &from_balance);
        e.storage().instance().set(&to, &to_balance);

        TokenUtils::new(&e).events().transfer(from, to, amount);
    }

    // Get balance of an address
    pub fn balance(e: Env, id: Address) -> i128 {
        e.storage().instance().get(&id).unwrap_or(0)
    }
}

// ======================
// ROLE MANAGEMENT
// ======================
impl Token {

    /// Admin assigns a role to an address
    pub fn grant_role(e: Env, addr: Address, role: u32) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();

        let mut roles: Map<Address, u32> = e
            .storage()
            .instance()
            .get(&ROLE_KEY)
            .unwrap_or(Map::new(&e));

        roles.set(addr, role);
        e.storage().instance().set(&ROLE_KEY, &roles);
    }

    /// Admin revokes role (set to Role::None)
    pub fn revoke_role(e: Env, addr: Address) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();

        let mut roles: Map<Address, u32> = e
            .storage()
            .instance()
            .get(&ROLE_KEY)
            .unwrap_or(Map::new(&e));

        roles.set(addr, Role::None as u32);
        e.storage().instance().set(&ROLE_KEY, &roles);
    }

    /// Returns numeric role of address (0 == None)
    pub fn get_role(e: Env, addr: Address) -> u32 {
        let roles: Map<Address, u32> = e
            .storage()
            .instance()
            .get(&ROLE_KEY)
            .unwrap_or(Map::new(&e));

        if roles.get(addr.clone()).is_none() {
            return Role::None as u32;
        }

    /// Set admin public key (store as String). Only admin can call.
    pub fn set_admin_pubkey(e: Env, pubkey: String) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
        e.storage().instance().set(&ADMIN_PUBKEY_KEY, &pubkey);
    }

    /// Get admin public key (returns empty string if not set)
    pub fn get_admin_pubkey(e: Env) -> String {
        e.storage()
            .instance()
            .get(&ADMIN_PUBKEY_KEY)
            .unwrap_or(String::from_str(&e, ""))
    }

    /// Generic key/value setter stored on-chain. Only admin can set keys.
    pub fn set_key(e: Env, key: String, val: String) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();

        let mut keymap: Map<String, String> = e
            .storage()
            .instance()
            .get(&KEYMAP_KEY)
            .unwrap_or(Map::new(&e));

        keymap.set(key, val);
        e.storage().instance().set(&KEYMAP_KEY, &keymap);
    }

    /// Generic key/value getter. Returns empty string if not set.
    pub fn get_key(e: Env, key: String) -> String {
        let keymap: Map<String, String> = e
            .storage()
            .instance()
            .get(&KEYMAP_KEY)
            .unwrap_or(Map::new(&e));

        if keymap.get(key.clone()).is_none() {
            return String::from_str(&e, "");
        }

        keymap
            .get(key)
            .unwrap()
            .try_into_val(&e)
            .unwrap_or(String::from_str(&e, ""))
    }

        roles
            .get(addr)
            .unwrap()
            .try_into_val(&e)
            .unwrap_or(Role::None as u32)
    }

    /// Requires:
    /// - target address has required role  → then that address must sign
    /// - OR admin must sign the call
    fn require_role_or_admin(e: Env, addr: Address, required_role: u32) {
        let addr_role = Self::get_role(e.clone(), addr.clone());

        // If caller holds required role → require their auth
        if addr_role == required_role {
            addr.require_auth();
            return;
        }

        // Otherwise admin must sign
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
    }
}

// ===========================
// SUPPLY CHAIN FUNCTIONS
// ===========================
impl Token {

    /// Create a new product on chain
    pub fn create_product(
        e: Env,
        product_id: String,
        serial_number: String,
        manufacturer: Address,
        location: String
    ) {
        // Manufacturer (or Admin) must authorize
        Self::require_role_or_admin(
            e.clone(),
            manufacturer.clone(),
            Role::Manufacturer as u32,
        );

        // Load existing product list
        let products: Map<String, Val> = e
            .storage()
            .instance()
            .get(&PRODUCTS_KEY)
            .unwrap_or(Map::new(&e));

        // Check if product already exists
        if products.contains_key(product_id.clone()) {
            panic!("Ürün zaten mevcut");
        }

        let current_time = e.ledger().timestamp();

        // Convert product into a storable map
        let product_map = product_to_map(
            &e,
            product_id.clone(),
            serial_number,
            manufacturer.clone(),
            current_time,
            ProductStatus::Production as u32,
            location.clone(),
        );

        // Write product map to storage
        let mut products_storage: Map<String, Val> = products;
        products_storage.set(product_id.clone(), product_map.into_val(&e));
        e.storage().instance().set(&PRODUCTS_KEY, &products_storage);

        // --- Now handle product steps history ---

        let steps: Map<String, Val> = e
            .storage()
            .instance()
            .get(&STEPS_KEY)
            .unwrap_or(Map::new(&e));

        let product_steps_val = steps.get(product_id.clone());
        let mut product_steps: Vec<Map<String, Val>> = if product_steps_val.is_some() {
            product_steps_val
                .unwrap()
                .try_into_val(&e)
                .unwrap()
        } else {
            Vec::new(&e)
        };

        // Create first step
        let first_step_map = step_to_map(
            &e,
            0,
            product_id.clone(),
            StepType::Production as u32,
            location.clone(),
            manufacturer,
            None,
            current_time,
            Map::new(&e),
        );

        product_steps.push_back(first_step_map);

        // Save steps to storage
        let mut steps_storage: Map<String, Val> = steps;
        steps_storage.set(product_id, product_steps.into_val(&e));
        e.storage().instance().set(&STEPS_KEY, &steps_storage);
    }

    /// Add a new tracking step to the product supply chain
    pub fn add_step(
        e: Env,
        product_id: String,
        step_type: u32,
        location: String,
        responsible_party: Address,
        tracking_number: Option<String>,
        metadata: Map<String, String>
    ) {
        // Role rules for steps
        let required_role = if step_type == StepType::Production as u32 {
            Role::Manufacturer as u32
        } else if step_type == StepType::Shipping as u32
            || step_type == StepType::Transit as u32 {
            Role::Shipper as u32
        } else if step_type == StepType::Delivery as u32 {
            Role::Warehouse as u32
        } else {
            Role::None as u32
        };

        // Authorization logic
        if required_role != Role::None as u32 {
            Self::require_role_or_admin(
                e.clone(),
                responsible_party.clone(),
                required_role,
            );
        } else {
            responsible_party.require_auth();
        }

        // Load product storage
        let products: Map<String, Val> = e
            .storage()
            .instance()
            .get(&PRODUCTS_KEY)
            .unwrap_or(Map::new(&e));

        let product_val = products
            .get(product_id.clone())
            .unwrap_or_else(|| panic!("Ürün bulunamadı"));

        let product_map: Map<String, Val> = product_val.try_into_val(&e).unwrap();

        let (pid, serial_number, manufacturer, created_at, _, _) =
            map_to_product(&e, product_map.clone());

        // Load steps storage
        let steps: Map<String, Val> = e
            .storage()
            .instance()
            .get(&STEPS_KEY)
            .unwrap_or(Map::new(&e));

        let raw_steps = steps
            .get(product_id.clone())
            .unwrap_or_else(|| panic!("Ürün adımları bulunamadı"));

        let mut product_steps: Vec<Map<String, Val>> =
            raw_steps.try_into_val(&e).unwrap();

        // New step
        let step_id = product_steps.len() as u32;
        let current_time = e.ledger().timestamp();

        let new_step_map = step_to_map(
            &e,
            step_id,
            product_id.clone(),
            step_type,
            location.clone(),
            responsible_party,
            tracking_number,
            current_time,
            metadata,
        );

        product_steps.push_back(new_step_map);

        // Update product status/location
        let updated_product = product_to_map(
            &e,
            pid.clone(),
            serial_number,
            manufacturer,
            created_at,
            step_type,
            location.clone(),
        );

        let mut products_storage: Map<String, Val> = products;
        products_storage.set(product_id.clone(), updated_product.into_val(&e));

        let mut steps_storage: Map<String, Val> = steps;
        steps_storage.set(product_id.clone(), product_steps.into_val(&e));

        // Save both
        e.storage().instance().set(&PRODUCTS_KEY, &products_storage);
        e.storage().instance().set(&STEPS_KEY, &steps_storage);
    }
}

// ===========================
// GETTERS (READ FUNCTIONS)
// ===========================
impl Token {

    /// Returns latest product info
    pub fn get_product(e: Env, product_id: String) -> Map<String, Val> {
        let products: Map<String, Val> = e
            .storage()
            .instance()
            .get(&PRODUCTS_KEY)
            .unwrap_or(Map::new(&e));

        let product_val = products
            .get(product_id.clone())
            .unwrap_or_else(|| panic!("Ürün bulunamadı"));

        product_val.try_into_val(&e).unwrap()
    }

    /// Returns full step history for product
    pub fn get_product_history(
        e: Env,
        product_id: String,
    ) -> Vec<Map<String, Val>> {
        let steps: Map<String, Val> = e
            .storage()
            .instance()
            .get(&STEPS_KEY)
            .unwrap_or(Map::new(&e));

        let raw_steps = steps
            .get(product_id.clone())
            .unwrap_or_else(|| panic!("Ürün adımları bulunamadı"));

        raw_steps.try_into_val(&e).unwrap()
    }

    /// Returns product's current status (as integer)
    pub fn get_current_status(e: Env, product_id: String) -> u32 {
        let product = Self::get_product(e.clone(), product_id);

        let ( _pid, _serial, _manufacturer, _created_at, status, _location )
            = map_to_product(&e, product);

        status
    }
}
