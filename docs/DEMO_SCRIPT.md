# TrustID India — 5–7 Minute Classroom Demonstration Script

This script is tailored for a rapid, high-impact technical presentation to an academic evaluator or assessment panel.

---

### Step 0: System Initialization & Setup (30 Seconds Before Demo)
1. Ensure the Hardhat node, backend, and frontend are running:
   ```bash
   npm run node              # Terminal 1: Local EVM Node (port 8545)
   npm run deploy:contracts  # Terminal 2: Deploy & Seed Contracts
   npm run dev:backend       # Terminal 3: Express Backend (port 5000)
   npm run dev:frontend      # Terminal 4: Vite React Frontend (port 5173)
   ```
2. Open `http://localhost:5173` in your browser.
3. Click the **"Guided Demo"** link in the navigation header.

---

### Step 1: Project Overview & The Trust Problem (1 Minute)
- **Presenter:** *"Good morning Professor. Today I am presenting TrustID India, a blockchain-assisted Self-Sovereign Identity and Verifiable Credential platform. In traditional academic systems, employers verify scanned PDFs by calling university registrars or waiting weeks for physical letters. Traditional PDFs are trivially forged in Photoshop. TrustID India solves this using W3C Verifiable Credentials and decentralized smart contract registries."*
- **Visual Action:** Show the landing page and highlight the Trust Triangle: University (Issuer) $\rightarrow$ Student (Holder) $\rightarrow$ Scholarship Portal (Verifier).

---

### Step 2: University Issuer & Credential Issuance (1.5 Minutes)
- **Presenter:** *"First, let's step into the role of an accredited university. We navigate to the Issuer Dashboard."*
- **Action:**
  1. Click **"Issuer"** in the navigation bar.
  2. Point to the top-right badge showing **"Accredited Issuer: Indian Institute of Technology Bombay"**.
  3. Explain: *"The university's Ethereum address is registered in `IssuerRegistry.sol` on our local blockchain. Notice that an unauthorized account cannot issue valid credentials."*
  4. In the issuance form, fill in:
     - Student Name: `Aarav Sharma — DEMO`
     - Student ID: `BT-CS-2023-042`
     - Degree: `Bachelor of Technology`
     - Programme: `Computer Science & Engineering`
     - CGPA: `9.24`
  5. Click **"Sign & Issue Credential"**.
- **Visual Result:** The signed credential appears with a security seal and on-chain status ID.
- **Talking Point:** *"Notice what just happened: The backend canonicalized the JSON using RFC 8785, computed a SHA-256 hash, and signed it with Secp256k1. Simultaneously, the opaque 32-byte status hash was registered on the blockchain in `CredentialStatusRegistry.sol`. Notice: No student personal data was put on the blockchain!"*

---

### Step 3: Student Digital Wallet & Custody (1 Minute)
- **Action:** Click **"My Wallet"** in the navigation bar.
- **Presenter:** *"Now we switch perspectives to the Student Holder. Inside the Student Wallet, Aarav Sharma holds his newly issued credential locally."*
- **Actions to Show:**
  1. Click **"Inspect JSON"** to view the raw W3C VC 2.0 object.
  2. Point out the `@context`, `issuer.id` (did:ethr), and `proof.proofValue`.
  3. Point to the educational badge: *"Notice the storage banner: The credential is held off-chain in student custody, not on a central government server."*
  4. Click **"Verify in Portal"**.

---

### Step 4: Independent Verification Portal (1 Minute)
- **Presenter:** *"Now we are the Scholarship Portal or Employer Verifier. We need to verify Aarav's credential independently without contacting IIT Bombay."*
- **Action:** Click **"Verify Credential Independently"**.
- **Visual Result:** All 6 checks turn green:
  - Check 1: Structural Conformance (PASSED)
  - Check 2: Cryptographic Signature (PASSED - Recovered Address matches Issuer DID)
  - Check 3: Issuer Trust & Accreditation (PASSED - Verified in `IssuerRegistry.sol`)
  - Check 4: Temporal Validity (PASSED - Within valid window)
  - Check 5: Decentralized Revocation Status (PASSED - ACTIVE on-chain)
  - Check 6: Policy & Eligibility Claims (PASSED - Enrollment is Active)
  - **Overall Result: VALID / CREDENTIAL VERIFIED**

---

### Step 5: Cryptographic Tampering Demonstration (1.5 Minutes)
- **Presenter:** *"Now, let's test what happens if an attacker tries to tamper with the credential claims."*
- **Action:**
  1. Click **"Tamper Demo"** in the navigation bar.
  2. Click the button **"Demonstrate Credential Tampering"** (or edit the Programme from `Computer Science & Engineering` to `Artificial Intelligence & Robotics`).
  3. Observe the real-time visual hash comparator!
- **Visual Result:**
  - Original SHA-256 Digest $\neq$ Current Computed Digest.
  - Check 2 turns RED: **INVALID SIGNATURE**.
  - Overall Verdict: **VERIFICATION REJECTED**.
- **Talking Point:** *"Because the signature was computed over the canonical SHA-256 hash, altering even one letter alters the hash completely. Public key recovery derives a totally different address that does not match IIT Bombay. The system mathematically prevents grade or degree forgery."*
- **Action:** Click **"Restore Original Credential"** and show that the original credential immediately passes again.

---

### Step 6: On-Chain Revocation & Blockchain Activity (1 Minute)
- **Presenter:** *"What if a student commits academic misconduct and their degree is revoked? Does a valid signature still pass?"*
- **Action:**
  1. Click **"Credential Registry"** (Revocation Demo) in the navigation bar.
  2. Point out: Before revocation $\rightarrow$ Signature Valid & Status Active.
  3. Click **"Revoke Credential Now"**.
  4. A real transaction is mined on Hardhat EVM!
  5. The verification engine immediately re-runs:
     - Check 2 (Signature): **VALID** (The physical document was untouched).
     - Check 5 (Revocation Status): **FAILED (REVOKED)**.
     - Overall Result: **REVOKED CREDENTIAL**.
- **Action:** Click **"Activity"** in the navigation bar.
- **Presenter:** *"Here in the Blockchain Activity explorer, we see the real mined events: `CredentialRevoked` and `CredentialRegistered` with real block numbers and transaction hashes. The student's privacy is preserved, but revocation is universally auditable."*

---

### Step 7: Conclusion & Limitations (30 Seconds)
- **Presenter:** *"To conclude, TrustID India demonstrates how Self-Sovereign Identity and blockchain registries deliver privacy-by-design, cryptographic tamper resistance, and instant third-party verifiability without exposing PII on public ledgers. Thank you, and I welcome any questions."*
