import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import credentialRoutes from './routes/credentialRoutes';
import issuerRoutes from './routes/issuerRoutes';
import blockchainRoutes from './routes/blockchainRoutes';
import demoRoutes from './routes/demoRoutes';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'TrustID India SSI & Verifiable Credential Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/credentials', credentialRoutes);
app.use('/api/issuers', issuerRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/demo', demoRoutes);

// Safe Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[TrustID API Error]:', err);
  const status = err.status || 500;
  const message = err.message || 'An internal server error occurred while processing the request.';
  res.status(status).json({
    success: false,
    error: message,
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, () => {
    console.log(`=======================================================`);
    console.log(`TrustID India Backend Service Running`);
    console.log(`Port: ${CONFIG.PORT}`);
    console.log(`RPC Endpoint: ${CONFIG.RPC_URL}`);
    console.log(`W3C VC 2.0 Compliance: ENABLED`);
    console.log(`=======================================================`);
  });
}

export default app;
