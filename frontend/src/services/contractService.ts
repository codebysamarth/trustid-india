import { ethers } from 'ethers';
import contractsDeployment from '../config/contracts.json';
import { canonicalizeCredential, computeCredentialDigest } from './clientCrypto';
import { TrustIdVerifiableCredential } from '../types';

export function getStatusRegistryAddress(): string {
  return contractsDeployment.contracts.CredentialStatusRegistry.address;
}

export function getIssuerRegistryAddress(): string {
  return contractsDeployment.contracts.IssuerRegistry.address;
}

export function getStatusRegistryContract(signerOrProvider: ethers.Signer | ethers.Provider): ethers.Contract {
  const address = contractsDeployment.contracts.CredentialStatusRegistry.address;
  const abi = contractsDeployment.contracts.CredentialStatusRegistry.abi;
  return new ethers.Contract(address, abi, signerOrProvider);
}

export function getIssuerRegistryContract(signerOrProvider: ethers.Signer | ethers.Provider): ethers.Contract {
  const address = contractsDeployment.contracts.IssuerRegistry.address;
  const abi = contractsDeployment.contracts.IssuerRegistry.abi;
  return new ethers.Contract(address, abi, signerOrProvider);
}

/**
 * Signs a W3C Verifiable Credential using MetaMask.
 * Triggers a MetaMask Signature Request (personal_sign) popup.
 */
export async function signCredentialWithMetaMask(
  signer: ethers.Signer,
  unsignedVc: Omit<TrustIdVerifiableCredential, 'proof'>
): Promise<TrustIdVerifiableCredential> {
  const signerAddress = await signer.getAddress();
  
  // 1. RFC 8785 JSON Canonicalization
  const canonicalJson = canonicalizeCredential(unsignedVc);

  // 2. 32-byte SHA-256 Digest
  const digest = computeCredentialDigest(canonicalJson);

  // 3. Request ECDSA signature via MetaMask (triggers MetaMask signature popup!)
  const signature = await signer.signMessage(ethers.getBytes(digest));

  // 4. Construct W3C VC 2.0 Proof
  const proof = {
    type: 'EcdsaSecp256k1RecoverySignature2020' as const,
    created: new Date().toISOString(),
    verificationMethod: `did:ethr:${signerAddress}#controller`,
    proofPurpose: 'assertionMethod' as const,
    proofValue: signature,
  };

  return {
    ...unsignedVc,
    proof,
  };
}

/**
 * Safely computes fee data / gas overrides for transactions to avoid
 * "gas tip cap below minimum" errors on networks like Polygon Amoy (80002 / 0x13882).
 */
async function getTransactionGasOverrides(signer: ethers.Signer): Promise<any> {
  const overrides: any = {
    gasLimit: 250000n, // Generous gas limit prevents MetaMask "Network fee ⚠️" estimation issues
  };
  try {
    const provider = signer.provider;
    if (provider) {
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Polygon Amoy (80002 / 0x13882) or Polygon Mainnet (137) require >= 25-30 Gwei tip
      if (chainId === 80002 || chainId === 137) {
        overrides.maxPriorityFeePerGas = ethers.parseUnits('30', 'gwei');
        overrides.maxFeePerGas = ethers.parseUnits('50', 'gwei');
      } else if (chainId === 31337) {
        // Hardhat Consortium EVM: explicit clean fees prevent MetaMask fee calculation hangs
        overrides.maxPriorityFeePerGas = ethers.parseUnits('1', 'gwei');
        overrides.maxFeePerGas = ethers.parseUnits('2', 'gwei');
        // Synchronize on-chain nonce to prevent MetaMask stuck nonce issues
        try {
          const signerAddr = await signer.getAddress();
          const currentNonce = await provider.getTransactionCount(signerAddr, 'latest');
          overrides.nonce = currentNonce;
        } catch (nonceErr) {
          console.warn('Could not fetch nonce:', nonceErr);
        }
      }
    }
  } catch (err) {
    console.warn('Could not determine custom gas overrides:', err);
  }
  return overrides;
}

/**
 * Registers a credential status ID directly on the blockchain via MetaMask.
 * Triggers a MetaMask Transaction Confirmation popup!
 */
export async function registerCredentialOnChainWithMetaMask(
  signer: ethers.Signer,
  statusIdBytes32: string
): Promise<{ transactionHash: string; blockNumber?: number }> {
  const contract = getStatusRegistryContract(signer);
  const overrides = await getTransactionGasOverrides(signer);
  const tx = await contract.registerCredential(statusIdBytes32, overrides);
  const receipt = await tx.wait(1);
  return {
    transactionHash: tx.hash,
    blockNumber: receipt?.blockNumber,
  };
}

/**
 * Revokes a credential directly on the blockchain via MetaMask.
 * Triggers a MetaMask Transaction Confirmation popup!
 */
export async function revokeCredentialOnChainWithMetaMask(
  signer: ethers.Signer,
  statusIdBytes32: string,
  reason: string
): Promise<{ transactionHash: string; blockNumber?: number }> {
  const contract = getStatusRegistryContract(signer);
  const overrides = await getTransactionGasOverrides(signer);
  const tx = await contract.revokeCredential(statusIdBytes32, reason, overrides);
  const receipt = await tx.wait(1);
  return {
    transactionHash: tx.hash,
    blockNumber: receipt?.blockNumber,
  };
}

/**
 * Registers an institutional issuer on the blockchain via MetaMask.
 * Triggers a MetaMask Transaction Confirmation popup!
 */
export async function registerIssuerOnChainWithMetaMask(
  signer: ethers.Signer,
  issuerAddress: string,
  name: string,
  detailsUri: string
): Promise<{ transactionHash: string; blockNumber?: number }> {
  const contract = getIssuerRegistryContract(signer);
  const overrides = await getTransactionGasOverrides(signer);
  const tx = await contract.registerIssuer(issuerAddress, name, detailsUri, overrides);
  const receipt = await tx.wait(1);
  return {
    transactionHash: tx.hash,
    blockNumber: receipt?.blockNumber,
  };
}
