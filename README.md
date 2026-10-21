# TrustID India — Blockchain-Assisted Self-Sovereign Identity and Verifiable Credential Verification Platform

> **Your Credentials. Your Control. Independently Verifiable.**  
> *A university Blockchain Technologies assessment project demonstrating Self-Sovereign Identity (SSI), W3C Verifiable Credentials 2.0, applied cryptography, and decentralized trust registries.*

---

## 1. Project Overview

**TrustID India** is a complete, working, professional web application demonstrating how an accredited university can issue a cryptographically signed academic credential, how a student can hold that credential in a private self-sovereign digital wallet off-chain, and how a third-party verifier (such as a scholarship provider or employer) can independently verify the credential's cryptographic signature, issuer accreditation, and real-time revocation status using smart contracts on an EVM blockchain.

---

## 2. Problem Statement

In traditional educational and hiring systems:
1. **Trivial PDF Forgery:** Scanned certificates, marksheets, and PDF diplomas can be altered in minutes using common graphic software.
2. **Slow, Costly Verification:** Background check agencies and employers must email or call university registrars, pay manual administrative fees, and wait weeks for physical verification letters.
3. **Repeated Document Submission:** Students repeatedly upload full marksheets containing sensitive personal identifiers (Aadhaar, date of birth, family names) to hundreds of job portals, causing catastrophic privacy exposure and identity theft risks.
4. **Centralized Single Points of Failure:** Centralized databases are susceptible to downtime, data breaches, and institutional insolvency.

---

## 3. Project Objectives

- Implement an end-to-end W3C Verifiable Credentials Data Model 2.0 workflow.
- Demonstrate cryptographic signing and signature verification using deterministic RFC 8785 JSON Canonicalization and ECDSA Secp256k1 recovery.
- Deploy Solidity smart contracts (`IssuerRegistry.sol` and `CredentialStatusRegistry.sol`) on a local EVM blockchain.
- Guarantee that personal student claims (PII) remain strictly off-chain while utilizing blockchain solely for trust accreditation and $O(1)$ revocation checks.
- Demonstrate that a modified/tampered credential mathematically fails cryptographic verification.
- Demonstrate that an on-chain revoked credential fails verification even while its cryptographic signature remains intact.

---

## 4. Architecture

TrustID India implements the classic **Self-Sovereign Identity Trust Triangle**:

```text
                  +-------------------------------+
                  |      UNIVERSITY / ISSUER      |
                  | • Accredited on blockchain    |
                  | • Signs W3C VC with private key|
                  +---------------+---------------+
                                  |
                                  | 1. Issues & signs credential
                                  |    (off-chain delivery)
                                  v
                  +-------------------------------+
                  |       STUDENT / HOLDER        |
                  | • Holds VC in local wallet    |
                  | • Exercises sovereign custody |
                  +---------------+---------------+
                                  |
                                  | 2. Presents credential
                                  |    (off-chain delivery)
                                  v
                  +-------------------------------+
                  |     SCHOLARSHIP / VERIFIER    |
                  | • Recovers issuer public key  |
                  | • Validates claims & expiry   |
                  +---------------+---------------+
                                  |
                                  | 3. Queries trust & status
                                  v
+-------------------------------------------------------------------+
|               DECENTRALIZED TRUST REGISTRY LAYER                  |
|                 (Local EVM Blockchain - Hardhat)                  |
|                                                                   |
| • IssuerRegistry.sol: Resolves did:ethr -> Accredited University   |
| • CredentialStatusRegistry.sol: Tracks active/revoked status O(1) |
|                                                                   |
| * ZERO Personally Identifiable Information (PII) is on-chain!     |
+-------------------------------------------------------------------+
```

---

## 5. Technology Stack

- **Frontend:**
  - React 18, TypeScript, Vite
  - Tailwind CSS (no CDN dependencies)
  - Lucide React icons, React Router DOM
  - Ethers.js v6 for blockchain interactions
  - `canonicalize` (RFC 8785 deterministic JSON Canonicalization)
- **Blockchain Layer:**
  - Solidity `^0.8.24`
  - Hardhat EVM local development node (Chain ID `31337`)
  - OpenZeppelin Contracts `v5.0` (`Ownable`)
  - TypeChain for strongly typed contract bindings
- **Backend Service:**
  - Node.js, Express, TypeScript
  - Ethers.js v6 (ECDSA Secp256k1 signing & address recovery)
  - RFC 8785 JSON Canonicalization Scheme
  - UUID v4 for unique credential identifiers
