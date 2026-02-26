# ⚡ StellarSpark: Crowdfunding DApp

StellarSpark is a production-ready, decentralized crowdfunding platform built on the **Stellar Network** using **Soroban** smart contracts. It empowers users to fund campaigns securely and transparently using multiple wallet providers.

<p align="center">
  <!-- TODO: Replace the placeholder below with the actual URL to your screenshot -->
  <img src="https://via.placeholder.com/800x450.png?text=Insert+Project+Screenshot+Here" alt="StellarSpark Hero Screenshot" />
</p>

## ✨ Features

- **Multi-wallet Authentication:** Users can seamlessly connect using native Stellar wallets like **Freighter** and **Albedo**, or through mobile wallets via **Reown WalletConnect**.
- **Soroban Smart Contract:** Core crowdfunding logic (goal setting, deadlines, total funds raised) runs entirely on-chain.
- **Real-Time Progress Tracking:** The UI instantly translates smart contract state into a dynamic progress bar for the crowdfunding goal.
- **Live Activity Feed:** Streams recent donation events in real-time right into the user interface.
- **Robust Error Handling:** Elegantly handles three common error scenarios:
  1. No Wallet Connected (Prompts login).
  2. Invalid Input (Prevents empty or negative donations).
  3. Connection Rejected / Insufficient Funds (Catches contract or wallet popup rejections without crashing).
- **Premium UI/UX:** Built using a custom Glassmorphism design system featuring dynamic micro-animations and glowing accent colors.

## 🛠️ Technology Stack

### Frontend
- **React.js & Vite:** Fast, modern frontend framework and build tool.
- **Vanilla CSS:** Custom Glassmorphism styles, CSS variables for dark mode, and dynamic media queries (no bulky UI libraries).
- **@creit.tech/stellar-wallets-kit:** V2 integration for generalized multi-wallet access (Freighter, Albedo, WalletConnect).
- **Stellar SDK:** To encode, build, and sign transactions destined for the Stellar Horizon testnet.

### Backend / Smart Contract
- **Soroban (Rust):** The official smart contract platform for Stellar.
- **Stellar Testnet:** The network used for deploying the contract and routing transactions.

<p align="center">
  <!-- TODO: Optional second screenshot showing the wallet popup or donation success state -->
<img width="1169" height="830" alt="Screenshot 2026-02-26 124947" src="https://github.com/user-attachments/assets/78e27af9-6b59-4c03-b4d5-288c287ef542" />


## 🚀 Getting Started

Follow these steps to run the DApp locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (for editing/compiling the smart contract)
- A Stellar wallet extension installed in your browser (e.g., [Freighter](https://www.freighter.app/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ggdeshmukh12107-droid/StellarSpark-DApp.git
   cd StellarSpark-DApp
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` with your browser to see the result.

### Wallet Setup
To interact with the app, ensure your Freighter wallet is set to the **Testnet** and has been funded via the Stellar Friendbot.

## 📂 Project Structure

```text
StellarSpark-DApp/
├── contracts/               # Soroban Smart Contract source code
│   ├── src/                 
│   │   └── lib.rs           # Core crowdfunding logic (Rust)
│   └── Cargo.toml           # Contract dependencies
├── src/                     # React Frontend
│   ├── App.jsx              # Main DApp logic, UI components, and state management
│   ├── index.css            # Glassmorphism design system styles
│   └── main.jsx             # React entry point
└── package.json             # Node dependencies
```

## 📜 Smart Contract Details

The Soroban contract (`contracts/src/lib.rs`) includes the following core functionalities:
- `initialize`: Sets the funding goal and the deadline timestamp.
- `donate`: Allows users to contribute XLM to the campaign, ensuring the deadline hasn't passed.
- `get_status`: Returns a struct containing the current funds raised versus the target goal.
- **Events:** Emits a `donation` event every time a user successfully contributes, which can be picked up by the frontend.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/ggdeshmukh12107-droid/StellarSpark-DApp/issues).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
