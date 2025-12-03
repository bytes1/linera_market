# True Markets

**True Markets**  is a modern, decentralized prediction market platform built on the Linera blockchain. It provides a comprehensive suite of tools for creating markets, trading prediction shares, and engaging with decentralized forecasting using an Automated Market Maker (AMM) model.

## 📖 Introduction

True Markets leverages the **Linera** microchain architecture to ensure permissionless market creation and transparent price discovery. Anyone can participate, trade, and resolve markets without intermediaries. The platform features AI-powered insights, real-time trading, and decentralized settlement mechanisms.

## ✨ Key Features

* **Permissionless Markets:** Create prediction markets on any topic without approval from centralized authorities.
* **Automated Liquidity:** Built-in Automated Market Maker (AMM) ensures constant liquidity for all markets, enabling instant trades.
* **AI-Powered Insights:** Integrated AI assistant (TrueBot) provides intelligent market analysis and predictions.
* **Real-Time Trading:** Trade prediction shares with instant settlement and transparent pricing.
* **Decentralized Settlement:** Smart contract-based resolution ensures fair and transparent settlement.
* **Portfolio Management:** Track positions, analyze performance, and manage your prediction market portfolio.

## 🛠 Tech Stack

### Blockchain & Contracts
* **Framework:** [Linera SDK](https://linera.io/) (Rust)
* **Smart Contracts:** Rust (Wasm)
* **Architecture:** Linera Microchains (Infinite Scalability)

### Frontend
* **Framework:** Next.js 16
* **Language:** TypeScript / React 19
* **Styling:** Tailwind CSS, shadcn/ui
* **Client SDK:** `@linera/client` & `@linera/signer`
* **AI Integration:** Vercel AI SDK (Google Gemini)

## 📂 Project Structure

```text
.
├── contracts/               # Linera Smart Contracts (Rust)
│   ├── truemarket/          # Main prediction market application
│   │   ├── src/lib.rs       # GraphQL/Abi definitions (CreateMarket, Buy)
│   │   ├── src/contract.rs  # Main contract logic (State changes)
│   │   └── src/service.rs   # Read-only queries (MarketView, MyShares)
│   └── my-fungible/         # Token standard used for wagering
│
└── frontend/                # Next.js Web Application
    ├── app/                 # App router pages
    ├── components/          # React components (MarketCard, Charts)
    ├── lib/                 # Utilities and Linera client setup
    └── content/docs/        # Documentation files (MDX)