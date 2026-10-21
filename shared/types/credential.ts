/**
 * TrustID India - W3C Verifiable Credential 2.0 Data Model Definitions
 * Reference: https://www.w3.org/TR/vc-data-model-2.0/
 */

export interface CredentialSubject {
  id: string; // e.g. did:example:student-aarav-sharma-1001
  name: string;
  studentId: string;
  institution: string;
  degree: string;
  programme: string;
  enrollmentStatus: 'Active' | 'Graduated' | 'Suspended' | 'Withdrawn';
  cgpa?: string;
  graduationYear?: number;
  department?: string;
  [key: string]: unknown;
}

export interface CredentialIssuer {
  id: string; // e.g. did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  name: string;
  url?: string;
  location?: string;
}

export interface CredentialStatusReference {
  id: string; // Opaque 32-byte hex string or identifier
  type: 'EthereumCredentialStatusList2026' | 'OnChainStatusRegistry';
  statusRegistryContract: string; // Ethereum contract address
  statusPurpose: 'revocation' | 'suspension';
}

export interface CryptographicProof {
  type: 'EcdsaSecp256k1RecoverySignature2020' | 'JsonWebSignature2020';
  created: string;
  verificationMethod: string; // did:ethr:0x...#controller
  proofPurpose: 'assertionMethod';
  proofValue: string; // Hex-encoded signature string
  jws?: string;
}

export interface TrustIdVerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: CredentialIssuer;
  validFrom: string;
  validUntil?: string;
  credentialSubject: CredentialSubject;
  credentialStatus: CredentialStatusReference;
  proof: CryptographicProof;
}

export type VerificationCheckStatus = 'PASSED' | 'FAILED' | 'SKIPPED' | 'WARNING';

export interface VerificationCheckDetail {
  status: VerificationCheckStatus;
  label: string;
  message: string;
  details?: Record<string, unknown>;
}

export type OverallVerificationOutcome =
  | 'VALID'
  | 'INVALID SIGNATURE'
  | 'UNTRUSTED ISSUER'
  | 'EXPIRED CREDENTIAL'
  | 'REVOKED CREDENTIAL'
  | 'INVALID CREDENTIAL STRUCTURE'
  | 'REQUIRED CLAIM MISSING'
  | 'STATUS COULD NOT BE VERIFIED';

export interface VerificationReport {
  isValid: boolean;
  overallOutcome: OverallVerificationOutcome;
  summaryMessage: string;
  verifiedAt: string;
  verifier: {
    name: string;
    organization: string;
    requiredClaims: {
      enrollmentStatus?: string;
      minimumDegree?: string;
    };
  };
  checks: {
    structural: VerificationCheckDetail;
    signature: VerificationCheckDetail;
    issuerTrust: VerificationCheckDetail;
    expiration: VerificationCheckDetail;
    revocation: VerificationCheckDetail;
    claimValidation: VerificationCheckDetail;
  };
  credentialSummary?: {
    id: string;
    studentName: string;
    studentId: string;
    institution: string;
    degree: string;
    programme: string;
    enrollmentStatus: string;
    issuerAddress: string;
    issueDate: string;
    expirationDate?: string;
  };
  auditTrail: {
    step: string;
    timestamp: string;
    status: 'SUCCESS' | 'ERROR';
    info: string;
  }[];
}

export interface BlockchainEventLog {
  id: string;
  eventName: 'IssuerRegistered' | 'IssuerAuthorized' | 'IssuerRevoked' | 'CredentialRegistered' | 'CredentialRevoked';
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  args: Record<string, unknown>;
  description: string;
}
