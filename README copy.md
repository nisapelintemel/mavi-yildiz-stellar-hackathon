# AquaRunnel: Smart Agriculture & Token Support Platform

AquaRunnel is an innovative web platform that merges blockchain technology with real-time weather data to promote and reward sustainable agricultural practices. 
By leveraging a Soroban smart contract on the Stellar testnet, 
AquaRunnel enables farmers to make informed decisions based on localized weather forecasts, earn AquaTokens for correctly timed farming activities,
and support fellow farmers through token transfers.

---

## 🌱 Key Features

* **Real-Time Agricultural Recommendations:**

  * Farmers select their city and crop type to receive tailored guidance on optimal farming actions.
  * Recommendations incorporate current and forecasted weather data (e.g., “Wheat is ideal in Konya this week, but water conservation remains crucial”).

* **Weather-Based Action Tracking:**

  * When a farmer executes a recommended action at the right time (e.g., harvesting during dry conditions), AquaRunnel detects and rewards the activity.
  * Actions include fertilization, irrigation, planting, and harvesting, each with specific eligibility criteria based on weather patterns.

* **AquaToken Economy:**

  * Farmers earn **10 AquaTokens** for each correctly timed action, incentivizing eco-friendly practices (e.g., fertilize right before expected rainfall).
  * AquaTokens can be transferred to other farmers as community support or saved for future benefits within the platform’s ecosystem.

* **Farmer Support Panel:**

  * A dedicated UI component allows users to send AquaTokens directly to other farmers’ wallets, fostering collaboration and mutual assistance.
  * Farmers in need of resources or guidance can receive tokens from experienced peers.

* **Freighter Wallet Integration:**

  * Seamless connection with the Freighter browser extension for Stellar wallets enables secure transactions on the testnet.
  * Users connect their Freighter wallet, and backend operations handle minting and transfers via Soroban CLI.
  * **Smart Contract ID:** 

* **Frontend & Backend Architecture:**

  * **Frontend:** Built with Next.js, Tailwind CSS, and Shadcn UI for a responsive and farmer-friendly interface.
  * **Backend:** Node.js (Express) serves API endpoints that internally invoke Soroban CLI commands to mint and transfer tokens on Stellar testnet.
  * Decoupled design ensures maintainability and ease of deployment.

---

## 📂 Project Structure

```
├── frontend           # Next.js application (UI layer)
│   ├── components     # Reusable React components (WeatherPanel, RewardCenter, etc.)
│   ├── lib            # Business logic, API wrappers, config (weather-service, wallet)
│   ├── pages          # Routes: home page, weather page, API routes under /api
│   └── public         # Static assets (icons, images)
└── backend            # Express.js server (API layer)
    ├── index.js       # Main entry point, sets up routes and middleware
    ├── routes         # API route handlers: mint-reward, transfer, balance
    ├── soroban        # soroban.js: functions that invoke Soroban CLI to mint/transfer/balance
    └── .env           # Environment variables: contract ID, secrets, network config
└── stellar-contract   # Rust-based Soroban token contract
    ├── src/contract.rs   # Token contract implementation: initialize, mint, transfer, balance
    ├── Cargo.toml        # Build configuration for the contract
    └── test/             # Rust unit tests for contract functionality
```

---

## 🔧 Setup & Running

### 1. Prerequisites

* **Node.js & npm** (v14+)
* **Rust & Cargo** (for Soroban CLI)
* **Soroban CLI** (v20.0.0-rc.3 or newer)
* **Freighter Browser Extension** (for Stellar wallets)

### 2. Clone the Repository

```bash
git clone https://github.com/suarksoft/rustdevelop.git
git checkout main
```

### 3. Environment Configuration

#### Frontend: `.env.local` (at `frontend/`)

\`\`\`

# Use a valid OpenWeather API key for live weather data

NEXT_PUBLIC_OPENWEATHER_API_KEY=a94...

# Use True to test with mock data

NEXT_PUBLIC_USE_MOCK=false


* NEXT_PUBLIC_OPENWEATHER_API_KEY: Obtain from [OpenWeather](https://openweathermap.org/api).
* NEXT_PUBLIC_USE_MOCK: Set to `true` to bypass real API calls and use predefined mock data.

#### Backend: `.env` (at `backend/`)



# Admin account secret for Soroban contract operations

ADMIN_SECRET=SBBLSBDPAAWFMT5TQMGROUMEDAZ77X5WXVUWWOZWKMFQHMRC3NNEE3QS

# Deployed contract ID on Stellar testnet

CONTRACT_ID=CBUFRFE3BHY527RPOCTUJMIJKADW7CSJ4DSH5CHQRLRFYEE3XFRDZ6DL

# Soroban network settings

SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
ADMIN_ALIAS=admin
CONTRACT_ALIAS=token
STELLAR_NETWORK=testnet


* ADMIN_SECRET: The secret key of the admin/Stellar account that has permission to mint tokens.
* CONTRACT_ID: The unique ID of the Soroban token contract deployed on testnet.
* SOROBAN_RPC_URL and SOROBAN_NETWORK_PASSPHRASE: Testnet configuration for Soroban CLI.
* ADMIN_ALIAS / CONTRACT_ALIAS: Used by Soroban CLI to identify key aliases and contract alias (mapped in `~/.config/stellar/identity`).

### 4. Installing Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

### 5. Running the Applications

#### Start Frontend (Next.js)

```bash
cd frontend
npm run dev
# Serves at http://localhost:3000
```

#### Start Backend (Express.js)

```bash
cd backend
node index.js
# Serves API at http://localhost:4000
```

### 6. Soroban CLI & Contract Deployment (Optional)

> **Note:** Contract is already deployed. Use the following commands to set up your admin key locally and verify deployment:

```bash
# 1. Install Soroban CLI
cargo install --locked --version 20.0.0-rc.3 soroban-cli

