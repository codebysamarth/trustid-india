import {
  TrustIdVerifiableCredential,
  VerificationReport,
  OverallVerificationOutcome,
  VerificationCheckDetail,
} from '../types/credential';
import {
  verifyCredentialSignature,
  extractAddressFromDid,
  computeCredentialStatusId,
} from './crypto';
import {
  checkIssuerAuthorizationOnChain,
  checkCredentialStatusOnChain,
} from './blockchain';

export interface VerifierPolicy {
  verifierName?: string;
  organization?: string;
  requiredEnrollmentStatus?: string;
  requireActiveStatus?: boolean;
  skipBlockchainChecks?: boolean; // Useful for standalone/offline verification testing
}

export async function verifyVerifiableCredential(
  vc: unknown,
  policy: VerifierPolicy = {}
): Promise<VerificationReport> {
  const auditTrail: VerificationReport['auditTrail'] = [];
  const logStep = (step: string, status: 'SUCCESS' | 'ERROR', info: string) => {
    auditTrail.push({
      step,
      timestamp: new Date().toISOString(),
      status,
      info,
    });
  };

  const defaultVerifier = {
    name: policy.verifierName || 'National Merit Scholarship Portal — Verifier',
    organization: policy.organization || 'Ministry of Education & Academic Services',
    requiredClaims: {
      enrollmentStatus: policy.requiredEnrollmentStatus || 'Active',
    },
  };

  // CHECK 1: Structural Validation
  const structuralCheck: VerificationCheckDetail = {
    status: 'PASSED',
    label: 'W3C VC 2.0 Structural Conformance',
    message: 'Credential adheres to W3C Verifiable Credentials Data Model v2.0 specification',
  };

  if (!vc || typeof vc !== 'object') {
    structuralCheck.status = 'FAILED';
    structuralCheck.message = 'Credential input is not a valid JSON object';
    logStep('Structure Check', 'ERROR', structuralCheck.message);

    return generateReport(
      false,
      'INVALID CREDENTIAL STRUCTURE',
      'Structural validation failed: Malformed JSON payload',
      defaultVerifier,
      {
        structural: structuralCheck,
        signature: { status: 'SKIPPED', label: 'Cryptographic Proof', message: 'Skipped due to malformed structure' },
        issuerTrust: { status: 'SKIPPED', label: 'Issuer Trust Registry', message: 'Skipped' },
        expiration: { status: 'SKIPPED', label: 'Temporal Validity', message: 'Skipped' },
        revocation: { status: 'SKIPPED', label: 'On-Chain Revocation Status', message: 'Skipped' },
        claimValidation: { status: 'SKIPPED', label: 'Verifier Policy Claims', message: 'Skipped' },
      },
      auditTrail
    );
  }

  const rawVc = vc as any;
  const missingFields: string[] = [];

  if (!rawVc['@context'] || !Array.isArray(rawVc['@context'])) missingFields.push('@context (Array)');
  if (!rawVc.id || typeof rawVc.id !== 'string') missingFields.push('id (URI/URN string)');
  if (!rawVc.type || !Array.isArray(rawVc.type) || !rawVc.type.includes('VerifiableCredential')) {
    missingFields.push('type (must contain "VerifiableCredential")');
  }
  if (!rawVc.issuer || (!rawVc.issuer.id && typeof rawVc.issuer !== 'string')) {
    missingFields.push('issuer (object with id or DID string)');
  }
  if (!rawVc.credentialSubject || typeof rawVc.credentialSubject !== 'object') {
    missingFields.push('credentialSubject (object)');
  }
  if (!rawVc.proof || typeof rawVc.proof !== 'object' || !rawVc.proof.proofValue) {
    missingFields.push('proof (object with cryptographic proofValue)');
  }

  if (missingFields.length > 0) {
    structuralCheck.status = 'FAILED';
    structuralCheck.message = `Credential is missing required W3C properties: ${missingFields.join(', ')}`;
    logStep('Structure Check', 'ERROR', structuralCheck.message);

    return generateReport(
      false,
      'INVALID CREDENTIAL STRUCTURE',
      `Credential failed structural validation: Missing ${missingFields.join(', ')}`,
      defaultVerifier,
      {
        structural: structuralCheck,
        signature: { status: 'SKIPPED', label: 'Cryptographic Proof', message: 'Skipped' },
        issuerTrust: { status: 'SKIPPED', label: 'Issuer Trust Registry', message: 'Skipped' },
        expiration: { status: 'SKIPPED', label: 'Temporal Validity', message: 'Skipped' },
        revocation: { status: 'SKIPPED', label: 'On-Chain Revocation Status', message: 'Skipped' },
        claimValidation: { status: 'SKIPPED', label: 'Verifier Policy Claims', message: 'Skipped' },
      },
      auditTrail
    );
  }

  logStep('Structure Check', 'SUCCESS', 'W3C VC schema and mandatory properties verified');

  const typedVc = rawVc as TrustIdVerifiableCredential;
  const credentialSummary = {
    id: typedVc.id,
    studentName: typedVc.credentialSubject.name || 'Unknown Subject',
    studentId: typedVc.credentialSubject.studentId || 'N/A',
    institution: typedVc.issuer.name || typedVc.credentialSubject.institution || 'Unknown Institution',
    degree: typedVc.credentialSubject.degree || 'Degree Credential',
    programme: typedVc.credentialSubject.programme || 'N/A',
    enrollmentStatus: typedVc.credentialSubject.enrollmentStatus || 'Unknown',
    issuerAddress: extractAddressFromDid(typedVc.issuer.id) || 'Unknown',
    issueDate: typedVc.validFrom,
    expirationDate: typedVc.validUntil,
  };

  // CHECK 2: Signature Validation
  const sigResult = verifyCredentialSignature(typedVc);
  const signatureCheck: VerificationCheckDetail = {
    status: sigResult.isValid ? 'PASSED' : 'FAILED',
    label: 'Cryptographic Signature & Authenticity',
    message: sigResult.isValid
      ? `Cryptographically authentic: Signature recovered address ${sigResult.signerAddress} matches declared issuer DID`
      : sigResult.error || 'Cryptographic signature is INVALID. Digest does not match signature.',
    details: {
      recoveredSigner: sigResult.signerAddress,
      expectedIssuer: sigResult.expectedAddress,
      canonicalDigest: sigResult.canonicalDigest,
      algorithm: typedVc.proof?.type || 'EcdsaSecp256k1RecoverySignature2020',
    },
  };

  if (!sigResult.isValid) {
    logStep('Signature Validation', 'ERROR', signatureCheck.message);
    return generateReport(
      false,
      'INVALID SIGNATURE',
      'Cryptographic verification failed: The credential signature does not match the canonical claim digest. The credential has likely been tampered with or forged.',
      defaultVerifier,
      {
        structural: structuralCheck,
        signature: signatureCheck,
        issuerTrust: { status: 'SKIPPED', label: 'Issuer Trust Registry', message: 'Skipped due to invalid signature' },
        expiration: { status: 'SKIPPED', label: 'Temporal Validity', message: 'Skipped' },
        revocation: { status: 'SKIPPED', label: 'On-Chain Revocation Status', message: 'Skipped' },
        claimValidation: { status: 'SKIPPED', label: 'Verifier Policy Claims', message: 'Skipped' },
      },
      auditTrail,
      credentialSummary
    );
  }
  logStep('Signature Validation', 'SUCCESS', `Recovered signer ${sigResult.signerAddress} verified`);

  // CHECK 3: Issuer Authorization via On-Chain Registry
  const issuerAddress = sigResult.signerAddress!;
  const issuerOnChainStatus = policy.skipBlockchainChecks
    ? { isAuthorized: true, isRegistered: true, name: typedVc.issuer.name }
    : await checkIssuerAuthorizationOnChain(issuerAddress);

  const issuerTrustCheck: VerificationCheckDetail = {
    status: issuerOnChainStatus.isAuthorized ? 'PASSED' : 'FAILED',
    label: 'Institutional Issuer Accreditation & Trust',
    message: issuerOnChainStatus.isAuthorized
      ? `Issuer ${issuerAddress} (${issuerOnChainStatus.name || typedVc.issuer.name}) is accredited and authorized in IssuerRegistry`
      : `Issuer address ${issuerAddress} is NOT an authorized institution in the smart contract registry`,
    details: {
      issuerAddress,
      isRegistered: issuerOnChainStatus.isRegistered,
      isAuthorized: issuerOnChainStatus.isAuthorized,
      institutionName: issuerOnChainStatus.name || typedVc.issuer.name,
    },
  };

  if (!issuerOnChainStatus.isAuthorized) {
    logStep('Issuer Trust Registry', 'ERROR', issuerTrustCheck.message);
    return generateReport(
      false,
      'UNTRUSTED ISSUER',
      `Untrusted Issuer: The signing key (${issuerAddress}) is not authorized in the decentralized IssuerRegistry.`,
      defaultVerifier,
      {
        structural: structuralCheck,
        signature: signatureCheck,
        issuerTrust: issuerTrustCheck,
        expiration: { status: 'SKIPPED', label: 'Temporal Validity', message: 'Skipped' },
        revocation: { status: 'SKIPPED', label: 'On-Chain Revocation Status', message: 'Skipped' },
        claimValidation: { status: 'SKIPPED', label: 'Verifier Policy Claims', message: 'Skipped' },
      },
      auditTrail,
      credentialSummary
    );
  }
  logStep('Issuer Trust Registry', 'SUCCESS', `Accredited issuer confirmed: ${issuerOnChainStatus.name}`);

  // CHECK 4: Temporal Validity (Expiration)
  const now = new Date();
  const validFrom = typedVc.validFrom ? new Date(typedVc.validFrom) : null;
  const validUntil = typedVc.validUntil ? new Date(typedVc.validUntil) : null;

  let expirationPassed = true;
  let expirationMessage = 'Credential is within its designated validity window';

  if (validFrom && isNaN(validFrom.getTime())) {
    expirationPassed = false;
    expirationMessage = 'Invalid validFrom date format';
  } else if (validFrom && validFrom > now) {
    expirationPassed = false;
    expirationMessage = `Credential is not yet valid (validFrom: ${typedVc.validFrom})`;
  } else if (validUntil && !isNaN(validUntil.getTime()) && validUntil < now) {
    expirationPassed = false;
    expirationMessage = `Credential expired on ${typedVc.validUntil}`;
  } else if (!validUntil) {
    expirationMessage = 'Credential has no expiration date (perpetual validity permitted by W3C specification)';
  }

  const expirationCheck: VerificationCheckDetail = {
    status: expirationPassed ? 'PASSED' : 'FAILED',
    label: 'Temporal Expiration & Validity Period',
    message: expirationMessage,
    details: {
      validFrom: typedVc.validFrom,
      validUntil: typedVc.validUntil || 'No expiration set (perpetual)',
      verifiedAt: now.toISOString(),
    },
  };

  if (!expirationPassed) {
    logStep('Temporal Check', 'ERROR', expirationMessage);
    return generateReport(
      false,
      'EXPIRED CREDENTIAL',
      `Credential validity expired: ${expirationMessage}`,
      defaultVerifier,
      {
        structural: structuralCheck,
        signature: signatureCheck,
        issuerTrust: issuerTrustCheck,
        expiration: expirationCheck,
        revocation: { status: 'SKIPPED', label: 'On-Chain Revocation Status', message: 'Skipped' },
        claimValidation: { status: 'SKIPPED', label: 'Verifier Policy Claims', message: 'Skipped' },
      },
      auditTrail,
      credentialSummary
    );
  }
  logStep('Temporal Check', 'SUCCESS', expirationMessage);

  // CHECK 5: On-Chain Revocation / Status Check
  const statusIdBytes32 =
    typedVc.credentialStatus?.id && typedVc.credentialStatus.id.startsWith('0x') && typedVc.credentialStatus.id.length === 66
      ? typedVc.credentialStatus.id
      : computeCredentialStatusId(typedVc.id);

  const onChainStatus = policy.skipBlockchainChecks
    ? { isRegistered: true, isRevoked: false, isIssuerStillAuthorized: true, issuerAddress, registeredAt: 1700000000, revokedAt: 0, revocationReason: '' }
    : await checkCredentialStatusOnChain(statusIdBytes32);

  let revocationCheck: VerificationCheckDetail;

  if (onChainStatus.isRevoked) {
    revocationCheck = {
      status: 'FAILED',
      label: 'Decentralized Revocation Status',
      message: `Credential REVOKED on blockchain at block timestamp ${onChainStatus.revokedAt}. Reason: "${onChainStatus.revocationReason || 'Revoked by issuer'}"`,
      details: {
        credentialStatusId: statusIdBytes32,
        isRevoked: true,
        revokedAt: new Date(onChainStatus.revokedAt * 1000).toISOString(),
        revocationReason: onChainStatus.revocationReason,
      },
    };

    logStep('Revocation Check', 'ERROR', revocationCheck.message);
    return generateReport(
      false,
      'REVOKED CREDENTIAL',
      `Credential has been explicitly revoked on-chain: "${onChainStatus.revocationReason || 'Revoked by issuing authority'}".`,
      defaultVerifier,
      {
        structural: structuralCheck,
        signature: signatureCheck,
        issuerTrust: issuerTrustCheck,
        expiration: expirationCheck,
        revocation: revocationCheck,
        claimValidation: { status: 'SKIPPED', label: 'Verifier Policy Claims', message: 'Skipped' },
      },
      auditTrail,
      credentialSummary
    );
  } else if (!onChainStatus.isRegistered) {
    // If not registered in the smart contract registry
    revocationCheck = {
      status: 'WARNING',
      label: 'Decentralized Revocation Status',
      message: 'Credential identifier not explicitly indexed in status registry. No revocation record found.',
      details: {
        credentialStatusId: statusIdBytes32,
        isRegistered: false,
      },
    };
    logStep('Revocation Check', 'SUCCESS', 'No on-chain revocation flag found');
  } else {
    revocationCheck = {
      status: 'PASSED',
      label: 'Decentralized Revocation Status',
      message: 'ACTIVE: Verified against on-chain CredentialStatusRegistry contract. Not revoked.',
      details: {
        credentialStatusId: statusIdBytes32,
        isRegistered: true,
        isRevoked: false,
        registeredAt: new Date(onChainStatus.registeredAt * 1000).toISOString(),
      },
    };
    logStep('Revocation Check', 'SUCCESS', 'Active on-chain credential status confirmed');
  }

  // CHECK 6: Claim Validation (Verifier Policy)
  const requiredEnrollment = policy.requiredEnrollmentStatus || 'Active';
  const actualEnrollment = typedVc.credentialSubject.enrollmentStatus;
  const isEnrollmentValid =
    !policy.requireActiveStatus ||
    (actualEnrollment && actualEnrollment.toLowerCase() === requiredEnrollment.toLowerCase());

  const claimCheck: VerificationCheckDetail = {
    status: isEnrollmentValid ? 'PASSED' : 'FAILED',
    label: 'Verifier Policy & Eligibility Claims',
    message: isEnrollmentValid
      ? `Subject meets verifier criteria: Enrollment status is "${actualEnrollment}"`
      : `Enrollment requirement failed: Expected "${requiredEnrollment}", but credential states "${actualEnrollment}"`,
    details: {
      requiredStatus: requiredEnrollment,
      actualStatus: actualEnrollment,
      subjectName: typedVc.credentialSubject.name,
      studentId: typedVc.credentialSubject.studentId,
      programme: typedVc.credentialSubject.programme,
    },
  };

  if (!isEnrollmentValid) {
    logStep('Claim Validation', 'ERROR', claimCheck.message);
    return generateReport(
      false,
      'REQUIRED CLAIM MISSING',
      `Verifier policy criteria not met: Enrollment status is "${actualEnrollment}" (required: "${requiredEnrollment}").`,
      defaultVerifier,
      {
        structural: structuralCheck,
        signature: signatureCheck,
        issuerTrust: issuerTrustCheck,
        expiration: expirationCheck,
        revocation: revocationCheck,
        claimValidation: claimCheck,
      },
      auditTrail,
      credentialSummary
    );
  }

  logStep('Claim Validation', 'SUCCESS', 'All required policy claims verified');

  // CHECK 7: Final Overall Result
  return generateReport(
    true,
    'VALID',
    'CREDENTIAL VERIFIED: All cryptographic, smart contract trust registry, temporal, and claim checks successfully validated.',
    defaultVerifier,
    {
      structural: structuralCheck,
      signature: signatureCheck,
      issuerTrust: issuerTrustCheck,
      expiration: expirationCheck,
      revocation: revocationCheck,
      claimValidation: claimCheck,
    },
    auditTrail,
    credentialSummary
  );
}

function generateReport(
  isValid: boolean,
  outcome: OverallVerificationOutcome,
  summaryMessage: string,
  verifier: VerificationReport['verifier'],
  checks: VerificationReport['checks'],
  auditTrail: VerificationReport['auditTrail'],
  credentialSummary?: VerificationReport['credentialSummary']
): VerificationReport {
  return {
    isValid,
    overallOutcome: outcome,
    summaryMessage,
    verifiedAt: new Date().toISOString(),
    verifier,
    checks,
    credentialSummary,
    auditTrail,
  };
}