- **Standards:**
  - W3C Verifiable Credentials Data Model 2.0
  - W3C Decentralized Identifiers (DIDs: `did:ethr` and `did:example`)
  - RFC 8785 JSON Canonicalization Scheme (JCS)

---

## 6. Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ or v24+ recommended)
- **npm:** v9.0.0 or higher
- **Git:** v2.30+
- **MetaMask Browser Extension:** (Optional for live wallet transactions, or use the built-in demo simulator)

---

## 7. Installation

Clone and install dependencies for all modules:

```bash
# 1. Install contract dependencies
cd contracts
npm install
cd ..

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 8. Environment Variables

Create a `.env` file in `backend/` using the template below:

```bash
cp .env.example backend/.env
```

Default values in `.env.example`:
```env
PORT=5000
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
GOVERNANCE_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEMO_ISSUER_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
DEMO_ISSUER_2_PRIVATE_KEY=0x5de4111afa1a4b94908f83103eb2f958084297f005d5c641d3e2392471010c78
```

---

## 9. Starting the Local Blockchain

Open Terminal 1 and launch the local Hardhat EVM node:

```bash
cd contracts
npx hardhat node
```
This starts an Ethereum JSON-RPC endpoint at `http://127.0.0.1:8545` with 20 pre-funded accounts.

---

## 10. Deploying Smart Contracts & Seeding Demo Issuers

Open Terminal 2 and run the deployment script:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

This deploys `IssuerRegistry.sol` and `CredentialStatusRegistry.sol`, registers initial universities (IIT Bombay and NIT Karnataka), and automatically exports deployed addresses and ABIs to `backend/src/config/contracts.json` and `frontend/src/config/contracts.json`.

---

## 11. Configuring MetaMask (Optional)

1. Open the MetaMask extension.
2. Select **Add Network** $\rightarrow$ **Add a network manually**.
3. Fill in:
   - **Network Name:** `Hardhat Localhost`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Import Hardhat test account #1: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`.

*Note: If MetaMask is not installed, TrustID India automatically operates in simulated local mode with pre-configured personas.*

---

## 12. Starting the Backend Service

Open Terminal 3:

```bash
cd backend
npm run dev
```
The API starts on `http://localhost:5000`.

---

## 13. Starting the Frontend Application

Open Terminal 4:

