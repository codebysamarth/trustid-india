# TrustID India — System Architecture & Technical Specification

## 1. Executive Summary

**TrustID India** is a blockchain-assisted Self-Sovereign Identity (SSI) and Verifiable Credential (VC) verification platform designed for academic credential issuance, custody, and independent third-party verification.

The platform demonstrates how universities can issue tamper-evident academic qualifications to students adhering to the **W3C Verifiable Credentials Data Model 2.0**, how students exercise self-sovereign custody over their credentials without central server dependencies, and how relying parties (scholarship providers and employers) independently verify credential authenticity, institutional accreditation, and real-time revocation status.

---

## 2. Core Architectural Pillars

```
+-----------------------------------------------------------------------------------+
|                              TRUSTID INDIA ARCHITECTURE                           |
+-----------------------------------------------------------------------------------+

     [ UNIVERSITY / ISSUER ]                         [ STUDENT / HOLDER ]
  • Possesses institutional private key          • Stores credentials off-chain locally
  • Accredited in IssuerRegistry.sol             • Presents credential with explicit consent
  • Signs W3C VC 2.0 (RFC 8785 + Secp256k1)      • Exports / imports credential JSON
            |                                               |
            | 1. Issues & signs VC                          |
            |    (off-chain delivery)                       | 3. Presents VC
            |                                               |    (off-chain delivery)
            v                                               v
    [ STUDENT WALLET ]                            [ VERIFIER PORTAL ]
  (Browser / Local Storage)                     (Scholarship / Employer)
            ^                                               |
            |                                               | 4. Runs 7-stage
            |                                               |    verification
            |                                               v
+-----------+-----------------------------------------------+-----------------------+
|                       DECENTRALIZED TRUST REGISTRY LAYER                          |
|                       (Local EVM Blockchain - Hardhat)                           |
|                                                                                   |
|   A. IssuerRegistry.sol                                                           |
|      • Maps Ethereum addresses to accredited universities                         |
|      • Enforces institutional authorization before issuance                       |
|      • Emits: IssuerRegistered, IssuerAuthorizationChanged                        |
|                                                                                   |
|   B. CredentialStatusRegistry.sol                                                 |
|      • Stores opaque 32-byte status hashes (keccak256(vc.id))                     |
|      • Provides constant-time O(1) status lookup (Active vs Revoked)              |
|      • Strictly restricts revocation to the issuing university or governor        |
|      • Emits: CredentialRegistered, CredentialRevoked                             |
|                                                                                   |
|   * ZERO Personally Identifiable Information (PII) is ever written to blockchain! |
+-----------------------------------------------------------------------------------+
```

---

## 3. The SSI Trust Triangle

### A. University / Issuer
- **Role:** Creates and cryptographically signs academic degrees and enrollment credentials.
- **Authority:** Verified through the on-chain `IssuerRegistry` smart contract.
- **Privacy:** Personal student claims (name, CGPA, graduation year) are included in the signed credential but **never stored on-chain**. Only an opaque 32-byte identifier (`keccak256(vc.id)`) is registered on-chain for revocation indexing.

### B. Student / Holder
- **Role:** Holds the signed verifiable credential in a private digital wallet.
- **Sovereignty:** The student possesses the cryptographic artifact off-chain. Even if the university portal goes offline, the credential remains provably authentic.
- **Consent:** The credential is only shared when the student actively presents it to a relying party.

### C. Scholarship Portal / Verifier
- **Role:** Evaluates credentials submitted by candidates.
- **Independence:** Does not call the issuing university, send physical letters to registrar desks, or query proprietary backchannels. Verification is performed using open cryptographic algorithms and decentralized smart contract state queries.

---

## 4. W3C Verifiable Credentials Data Model 2.0

