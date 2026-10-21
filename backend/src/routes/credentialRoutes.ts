import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import {
  TrustIdVerifiableCredential,
  CredentialSubject,
  CredentialIssuer,
  CredentialStatusReference,
} from '../types/credential';
import {
  signCredential,
  computeCredentialStatusId,
  extractAddressFromDid,
  normalizeAddress,
} from '../services/crypto';
import {
  checkIssuerAuthorizationOnChain,
  registerCredentialOnChain,
  revokeCredentialOnChain,
  getContractDeployment,
} from '../services/blockchain';
import { verifyVerifiableCredential } from '../services/verificationEngine';
import { credentialStore, IssuedCredentialMeta } from '../services/credentialStore';
import { CONFIG } from '../config';

const router = Router();

/**
 * Issues a cryptographically signed W3C VC 2.0 academic credential.
 */
router.post('/issue', async (req: Request, res: Response) => {
  try {
    const {
      studentName,
      studentId,
      institution,
      degree,
      programme,
      enrollmentStatus = 'Active',
      cgpa,
      graduationYear,
      expirationDate,
      issuerPrivateKey = CONFIG.DEMO_ISSUER_PRIVATE_KEY,
    } = req.body;

    if (!studentName || !studentId || !institution || !degree || !programme) {
      return res.status(400).json({
        success: false,
        error: 'Missing mandatory credential fields: studentName, studentId, institution, degree, and programme are required.',
      });
    }

    // Determine issuer wallet and address
    const issuerWallet = new ethers.Wallet(issuerPrivateKey);
    const issuerAddress = normalizeAddress(issuerWallet.address);

    // SECURITY CHECK: Verify that the issuer is registered and authorized in smart contract
    const authStatus = await checkIssuerAuthorizationOnChain(issuerAddress);
    if (!authStatus.isAuthorized) {
      return res.status(403).json({
        success: false,
        error: `Authorization Error: The signing account (${issuerAddress}) is NOT registered or authorized to issue credentials in the on-chain IssuerRegistry.`,
      });
    }

    // Generate unique opaque credential ID
    const uniqueUuid = uuidv4();
    const credentialUrn = `urn:uuid:${uniqueUuid}`;
    const credentialStatusIdBytes32 = computeCredentialStatusId(credentialUrn);

    const deployment = getContractDeployment();
    const statusRegistryAddress =
      deployment?.contracts?.CredentialStatusRegistry?.address || ethers.ZeroAddress;

    const issueDate = new Date().toISOString();

    const unsignedVc: Omit<TrustIdVerifiableCredential, 'proof'> = {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
        'https://trustid.gov.in/contexts/v2',
      ],
      id: credentialUrn,
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: {
        id: `did:ethr:${issuerAddress}`,
        name: institution || authStatus.name || 'Accredited University — DEMO',
      },
      validFrom: issueDate,
      validUntil: expirationDate || undefined,
      credentialSubject: {
        id: `did:example:student-${studentId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: studentName,
        studentId: studentId,
        institution: institution,
        degree: degree,
        programme: programme,
        enrollmentStatus: enrollmentStatus as any,
        cgpa: cgpa || undefined,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
      },
      credentialStatus: {
        id: credentialStatusIdBytes32,
        type: 'EthereumCredentialStatusList2026',
        statusRegistryContract: statusRegistryAddress,
        statusPurpose: 'revocation',
      },
    };

    // Cryptographically sign credential
    const signedVc = await signCredential(unsignedVc, issuerPrivateKey);

    // Register credential identifier in on-chain status registry
    let onChainTxHash: string | undefined;
    let onChainBlockNumber: number | undefined;

    try {
      const regResult = await registerCredentialOnChain(
        credentialStatusIdBytes32,
        issuerPrivateKey
      );
      onChainTxHash = regResult.transactionHash;
      onChainBlockNumber = regResult.blockNumber;
    } catch (chainErr: any) {
      console.warn('Warning: Could not register on blockchain directly:', chainErr.message);
    }

    // Save to off-chain store for demo inspection & student wallet sync
    const meta: IssuedCredentialMeta = {
      credential: signedVc,
      statusId: credentialStatusIdBytes32,
      txHash: onChainTxHash,
      isRevoked: false,
      issuedAt: issueDate,
    };
    credentialStore.add(meta);

    return res.status(201).json({
      success: true,
      credential: signedVc,
      statusId: credentialStatusIdBytes32,
      blockchain: {
        registeredOnChain: !!onChainTxHash,
        transactionHash: onChainTxHash,
        blockNumber: onChainBlockNumber,
      },
    });
  } catch (err: any) {
    console.error('Error issuing credential:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to issue credential: ${err.message || String(err)}`,
    });
  }
});

