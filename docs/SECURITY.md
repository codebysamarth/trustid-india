# TrustID India — Security Architecture & Threat Model

## 1. Security Overview

TrustID India is built on defense-in-depth principles combining applied cryptography (RFC 8785 JSON Canonicalization, SHA-256, and ECDSA Secp256k1) and smart contract access controls.

This document describes the threat model, mitigation mechanisms, and security boundaries.

---

## 2. Threat Model & Mitigations

| Threat Vector | Attack Scenario | Defensive Countermeasure in TrustID |
| :--- | :--- | :--- |
| **T1: Claim Tampering** | A student alters their CGPA from `9.24` to `9.99` or changes degree programme from `B.Tech Computer Science` to `B.Tech AI`. | **Cryptographic Proof Invalidation:** Changing any character changes the RFC 8785 canonical SHA-256 hash. During ECDSA recovery, the derived address no longer matches the university's public address. Signature verification strictly fails (`INVALID SIGNATURE`). |
| **T2: Rogue Issuer Impersonation** | An unauthorized wallet generates a self-signed credential claiming to be a prestigious university. | **Decentralized IssuerRegistry:** Check 3 queries the on-chain smart contract. Even if the signature matches the rogue wallet, verification fails with `UNTRUSTED ISSUER` because the address is not accredited on the blockchain. |
| **T3: Unauthorized Revocation** | A malicious student attempts to revoke a competitor's degree or an unauthorized user attempts to manipulate registry state. | **Smart Contract Access Control:** `CredentialStatusRegistry.sol` strictly enforces: `require(msg.sender == credentials[id].issuer || msg.sender == owner(), "Unauthorized")`. Only the original issuing institution can revoke. |
| **T4: Blockchain Privacy Leakage (PII)** | An observer scans the public blockchain to deanonymize student grades, Aadhaar numbers, or names. | **Zero PII On-Chain:** No names, student IDs, dates of birth, or marks are stored in smart contract storage. Only an opaque, unlinkable 32-byte status hash (`keccak256(vc.id)`) is registered. |
| **T5: Replay of Revoked Credentials** | A student whose degree was revoked continues presenting the original signed PDF/JSON to unsuspecting employers. | **Real-Time On-Chain Status Check:** Check 5 queries `CredentialStatusRegistry.sol`. The verifier immediately detects `isRevoked == true` and rejects the credential (`REVOKED CREDENTIAL`). |
| **T6: Temporal Exploitation** | A candidate presents an expired credential. | **Timestamp Validation:** Check 4 compares system time against `validFrom` and `validUntil` timestamps. |

---

## 3. Cryptographic Key Architecture

### Separation of Concerns
1. **Institutional Signing Key (Off-Chain):**
   - Private key used to compute ECDSA signatures on Verifiable Credentials.
   - Kept in secure backend configuration (`.env` in development; HSM in production).
   - **Never exposed to frontend JavaScript bundles.**
2. **Governor / Administrator Key (Blockchain):**
   - Ethereum account responsible for deploying contracts and granting institutional accreditation in `IssuerRegistry.sol`.
3. **Student Key / Identifier (DID):**
   - `did:example:student-<id>` representing the subject.
   - Does not have authority to sign or revoke credentials.

---

## 4. Prototype Security Boundaries & Known Limitations

1. **Browser LocalStorage vs Secure Enclaves:**
   - In this educational demonstration, the student digital wallet stores credentials in browser `localStorage`.
   - **Notice:** `localStorage` is accessible to JavaScript and does not offer hardware-level tamper resistance. In a commercial production deployment, credentials must be stored within a dedicated mobile wallet backed by an iOS Secure Enclave or Android Keystore with biometric authorization.
2. **Local Hardhat Environment:**
   - The platform utilizes Hardhat local accounts with publicly known test private keys. These keys are strictly for classroom demonstration and unit testing.
3. **Sybil Resistance & Decentralized Governance:**
   - In our prototype, a single Governor account accredits universities. A production nation-scale system would employ a decentralized consortium of accredited bodies (e.g., UGC, AICTE, NAAC) via multi-signature governance (e.g., Gnosis Safe).