```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 14. Running Automated Tests

### Smart Contract Tests (12 Test Cases)
```bash
cd contracts
npm test
```
Tests cover:
- Institutional registration and duplicate prevention
- Access control (non-governor registration rejection)
- Issuer authorization toggling
- Unauthorized credential registration rejection
- Authorized credential registration
- Constant-time $O(1)$ credential status lookup
- Unauthorized revocation rejection
- Issuing university revocation and governor emergency revocation
- Automatic invalidation if issuer is de-authorized after issuance

### Backend & Credential Tests (8 Test Cases)
```bash
cd backend
npm test
```
Tests cover:
- W3C VC 2.0 cryptographic signing & address recovery
- RFC 8785 canonical digest computation
- Claim tampering detection (altering programme, name, or CGPA)
- Malformed credential rejection (structural validation)
- Untrusted issuer rejection
- Expired credential rejection
- Verifier policy claim validation (e.g. active enrollment requirement)
- End-to-end multi-check verification report generation

---

## 15. How to Issue a Credential

1. In the top navigation bar, select **Issuer**.
2. Verify that the current account is accredited (e.g., *Indian Institute of Technology Bombay*).
3. Complete the academic issuance form:
   - Student Name: `Aarav Sharma — DEMO`
   - Student ID: `BT-CS-2023-042`
   - Degree: `Bachelor of Technology`
   - Programme: `Computer Science & Engineering`
   - CGPA: `9.24`
4. Click **Sign & Issue Credential**.
5. The signed W3C VC 2.0 credential card appears with a cryptographic seal and on-chain status ID.

---

## 16. How to Verify a Credential

1. In the navigation bar, select **Verify Credential**.
2. Choose your input mode:
   - Select a demo preset from the list, OR
   - Upload a `.json` file, OR
   - Paste structured JSON directly into the editor.
3. Click **Verify Credential Independently**.
4. The verification engine executes 6 independent checks:
   - **Check 1 (Structure):** W3C VC 2.0 conformance.
   - **Check 2 (Signature):** Recovers issuer public key from Secp256k1 signature and canonical payload.
   - **Check 3 (Issuer Trust):** Queries `IssuerRegistry.sol` to verify institutional authorization.
   - **Check 4 (Temporal):** Checks `validFrom` and `validUntil`.
   - **Check 5 (Revocation):** Queries `CredentialStatusRegistry.sol` to verify status is `ACTIVE`.
   - **Check 6 (Claims):** Checks verifier policy requirements (e.g. active enrollment).
   - **Overall Verdict:** `VALID / CREDENTIAL VERIFIED`.

---

## 17. Demonstrating Cryptographic Tampering

1. Navigate to **Tamper Demo** in the top navigation.
2. Click **Demonstrate Credential Tampering** (or edit the Programme from `Computer Science & Engineering` to `Artificial Intelligence & Robotics`).
3. Observe the live **SHA-256 Digest Visualizer**:
   - The computed digest changes instantly.
   - Cryptographic verification runs in real-time.
   - Check 2 turns RED: **INVALID SIGNATURE**.
   - The recovered public key no longer matches IIT Bombay.
4. Click **Restore Original Credential** to show that reverting the claim immediately restores verification success!

---

## 18. Demonstrating Credential Revocation

1. Navigate to **Credential Registry** (Revocation Demo).
2. Note that the credential is initially **ACTIVE & VALID**.
3. Click **Revoke Credential Now** (enters reason: *"Disciplinary sanction"*).
4. An on-chain transaction is mined on Hardhat EVM.
5. The verifier re-checks the credential:
   - Check 2 (Signature): **VALID** (the off-chain document bytes were not modified).
   - Check 5 (Revocation Status): **FAILED (REVOKED)**.
   - Overall Verdict: **REVOKED CREDENTIAL**.
6. This illustrates why digital signatures alone are insufficient without a decentralized revocation registry.

---

## 19. Resetting the Demo

Click the **Reset Demo** icon (circular arrow) in the top-right header, or visit **Guided Demo** and click **Reset Demo to Step A**. This safely clears local wallet cache and resets demo credentials without corrupting browser data.

---

## 20. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `IssuerRegistry contract not deployed yet` | Hardhat node was restarted without re-running deploy script | Run `cd contracts && npx hardhat run scripts/deploy.ts --network localhost` |
| `Cannot connect to MetaMask` | MetaMask is set to wrong network | Switch MetaMask network to `Hardhat Localhost` (RPC: `http://127.0.0.1:8545`, Chain ID: `31337`) or use the built-in simulator |
| `Port 5000 or 5173 already in use` | Previous dev server instance still running | Terminate lingering node processes or configure alternative port in `.env` |
| `Module resolution error in TypeScript` | Outdated dependency build | Ensure `npm install` completed cleanly in contracts, backend, and frontend |

---

## 21. Security Limitations of This Prototype

1. **Browser LocalStorage vs Hardware Enclaves:** In this prototype, credentials are stored in browser `localStorage`. A production system requires an iOS Secure Enclave or Android Keystore mobile wallet.
2. **Local Hardhat Test Keys:** The system uses standard Hardhat test private keys. Production deployments must utilize institutional Hardware Security Modules (HSMs, FIPS 140-2 Level 3).
3. **Sybil Resistance:** Institutional accreditation in this prototype is managed by a demo Governor account. Production identity requires a consortium multi-sig governance authority (e.g., UGC / AICTE).

---

## 22. Potential Future Improvements

- **Zero-Knowledge Proofs (ZKPs):** Support selective disclosure (e.g. prove CGPA $> 8.0$ without revealing exact marks, or prove age $> 18$ without disclosing birthdate) using Groth16 / SnarkJS.
- **W3C StatusList2021 Accumulator:** Bit-vector compression for on-chain status tracking, enabling millions of credentials to be tracked in a single byte-array.
- **Mobile Digital Identity Wallet:** React Native / Flutter native mobile wallet with biometric face/fingerprint authentication.
- **DID-Auth & OIDC4VP:** Support OpenID for Verifiable Presentations (OID4VP) for standardized enterprise SSO login.

---

## 23. Academic Prototype Disclaimer

*TrustID India is a technical educational assessment project created for a university Blockchain Technologies course. It is not an official Government of India service, nor an official integration with DigiLocker, Digi Yatra, or UIDAI Aadhaar. All identity data, names, and student marks depicted in this demonstration are fictitious.*
