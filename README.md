# True Markets

**True Markets** is a decentralized prediction market platform built on the **Linera** blockchain. It currently operates as a single-chain application where all participants interact with a centralized market state, with plans to evolve into a fully decentralized microchain architecture.

## 🚧 Current Status (MVP)

* **Architecture:** Client-Server model on a single Linera chain. All users interact with one main application chain.
* **Wallet:** **MetaMask** integration.
* **Active Features:** Market Creation, **Buy Shares**.
* **Upcoming Features:** Sell Shares, Market Resolution, Claim Winnings, Multi-chain scaling (One chain per market).

## 📖 Introduction

True Markets allows users to trade on future outcomes using an Automated Market Maker (AMM). While currently running on a simplified single-chain architecture for testing, the platform utilizes Linera's low-latency execution to provide a seamless trading experience.

## ✨ Key Features

* **Permissionless Markets:** Create prediction markets on any topic.
* **Automated Liquidity:** AMM-based pricing ensures you can always buy shares.
* **AI-Powered Insights:** Integrated AI assistant (TrueBot) for market analysis.
* **MetaMask Integration:** seamless login and signing using your existing Web3 wallet.

## 🛠 Tech Stack

### Blockchain & Contracts
* **Framework:** [Linera SDK](https://linera.io/) (Rust)
* **Smart Contracts:** Rust (Wasm)
* **Current Topology:** Single-chain (MVP)

### Frontend
* **Framework:** Next.js 16
* **Language:** TypeScript / React 19
* **Wallet:** MetaMask (via specialized Linera adapter)
* **AI:** Vercel AI SDK (Google Gemini)

## 📂 Project Structure

```text
.
├── contracts/               # Linera Smart Contracts
│   ├── truemarket/          # Core logic (currently handles Create & Buy)
│   └── my-fungible/         # Token standard
│
└── frontend/                # Next.js Web Application
    ├── lib/                 # MetaMask & Linera connection logic
    └── content/docs/        # Documentation