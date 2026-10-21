import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import {
  getIssuerRegistryContract,
  checkIssuerAuthorizationOnChain,
  getProvider,
} from '../services/blockchain';
import { normalizeAddress } from '../services/crypto';
import { CONFIG } from '../config';

const router = Router();

/**
 * Lists all registered issuers from the smart contract registry.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const contract = getIssuerRegistryContract();
    if (!contract) {
      return res.json({
        success: true,
        issuers: [],
        warning: 'IssuerRegistry contract is not deployed yet.',
      });
    }

    const addresses: string[] = await contract.getAllIssuers();
    const issuers = [];

    for (const addr of addresses) {
      try {
        const details = await contract.getIssuer(addr);
        issuers.push({
          address: normalizeAddress(addr),
          name: details[0],
          detailsUri: details[1],
          isAuthorized: details[2],
          isRegistered: details[3],
          registeredAt: Number(details[4]),
          updatedAt: Number(details[5]),
        });
      } catch (err: any) {
        console.warn(`Could not read issuer ${addr}:`, err.message);
      }
    }

    return res.json({
      success: true,
      total: issuers.length,
      issuers,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Checks a specific issuer's authorization status.
 */
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address' });
    }

    const status = await checkIssuerAuthorizationOnChain(address);
    return res.json({
      success: true,
      address: normalizeAddress(address),
      ...status,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Registers an educational institution (governor role).
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      issuerAddress,
      name,
      detailsUri = '',
      authorizeImmediately = true,
      governorPrivateKey = CONFIG.GOVERNANCE_PRIVATE_KEY,
    } = req.body;

    if (!issuerAddress || !ethers.isAddress(issuerAddress)) {
      return res.status(400).json({ success: false, error: 'Valid issuerAddress is required' });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Issuer name cannot be empty' });
    }

    const provider = getProvider();
    const governor = new ethers.Wallet(governorPrivateKey, provider);
    const contract = getIssuerRegistryContract(governor);

    if (!contract) {
      return res.status(500).json({ success: false, error: 'IssuerRegistry contract not configured' });
    }

    const tx = await contract.registerIssuer(
      normalizeAddress(issuerAddress),
      name.trim(),
      detailsUri,
      authorizeImmediately
    );
    const receipt = await tx.wait();

    return res.status(201).json({
      success: true,
      message: `Institution "${name}" registered successfully`,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      issuerAddress: normalizeAddress(issuerAddress),
      isAuthorized: authorizeImmediately,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Toggles authorization status for an institution.
 */
router.post('/authorize', async (req: Request, res: Response) => {
  try {
    const {
      issuerAddress,
      isAuthorized,
      governorPrivateKey = CONFIG.GOVERNANCE_PRIVATE_KEY,
    } = req.body;

    if (!issuerAddress || !ethers.isAddress(issuerAddress)) {
      return res.status(400).json({ success: false, error: 'Valid issuerAddress is required' });
    }
    if (typeof isAuthorized !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isAuthorized boolean flag is required' });
    }

    const provider = getProvider();
    const governor = new ethers.Wallet(governorPrivateKey, provider);
    const contract = getIssuerRegistryContract(governor);

    if (!contract) {
      return res.status(500).json({ success: false, error: 'IssuerRegistry contract not configured' });
    }

    const tx = await contract.setIssuerAuthorization(normalizeAddress(issuerAddress), isAuthorized);
    const receipt = await tx.wait();

    return res.json({
      success: true,
      message: `Authorization updated to ${isAuthorized ? 'AUTHORIZED' : 'DE-AUTHORIZED'}`,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
