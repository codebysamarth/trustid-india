import canonicalize from 'canonicalize';
import { ethers } from 'ethers';
import { TrustIdVerifiableCredential } from '../../../shared/types/credential';

/**
 * Normalizes an Ethereum address to checksum format.
 */
export function normalizeAddress(addr: string): string {
  try {
    return ethers.getAddress(addr);
  } catch {
    return addr.toLowerCase();
  }
}

/**
 * Extracts Ethereum address from a did:ethr identifier.
 * Example: 'did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8' -> '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
 */
export function extractAddressFromDid(did: string): string | null {
  if (!did) return null;
  const match = did.match(/did:ethr:(0x[a-fA-F0-9]{40})/);
  if (match) {
    return normalizeAddress(match[1]);
  }
  if (ethers.isAddress(did)) {
    return normalizeAddress(did);
  }
  return null;
}

/**
 * Computes deterministic RFC 8785 JSON Canonicalization of the credential without the proof property.
 */
export function canonicalizeCredential(vc: Partial<TrustIdVerifiableCredential>): string {
  // Deep clone to avoid mutating input
  const copy: any = JSON.parse(JSON.stringify(vc));
  // Remove proof field for signing and signature verification
  delete copy.proof;

  const canonical = canonicalize(copy);
  if (!canonical) {
    throw new Error('Failed to canonicalize credential JSON using RFC 8785');
  }
  return canonical;
}

/**
 * Computes SHA-256 digest of the canonical JSON string.
 */
export function computeCredentialDigest(canonicalJson: string): string {
  const bytes = ethers.toUtf8Bytes(canonicalJson);
  return ethers.sha256(bytes);
}

/**
 * Computes keccak256 hash for the on-chain opaque credential reference.
 */
export function computeCredentialStatusId(credentialIdStr: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(credentialIdStr));
}

/**
 * Signs a Verifiable Credential using the issuer's private key.
 * Adheres to W3C VC 2.0 proof structure using standard Secp256k1 recovery signature.
 */
export async function signCredential(
  unsignedVc: Omit<TrustIdVerifiableCredential, 'proof'>,
  issuerPrivateKey: string
): Promise<TrustIdVerifiableCredential> {
  const wallet = new ethers.Wallet(issuerPrivateKey);
  const issuerAddress = normalizeAddress(wallet.address);

  // Validate that issuer DID matches the signer wallet
  const declaredIssuerAddress = extractAddressFromDid(unsignedVc.issuer.id);
  if (declaredIssuerAddress && declaredIssuerAddress !== issuerAddress) {
    throw new Error(
      `Issuer private key address (${issuerAddress}) does not match declared credential issuer ID (${declaredIssuerAddress})`
    );
  }

  // 1. Canonicalize credential payload
  const canonicalJson = canonicalizeCredential(unsignedVc);

  // 2. Compute 32-byte SHA-256 digest
  const digest = computeCredentialDigest(canonicalJson);

  // 3. Sign the digest bytes with secp256k1 private key
  const signature = await wallet.signMessage(ethers.getBytes(digest));

  // 4. Construct W3C VC 2.0 standard proof
  const proof = {
    type: 'EcdsaSecp256k1RecoverySignature2020' as const,
    created: new Date().toISOString(),
    verificationMethod: `did:ethr:${issuerAddress}#controller`,
    proofPurpose: 'assertionMethod' as const,
    proofValue: signature,
  };

  return {
    ...unsignedVc,
    proof,
  };
}

export interface SignatureVerificationResult {
  isValid: boolean;
  signerAddress: string | null;
  expectedAddress: string | null;
  canonicalDigest: string;
  error?: string;
}

/**
 * Independently verifies the cryptographic proof of a Verifiable Credential.
 * Recovers the public key address directly from the signature and compares against claimed issuer.
 */
export function verifyCredentialSignature(
  vc: TrustIdVerifiableCredential
): SignatureVerificationResult {
  try {
    if (!vc.proof || !vc.proof.proofValue) {
      return {
        isValid: false,
        signerAddress: null,
        expectedAddress: null,
        canonicalDigest: '',
        error: 'Missing proof or proofValue in credential',
      };
    }

    const expectedAddress =
      extractAddressFromDid(vc.issuer.id) ||
      (vc.proof.verificationMethod ? extractAddressFromDid(vc.proof.verificationMethod) : null);

    if (!expectedAddress) {
      return {
        isValid: false,
        signerAddress: null,
        expectedAddress: null,
        canonicalDigest: '',
        error: 'Could not extract valid issuer Ethereum address from issuer.id or verificationMethod',
      };
    }

    // Canonicalize without proof
    const canonicalJson = canonicalizeCredential(vc);
    const digest = computeCredentialDigest(canonicalJson);

    // Cryptographic recovery: derive signer address from signature & digest
    const recoveredAddress = normalizeAddress(
      ethers.verifyMessage(ethers.getBytes(digest), vc.proof.proofValue)
    );

    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();

    return {
      isValid,
      signerAddress: recoveredAddress,
      expectedAddress: expectedAddress,
      canonicalDigest: digest,
      error: isValid ? undefined : `Signature recovered address (${recoveredAddress}) does not match expected issuer (${expectedAddress})`,
    };
  } catch (err: any) {
    return {
      isValid: false,
      signerAddress: null,
      expectedAddress: null,
      canonicalDigest: '',
      error: `Cryptographic verification failed: ${err.message || String(err)}`,
    };
  }
}
