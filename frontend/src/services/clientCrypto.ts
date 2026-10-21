import canonicalize from 'canonicalize';
import { ethers } from 'ethers';
import { TrustIdVerifiableCredential } from '../types';

export function canonicalizeCredential(vc: Partial<TrustIdVerifiableCredential>): string {
  const copy: any = JSON.parse(JSON.stringify(vc));
  delete copy.proof;
  const canonical = canonicalize(copy);
  if (!canonical) throw new Error('Canonicalization failed');
  return canonical;
}

export function computeCredentialDigest(canonicalJson: string): string {
  return ethers.sha256(ethers.toUtf8Bytes(canonicalJson));
}

export function extractAddressFromDid(did: string): string | null {
  if (!did) return null;
  const match = did.match(/did:ethr:(0x[a-fA-F0-9]{40})/);
  if (match) return ethers.getAddress(match[1]);
  if (ethers.isAddress(did)) return ethers.getAddress(did);
  return null;
}

export function verifySignatureClientSide(vc: TrustIdVerifiableCredential) {
  try {
    if (!vc.proof?.proofValue) {
      return { isValid: false, error: 'Missing cryptographic proof in credential' };
    }

    const expectedAddress = extractAddressFromDid(vc.issuer.id);
    if (!expectedAddress) {
      return { isValid: false, error: 'Cannot extract valid issuer Ethereum address from DID' };
    }

    const canonical = canonicalizeCredential(vc);
    const digest = computeCredentialDigest(canonical);
    const recovered = ethers.getAddress(
      ethers.verifyMessage(ethers.getBytes(digest), vc.proof.proofValue)
    );

    const isValid = recovered.toLowerCase() === expectedAddress.toLowerCase();

    return {
      isValid,
      recoveredSigner: recovered,
      expectedAddress,
      canonicalDigest: digest,
      canonicalJson: canonical,
      error: isValid ? undefined : `Signature recovered ${recovered} does not match expected issuer ${expectedAddress}`,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Cryptographic verification error: ${err.message || String(err)}`,
    };
  }
}
