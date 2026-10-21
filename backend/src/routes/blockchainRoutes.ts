import { Router, Request, Response } from 'express';
import {
  fetchBlockchainActivity,
  getProvider,
  isBlockchainConnected,
  getContractDeployment,
} from '../services/blockchain';
import { CONFIG } from '../config';

const router = Router();

/**
 * Returns actual on-chain transaction & event activity logs from smart contracts.
 */
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const events = await fetchBlockchainActivity(limit);

    return res.json({
      success: true,
      total: events.length,
      events,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Returns network status and deployed contracts.
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const connected = await isBlockchainConnected();
    const provider = getProvider();
    let currentBlock = 0;
    let chainId = CONFIG.CHAIN_ID;

    if (connected) {
      try {
        currentBlock = await provider.getBlockNumber();
        const net = await provider.getNetwork();
        chainId = Number(net.chainId);
      } catch (err: any) {
        console.warn('Could not read block number:', err.message);
      }
    }

    const deployment = getContractDeployment();

    return res.json({
      success: true,
      blockchain: {
        connected,
        rpcUrl: CONFIG.RPC_URL,
        chainId,
        currentBlock,
        contracts: deployment?.contracts || null,
        demoAccounts: deployment?.demoAccounts || {
          governanceAdmin: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          universityIssuer1: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          universityIssuer2: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
