import { expect } from 'chai';
import { ethers } from 'ethers';
import {
  signCredential,
  verifyCredentialSignature,
  computeCredentialStatusId,
} from '../services/crypto';
import { verifyVerifiableCredential } from '../services/verificationEngine';
import { TrustIdVerifiableCredential } from '../../../shared/types/credential';

describe('TrustID India - Credential Cryptography & Verification Engine Tests', function () {
  const testIssuerWallet = ethers.Wallet.createRandom();
  const testStudentId = 'BT-CS-2023-042';

  let baseValidCredential: TrustIdVerifiableCredential;

  before(async function () {
    const unsigned = {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
        'https://trustid.gov.in/contexts/v2',
      ],
      id: 'urn:uuid:test-academic-credential-1001',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: {
        id: `did:ethr:${testIssuerWallet.address}`,
        name: 'Indian Institute of Technology Bombay — DEMO',
      },
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2036-01-01T00:00:00Z',
      credentialSubject: {
        id: 'did:example:student-aarav-sharma',
        name: 'Aarav Sharma — DEMO',
        studentId: testStudentId,
        institution: 'Indian Institute of Technology Bombay — DEMO',
        degree: 'Bachelor of Technology',
        programme: 'Computer Science & Engineering',
        enrollmentStatus: 'Active' as const,
        cgpa: '9.24',
        graduationYear: 2026,
      },
      credentialStatus: {
        id: computeCredentialStatusId('urn:uuid:test-academic-credential-1001'),
        type: 'EthereumCredentialStatusList2026' as const,
        statusRegistryContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        statusPurpose: 'revocation' as const,
      },
    };

    baseValidCredential = await signCredential(unsigned, testIssuerWallet.privateKey);
  });

  it('1. Cryptographic Signature: should compute valid signature and recover issuer address', function () {
    const sigCheck = verifyCredentialSignature(baseValidCredential);
    expect(sigCheck.isValid).to.be.true;
    expect(sigCheck.signerAddress?.toLowerCase()).to.equal(testIssuerWallet.address.toLowerCase());
    expect(sigCheck.canonicalDigest).to.be.a('string').with.length(66);
  });

  it('2. Tamper Detection: should FAIL signature verification if a claim is modified', function () {
    // Alter the programme from Computer Science to Artificial Intelligence
    const tamperedVc: TrustIdVerifiableCredential = JSON.parse(JSON.stringify(baseValidCredential));
    tamperedVc.credentialSubject.programme = 'Artificial Intelligence & Data Science';

    const sigCheck = verifyCredentialSignature(tamperedVc);
    expect(sigCheck.isValid).to.be.false;
    expect(sigCheck.signerAddress?.toLowerCase()).to.not.equal(testIssuerWallet.address.toLowerCase());
  });

  it('3. Tamper Detection: should FAIL signature verification if subject name or CGPA is altered', function () {
    const tamperedVc: TrustIdVerifiableCredential = JSON.parse(JSON.stringify(baseValidCredential));
    tamperedVc.credentialSubject.cgpa = '9.99';

    const sigCheck = verifyCredentialSignature(tamperedVc);
    expect(sigCheck.isValid).to.be.false;
  });

  it('4. Structural Validation: should REJECT malformed credentials missing required fields', async function () {
    const malformed = {
      id: 'incomplete-credential',
      type: ['VerifiableCredential'],
    };

    const report = await verifyVerifiableCredential(malformed);
    expect(report.isValid).to.be.false;
    expect(report.overallOutcome).to.equal('INVALID CREDENTIAL STRUCTURE');
    expect(report.checks.structural.status).to.equal('FAILED');
  });

  it('5. Untrusted Issuer: should REJECT credential when issuer is not authorized in registry', async function () {
    // When skipBlockchainChecks is not passed and contract is not deployed, issuer is untrusted
    const report = await verifyVerifiableCredential(baseValidCredential);
    expect(report.isValid).to.be.false;
    expect(report.overallOutcome).to.equal('UNTRUSTED ISSUER');
    expect(report.checks.issuerTrust.status).to.equal('FAILED');
  });

  it('6. Temporal Validity: should REJECT expired credentials', async function () {
    const expiredUnsigned = {
      ...baseValidCredential,
      id: 'urn:uuid:expired-credential-001',
      validFrom: '2020-01-01T00:00:00Z',
      validUntil: '2021-01-01T00:00:00Z', // In the past!
    };
    delete (expiredUnsigned as any).proof;

    const expiredVc = await signCredential(expiredUnsigned, testIssuerWallet.privateKey);
    const report = await verifyVerifiableCredential(expiredVc, { skipBlockchainChecks: true });

    expect(report.isValid).to.be.false;
    expect(report.overallOutcome).to.equal('EXPIRED CREDENTIAL');
    expect(report.checks.expiration.status).to.equal('FAILED');
  });

  it('7. Policy Claims Validation: should REJECT credential when required claim fails', async function () {
    const suspendedUnsigned = {
      ...baseValidCredential,
      id: 'urn:uuid:suspended-student-001',
      credentialSubject: {
        ...baseValidCredential.credentialSubject,
        enrollmentStatus: 'Suspended' as any,
      },
    };
    delete (suspendedUnsigned as any).proof;

    const suspendedVc = await signCredential(suspendedUnsigned, testIssuerWallet.privateKey);

    const report = await verifyVerifiableCredential(suspendedVc, {
      requiredEnrollmentStatus: 'Active',
      requireActiveStatus: true,
      skipBlockchainChecks: true,
    });

    expect(report.isValid).to.be.false;
    expect(report.overallOutcome).to.equal('REQUIRED CLAIM MISSING');
    expect(report.checks.claimValidation.status).to.equal('FAILED');
  });

  it('8. Valid Verification: should pass all checks when credential is authentic and claims match', async function () {
    const report = await verifyVerifiableCredential(baseValidCredential, {
      skipBlockchainChecks: true,
      requireActiveStatus: true,
    });

    expect(report.isValid).to.be.true;
    expect(report.overallOutcome).to.equal('VALID');
    expect(report.checks.structural.status).to.equal('PASSED');
    expect(report.checks.signature.status).to.equal('PASSED');
    expect(report.checks.issuerTrust.status).to.equal('PASSED');
    expect(report.checks.expiration.status).to.equal('PASSED');
    expect(report.checks.revocation.status).to.equal('PASSED');
    expect(report.checks.claimValidation.status).to.equal('PASSED');
    expect(report.auditTrail).to.be.an('array').with.length.greaterThan(0);
  });
});
