import { Router, Request, Response } from 'express';
import { credentialStore } from '../services/credentialStore';
import { resetProvider, getProvider } from '../services/blockchain';
import { ethers } from 'ethers';

const router = Router();

/**
 * Faucet endpoint: Sends 100 free test ETH from Hardhat account #0 to any requested address.
 */
router.post('/faucet', async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Target address is required' });
    }
    const provider = getProvider();
    const signer = await provider.getSigner(0);
    const tx = await signer.sendTransaction({
      to: address,
      value: ethers.parseEther('100.0'),
    });
    await tx.wait();
    const newBal = await provider.getBalance(address);
    return res.json({
      success: true,
      message: `Successfully funded ${address} with 100.0 test ETH!`,
      balance: ethers.formatEther(newBal),
      txHash: tx.hash,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Resets local demo state and cache without corrupting user data.
 */
router.post('/reset', (_req: Request, res: Response) => {
  try {
    credentialStore.clear();
    resetProvider();

    return res.json({
      success: true,
      message: 'Local demonstration cache has been successfully reset.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Returns current demo system overview metrics.
 */
router.get('/metrics', (_req: Request, res: Response) => {
  const credentials = credentialStore.getAll();
  const activeCount = credentials.filter((c) => !c.isRevoked).length;
  const revokedCount = credentials.filter((c) => c.isRevoked).length;

  return res.json({
    success: true,
    metrics: {
      totalCredentialsIssued: credentials.length,
      activeCredentials: activeCount,
      revokedCredentials: revokedCount,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