/**
 * Verifies a credential payload against the 7-stage verification engine.
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { credential, policy } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Missing credential parameter in request body',
      });
    }

    const report = await verifyVerifiableCredential(credential, policy);
    return res.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error('Verification error:', err);
    return res.status(500).json({
      success: false,
      error: `Verification processing failure: ${err.message || String(err)}`,
    });
  }
});

/**
 * Revokes a credential on-chain in the CredentialStatusRegistry.
 */
router.post('/revoke', async (req: Request, res: Response) => {
  try {
    const {
      credentialId,
      statusId,
      reason = 'Academic credential revoked by issuing authority',
      issuerPrivateKey = CONFIG.DEMO_ISSUER_PRIVATE_KEY,
    } = req.body;

    if (!credentialId && !statusId) {
      return res.status(400).json({
        success: false,
        error: 'Either credentialId or statusId is required for revocation',
      });
    }

    const effectiveStatusId =
      statusId || computeCredentialStatusId(credentialId);

    const txResult = await revokeCredentialOnChain(
      effectiveStatusId,
      reason,
      issuerPrivateKey
    );

    // Update off-chain store
    if (credentialId) {
      credentialStore.updateStatus(credentialId, true, reason);
    }

    return res.json({
      success: true,
      message: 'Credential successfully revoked on-chain',
      statusId: effectiveStatusId,
      transactionHash: txResult.transactionHash,
      blockNumber: txResult.blockNumber,
      revocationReason: reason,
    });
  } catch (err: any) {
    console.error('Error revoking credential:', err);
    return res.status(500).json({
      success: false,
      error: `Revocation failed: ${err.message || String(err)}`,
    });
  }
});

/**
 * Returns all issued credentials tracked in the demo store.
 */
router.get('/issued', (_req: Request, res: Response) => {
  const credentials = credentialStore.getAll();
  return res.json({
    success: true,
    total: credentials.length,
    credentials,
  });
});

/**
 * Returns sample credentials for quick demonstration in the wallet / verifier.
 */
router.get('/sample', async (_req: Request, res: Response) => {
  try {
    let existing = credentialStore.getAll();
    if (existing.length === 0) {
      // Seed initial sample demo credential
      const sampleUrn = 'urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const statusId = computeCredentialStatusId(sampleUrn);
      const deployment = getContractDeployment();
      const statusRegistryAddress =
        deployment?.contracts?.CredentialStatusRegistry?.address || ethers.ZeroAddress;

      const unsigned: Omit<TrustIdVerifiableCredential, 'proof'> = {
        '@context': [
          'https://www.w3.org/ns/credentials/v2',
          'https://trustid.gov.in/contexts/v2',
        ],
        id: sampleUrn,
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        issuer: {
          id: `did:ethr:${normalizeAddress(new ethers.Wallet(CONFIG.DEMO_ISSUER_PRIVATE_KEY).address)}`,
          name: 'Indian Institute of Technology Bombay — DEMO',
        },
        validFrom: '2026-06-15T00:00:00Z',
        validUntil: '2036-06-15T00:00:00Z',
        credentialSubject: {
          id: 'did:example:student-aarav-sharma-1001',
          name: 'Aarav Sharma — DEMO',
          studentId: 'BT-CS-2023-042',
          institution: 'Indian Institute of Technology Bombay — DEMO',
          degree: 'Bachelor of Technology',
          programme: 'Computer Science & Engineering',
          enrollmentStatus: 'Active',
          cgpa: '9.24',
          graduationYear: 2026,
        },
        credentialStatus: {
          id: statusId,
          type: 'EthereumCredentialStatusList2026',
          statusRegistryContract: statusRegistryAddress,
          statusPurpose: 'revocation',
        },
      };

      const signed = await signCredential(unsigned, CONFIG.DEMO_ISSUER_PRIVATE_KEY);
      credentialStore.add({
        credential: signed,
        statusId,
        isRevoked: false,
        issuedAt: new Date().toISOString(),
      });
      existing = credentialStore.getAll();
    }

    return res.json({
      success: true,
      sample: existing[0]?.credential || null,
      allSamples: existing.map((e) => e.credential),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
