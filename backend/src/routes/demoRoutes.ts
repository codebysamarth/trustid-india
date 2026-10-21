import { Router, Request, Response } from 'express';
import { credentialStore } from '../services/credentialStore';
import { resetProvider } from '../services/blockchain';

const router = Router();

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