TrustID India implements the W3C VC 2.0 standard structure:

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://trustid.gov.in/contexts/v2"
  ],
  "id": "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "type": [
    "VerifiableCredential",
    "UniversityDegreeCredential"
  ],
  "issuer": {
    "id": "did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "name": "Indian Institute of Technology Bombay — DEMO"
  },
  "validFrom": "2026-06-15T00:00:00Z",
  "validUntil": "2036-06-15T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:student-aarav-sharma-1001",
    "name": "Aarav Sharma — DEMO",
    "studentId": "BT-CS-2023-042",
    "institution": "Indian Institute of Technology Bombay — DEMO",
    "degree": "Bachelor of Technology",
    "programme": "Computer Science & Engineering",
    "enrollmentStatus": "Active",
    "cgpa": "9.24",
    "graduationYear": 2026
  },
  "credentialStatus": {
    "id": "0x4b7c89f2a4e10d29...",
    "type": "EthereumCredentialStatusList2026",
    "statusRegistryContract": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "statusPurpose": "revocation"
  },
  "proof": {
    "type": "EcdsaSecp256k1RecoverySignature2020",
    "created": "2026-06-15T10:30:00Z",
    "verificationMethod": "did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8#controller",
    "proofPurpose": "assertionMethod",
    "proofValue": "0x3f9a71b2c458e09f..."
  }
}
```

---

## 5. Cryptographic Pipeline: Deterministic Canonicalization & Secp256k1

To ensure signature verification is mathematically reproducible across different programming languages and runtimes:

1. **RFC 8785 JSON Canonicalization Scheme (JCS):**
   Standard JSON serialization allows arbitrary key ordering and whitespace differences, which would cause identical claims to yield different cryptographic hashes. TrustID canonicalizes the credential payload without the `proof` property using RFC 8785:
   $$\text{canonicalBytes} = \text{RFC8785}(\text{Credential} \setminus \{\text{proof}\})$$

2. **SHA-256 Digest Computation:**
   $$\text{digest} = \text{SHA-256}(\text{canonicalBytes})$$

3. **ECDSA Secp256k1 Signature Generation:**
   The issuer signs the 32-byte digest using their institutional private key:
   $$\text{signature} = \text{Sign}_{\text{SK}_{\text{issuer}}}(\text{digest})$$

4. **Public Key & Signer Address Recovery:**
   During verification, the verifier recovers the signer's Ethereum address directly from the signature and digest using elliptic curve point recovery:
   $$\text{recoveredAddress} = \text{ecrecover}(\text{digest}, \text{signature})$$
   The verifier then checks whether $\text{recoveredAddress} == \text{declaredIssuerAddress}$.

---

## 6. Smart Contracts Architecture

### Contract A: `IssuerRegistry.sol`
- **Ownership & Governance:** Inherits OpenZeppelin `Ownable`.
- **Functionality:**
  - `registerIssuer(address, name, detailsUri, authorizeImmediately)`: Registers an institution.
  - `setIssuerAuthorization(address, isAuthorized)`: Grants or revokes institutional authority.
  - `isIssuerAuthorized(address)`: View function called by verifiers and `CredentialStatusRegistry`.
- **Events:** `IssuerRegistered`, `IssuerAuthorizationChanged`.

### Contract B: `CredentialStatusRegistry.sol`
- **Dependency:** Interacts with `IssuerRegistry`.
- **Functionality:**
  - `registerCredential(bytes32 credentialId)`: Only authorized issuers can register credentials.
  - `revokeCredential(bytes32 credentialId, string reason)`: Restricted to the original issuing university or registry governor.
  - `getCredentialStatus(bytes32 credentialId)`: Returns registered status, revocation state, issuer address, and timestamps in $O(1)$ complexity.
  - `isCredentialValid(bytes32 credentialId)`: Returns boolean validity.
- **Events:** `CredentialRegistered`, `CredentialRevoked`.

---

## 7. Comparative Analysis: TrustID India vs Indian Identity Ecosystem

| Dimension | UIDAI Aadhaar | DigiLocker | TrustID India (SSI Prototype) |
| :--- | :--- | :--- | :--- |
| **Architecture** | Centralized national ID database (CIDR) | Federated document repository | Decentralized Self-Sovereign Identity |
| **Credential Custody** | Stored on central UIDAI servers | Stored on government & issuer cloud servers | Held exclusively on student device / off-chain |
| **Verification Method** | Central biometric/OTP authentication | Central server login / API token | Cryptographic signature + on-chain status query |
| **Blockchain Role** | None | None | Decentralized Issuer & Status Registry |
| **W3C VC 2.0 Compliance** | No | Partially exploring pilot schemes | Yes, full native implementation |
| **User Privacy** | Centralized audit logs of all authentications | Centralized record of document access | Zero PII on-chain; offline verification possible |