# 2. Create a new key for admin if not already in your local identity
soroban keys generate --name admin --secret-key SBBLSBDPAAW... (admin secret)

# 3. Verify contract deployment on testnet
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network-passphrase "Test SDF Network ; September 2015" \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  -- balance --id [WALLET_PUBLIC_KEY]  # Should return initial balance (0 or minted value)
```

---

## 🌍 User Flow

1. **Connect Wallet:** Click “Connect Wallet” and approve via Freighter extension.
2. **Select City & Crop:** Choose your region and crop; recommendations display instantly.
3. **Perform Action:** Follow suggested timing (e.g., fertilize before predicted rain). Click “I Did It” to record your action.
4. **Earn Tokens:** If action meets criteria, the backend mints AquaTokens to your wallet and balance updates.
5. **View & Send Tokens:** Check your token balance in the TokenPanel. Use the “Support Farmer” panel to transfer tokens to peers.
6. **Track History:** View past farming actions and success rates in the RewardHistory section.

---

## ⚙️ API Endpoints (Backend)

All endpoints are under `http://localhost:4000/api`:

* **POST /mint-reward**

  * **Description:** Mint AquaTokens to a user’s wallet when they complete a valid action.
  * **Request Body:** `{ "wallet": "<PUBLIC_KEY>", "amount": <integer> }`
  * **Response:** `{ "success": true, "tx": "<TRANSACTION_DETAILS>" }` or `{ "success": false, "error": "<ERROR_MESSAGE>" }`

* **POST /transfer**

  * **Description:** Transfer AquaTokens from one user to another to support farmers.
  * **Request Body:** `{ "fromWallet": "<SENDER_PUBLIC_KEY>", "toWallet": "<RECIPIENT_PUBLIC_KEY>", "amount": <integer> }`
  * **Response:** `{ "success": true, "tx": "<TRANSACTION_DETAILS>" }` or `{ "success": false, "error": "<ERROR_MESSAGE>" }`

* **GET /balance/\:wallet**

  * **Description:** Retrieve the current AquaToken balance of the specified wallet.
  * **URL Params:** `wallet` = `<PUBLIC_KEY>`
  * **Response:** `{ "success": true, "balance": <number> }` or `{ "success": false, "error": "<ERROR_MESSAGE>" }`

---

## 🤖 Smart Contract Functions (Soroban)

* **initialize(admin: Address, decimal: u32, name: String, symbol: String)**

  * Sets admin address and token metadata (decimal places, name, symbol).

* **mint(to: Address, amount: i128)**

  * Mints `amount` of tokens to `to`. Only callable by admin.

* **transfer(from: Address, to: Address, amount: i128)**

  * Transfers `amount` from `from` to `to`. `from` must authorize.

* **balance(id: Address) -> i128**

  * Returns the token balance of the given address.

---

## 👨‍💻 Developer Information

* **Author:** [Ahmet Buğra Kurnaz](https://www.linkedin.com/in/bu%C4%9Fra-kurnaz-692918301/)
* **Tech Stack:**
 
  * **Frontend:** Next.js, React, Tailwind CSS, Shadcn UI, Lucide icons
  * **Backend:** Node.js, Express.js, Child Process (exec) to interact with Soroban CLI
  * **Smart Contract:** Rust, Soroban SDK
  * **Blockchain:** Stellar Testnet, Soroban smart contracts, Freighter for wallet integration

---

## 🎯 Hackathon Highlights

* **Fully Functional MVP:** End-to-end integration demonstrates token minting and transfers on Stellar testnet.
* **User-Centric Design:** Intuitive, mobile-responsive UI tailored for farmers.
* **Sustainability Focus:** Aligns with green agriculture initiatives by incentivizing correct farming practices.
* **Community Support:** Farmer Support Panel enables peer-to-peer token transfers, enhancing solidarity.

---

## 🛣️ Roadmap & Future Enhancements

1. **External Data Integration:** Incorporate satellite imagery and soil-moisture sensors for more precise recommendations.
2. **Mobile App Development:** Build native or hybrid mobile app to increase accessibility in rural areas.
3. **Token Staking & Pools:** Introduce staking pools and yield farming features to reward long-term token holders.
4. **Multi-Language Support:** Add localization for Turkish, English, and other major languages.
5. **Governance & DAO:** Enable token holders to vote on platform updates and new features.


