# TrustID India — Setup & Installation Guide

This guide walks you through setting up, configuring, and launching the complete TrustID India platform on a local workstation.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js:** v18.0.0 or later (v20+ or v24+ recommended)
- **npm:** v9.0.0 or later
- **Git:** v2.30+
- **Browser:** Google Chrome, Brave, Edge, or Firefox (with MetaMask extension installed if testing live wallet transactions, or use the built-in simulator).

---

## 2. Quick Installation

From the project root directory (`d:\TY\BT\BT PPT`):

```bash
# 1. Install contract dependencies
cd contracts && npm install && cd ..

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

---

## 3. Running the System (4 Terminal Sessions)

### Terminal 1: Start the Local EVM Blockchain
Starts an in-memory Ethereum JSON-RPC blockchain on port `8545` with 20 funded test accounts:
```bash
cd contracts
npx hardhat node
```
*Leave this terminal running. The RPC URL will be `http://127.0.0.1:8545` with Chain ID `31337`.*

---

### Terminal 2: Deploy Smart Contracts & Seed Initial Issuers
Deploys `IssuerRegistry.sol` and `CredentialStatusRegistry.sol`, seeds default demo universities, and exports contract addresses to the backend and frontend:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

You should see:
```text
✓ IssuerRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✓ CredentialStatusRegistry deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✓ Registered Issuer: IIT Bombay (0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
✓ Registered Issuer: NIT Karnataka (0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC)
✓ Exported deployment config to backend & frontend!
```

---

### Terminal 3: Start the Backend API Service
Starts the Express TypeScript backend on port `5000`:
```bash
cd backend
npm run dev
```

The backend logs:
```text
TrustID India Backend Service Running
Port: 5000
RPC Endpoint: http://127.0.0.1:8545
W3C VC 2.0 Compliance: ENABLED
```

---

### Terminal 4: Start the Frontend Application
Starts the Vite React developer server on port `5173`:
```bash
cd frontend
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:5173
```

---

## 4. Configuring MetaMask for Local Hardhat (Optional)

If you wish to test live MetaMask transactions instead of using the built-in simulator:

1. Open your MetaMask browser extension.
2. Click on the Network selector $\rightarrow$ **"Add network"** $\rightarrow$ **"Add a network manually"**.
3. Enter the following parameters:
   - **Network name:** `Hardhat Localhost`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency symbol:** `ETH`
4. Click **Save** and switch to `Hardhat Localhost`.
5. Import a test account into MetaMask using one of the pre-funded Hardhat private keys:
   - **University Issuer Account #1:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - **Governance Admin Account #0:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 5. Running Automated Tests

### Run Smart Contract Tests (12 Tests)
Tests access control, issuer authorization, revocation, duplicate checks, and governance:
```bash
cd contracts
npm test
```

### Run Backend Credential Tests (8 Tests)
Tests cryptographic signing, RFC 8785 canonicalization, tamper detection, expired credentials, and verifier policies:
```bash
cd backend
npm test
```

### Run All Tests from Root
```bash
npm test
```
