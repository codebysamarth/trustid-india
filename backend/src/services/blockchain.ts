import { ethers } from 'ethers';
import { CONFIG, getContractsConfig } from '../config';
import { BlockchainEventLog } from '../types/credential';
import { normalizeAddress } from './crypto';

let providerInstance: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!providerInstance) {
    providerInstance = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  }
  return providerInstance;
}

export function resetProvider(): void {
  providerInstance = null;
}

export async function isBlockchainConnected(): Promise<boolean> {
  try {
    const provider = getProvider();
    await provider.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}

export function getContractDeployment() {
  const config = getContractsConfig() || CONFIG.CONTRACTS;
  if (!config || !config.contracts) {
    return null;
  }
  return config;
}

export function getIssuerRegistryContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract | null {
  const deployment = getContractDeployment();
  if (!deployment?.contracts?.IssuerRegistry) return null;
  const target = signerOrProvider || getProvider();
  return new ethers.Contract(
    deployment.contracts.IssuerRegistry.address,
    deployment.contracts.IssuerRegistry.abi,
    target
  );
}

export function getCredentialStatusRegistryContract(
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract | null {
  const deployment = getContractDeployment();
  if (!deployment?.contracts?.CredentialStatusRegistry) return null;
  const target = signerOrProvider || getProvider();
  return new ethers.Contract(
    deployment.contracts.CredentialStatusRegistry.address,
    deployment.contracts.CredentialStatusRegistry.abi,
    target
  );
}

/**
 * Checks on-chain whether an issuer is registered and authorized.
 */
export async function checkIssuerAuthorizationOnChain(
  issuerAddress: string
): Promise<{ isAuthorized: boolean; isRegistered: boolean; name?: string }> {
  try {
    const contract = getIssuerRegistryContract();
    if (!contract) {
      console.warn('IssuerRegistry contract not deployed yet. Defaulting to unauthorized.');
      return { isAuthorized: false, isRegistered: false };
    }

    const norm = normalizeAddress(issuerAddress);
    const isAuth: boolean = await contract.isIssuerAuthorized(norm);

    try {
      const data = await contract.getIssuer(norm);
      return {
        isAuthorized: isAuth,
        isRegistered: data[3], // isRegistered
        name: data[0], // name
      };
    } catch {
      return {
        isAuthorized: isAuth,
        isRegistered: isAuth,
      };
    }
  } catch (err: any) {
    console.error('Error querying IssuerRegistry on-chain:', err.message);
    return { isAuthorized: false, isRegistered: false };
  }
}

/**
 * Checks on-chain credential validity and revocation state.
 */
export async function checkCredentialStatusOnChain(credentialIdBytes32: string): Promise<{
  isRegistered: boolean;
  isRevoked: boolean;
  isIssuerStillAuthorized: boolean;
  issuerAddress: string | null;
  registeredAt: number;
  revokedAt: number;
  revocationReason: string;
}> {
  try {
    const contract = getCredentialStatusRegistryContract();
    if (!contract) {
      return {
        isRegistered: false,
        isRevoked: false,
        isIssuerStillAuthorized: false,
        issuerAddress: null,
        registeredAt: 0,
        revokedAt: 0,
        revocationReason: 'CredentialStatusRegistry not deployed',
      };
    }

    const result = await contract.getCredentialStatus(credentialIdBytes32);
    return {
      isRegistered: result[0],
      isRevoked: result[1],
      isIssuerStillAuthorized: result[2],
      issuerAddress: result[3] !== ethers.ZeroAddress ? normalizeAddress(result[3]) : null,
      registeredAt: Number(result[4]),
      revokedAt: Number(result[5]),
      revocationReason: result[6] || '',
    };
  } catch (err: any) {
    console.error('Error querying CredentialStatusRegistry on-chain:', err.message);
    return {
      isRegistered: false,
      isRevoked: false,
      isIssuerStillAuthorized: false,
      issuerAddress: null,
      registeredAt: 0,
      revokedAt: 0,
      revocationReason: `On-chain query error: ${err.message}`,
    };
  }
}

/**
 * Registers a credential status identifier on-chain using an authorized issuer signer.
 */
export async function registerCredentialOnChain(
  credentialIdBytes32: string,
  issuerPrivateKey: string
): Promise<{ transactionHash: string; blockNumber: number }> {
  const provider = getProvider();
  const signer = new ethers.Wallet(issuerPrivateKey, provider);
  const contract = getCredentialStatusRegistryContract(signer);

  if (!contract) {
    throw new Error('CredentialStatusRegistry contract is not configured');
  }

  const tx = await contract.registerCredential(credentialIdBytes32);
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Revokes a credential on-chain using the issuer or governor signer.
 */
export async function revokeCredentialOnChain(
  credentialIdBytes32: string,
  reason: string,
  signerPrivateKey: string
): Promise<{ transactionHash: string; blockNumber: number }> {
  const provider = getProvider();
  const signer = new ethers.Wallet(signerPrivateKey, provider);
  const contract = getCredentialStatusRegistryContract(signer);

  if (!contract) {
    throw new Error('CredentialStatusRegistry contract is not configured');
  }

  const tx = await contract.revokeCredential(credentialIdBytes32, reason);
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Queries real blockchain event logs from IssuerRegistry and CredentialStatusRegistry.
 */
export async function fetchBlockchainActivity(maxEvents = 50): Promise<BlockchainEventLog[]> {
  const events: BlockchainEventLog[] = [];
  const provider = getProvider();

  try {
    const isConn = await isBlockchainConnected();
    if (!isConn) return [];

    const issuerContract = getIssuerRegistryContract();
    const statusContract = getCredentialStatusRegistryContract();

    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 5000);

    if (issuerContract) {
      const regEvents = await issuerContract.queryFilter(
        issuerContract.filters.IssuerRegistered(),
        fromBlock,
        currentBlock
      );

      for (const e of regEvents) {
        if ('args' in e) {
          const block = await e.getBlock();
          events.push({
            id: `evt-reg-${e.transactionHash}-${e.index}`,
            eventName: 'IssuerRegistered',
            contractAddress: await issuerContract.getAddress(),
            transactionHash: e.transactionHash,
            blockNumber: e.blockNumber,
            timestamp: block.timestamp,
            args: {
              issuerAddress: e.args[0],
              name: e.args[1],
              detailsUri: e.args[2],
              isAuthorized: e.args[3],
              registeredBy: e.args[4],
            },
            description: `University Issuer "${e.args[1]}" registered with address ${e.args[0]}`,
          });
        }
      }

      const authEvents = await issuerContract.queryFilter(
        issuerContract.filters.IssuerAuthorizationChanged(),
        fromBlock,
        currentBlock
      );

      for (const e of authEvents) {
        if ('args' in e) {
          const block = await e.getBlock();
          events.push({
            id: `evt-auth-${e.transactionHash}-${e.index}`,
            eventName: e.args[1] ? 'IssuerAuthorized' : 'IssuerRevoked',
            contractAddress: await issuerContract.getAddress(),
            transactionHash: e.transactionHash,
            blockNumber: e.blockNumber,
            timestamp: block.timestamp,
            args: {
              issuerAddress: e.args[0],
              isAuthorized: e.args[1],
              updatedBy: e.args[2],
            },
            description: `Issuer ${e.args[0]} authorization updated to: ${e.args[1] ? 'AUTHORIZED' : 'REVOKED'}`,
          });
        }
      }
    }

    if (statusContract) {
      const credRegEvents = await statusContract.queryFilter(
        statusContract.filters.CredentialRegistered(),
        fromBlock,
        currentBlock
      );

      for (const e of credRegEvents) {
        if ('args' in e) {
          const block = await e.getBlock();
          events.push({
            id: `evt-cred-reg-${e.transactionHash}-${e.index}`,
            eventName: 'CredentialRegistered',
            contractAddress: await statusContract.getAddress(),
            transactionHash: e.transactionHash,
            blockNumber: e.blockNumber,
            timestamp: block.timestamp,
            args: {
              credentialId: e.args[0],
              issuer: e.args[1],
            },
            description: `Credential status registered for ID ${String(e.args[0]).substring(0, 18)}... by issuer ${e.args[1]}`,
          });
        }
      }

      const credRevEvents = await statusContract.queryFilter(
        statusContract.filters.CredentialRevoked(),
        fromBlock,
        currentBlock
      );

      for (const e of credRevEvents) {
        if ('args' in e) {
          const block = await e.getBlock();
          events.push({
            id: `evt-cred-rev-${e.transactionHash}-${e.index}`,
            eventName: 'CredentialRevoked',
            contractAddress: await statusContract.getAddress(),
            transactionHash: e.transactionHash,
            blockNumber: e.blockNumber,
            timestamp: block.timestamp,
            args: {
              credentialId: e.args[0],
              issuer: e.args[1],
              revokedBy: e.args[2],
              reason: e.args[4],
            },
            description: `Credential ${String(e.args[0]).substring(0, 18)}... REVOKED by ${e.args[2]}. Reason: "${e.args[4]}"`,
          });
        }
      }
    }

    // Sort descending by blockNumber / timestamp
    events.sort((a, b) => b.blockNumber - a.blockNumber || b.timestamp - a.timestamp);
    return events.slice(0, maxEvents);
  } catch (err: any) {
    console.error('Error fetching blockchain activity logs:', err.message);
    return events;
  }
}
