import React, { createContext, useContext, useState, useEffect } from 'react';
import { TrustIdVerifiableCredential } from '../types';
import { fetchSampleCredential, resetDemoApi } from '../services/api';
import { saveCredentialToWallet, clearStudentWallet } from '../services/walletStorage';

export interface DemoStep {
  id: string;
  stepNumber: number;
  letter: string; // A through J
  title: string;
  objective: string;
  actionDescription: string;
  expectedResult: string;
  underlyingConcept: string;
  route: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'demo-a',
    stepNumber: 1,
    letter: 'A',
    title: 'Register University Issuer',
    objective: 'Establish institutional accreditation in the decentralized smart contract registry.',
    actionDescription: 'Connect as governance governor and register IIT Bombay as an authorized academic issuer on-chain.',
    expectedResult: 'Issuer status updates to AUTHORIZED and an IssuerRegistered event is emitted onto the blockchain.',
    underlyingConcept: 'Decentralized Trust Registries: Instead of relying on a centralized proprietary database, verifiers query an open smart contract registry to verify that a credential was signed by an accredited institution.',
    route: '/issuer',
  },
  {
    id: 'demo-b',
    stepNumber: 2,
    letter: 'B',
    title: 'Issue Digitally Signed Credential',
    objective: 'Issue a tamper-evident academic credential adhering to W3C Verifiable Credentials Data Model 2.0.',
    actionDescription: 'Fill in the student academic details, sign with the university private key, and register the opaque credential status ID on-chain.',
    expectedResult: 'A signed W3C VC 2.0 JSON is produced containing an EcdsaSecp256k1 proof, and an on-chain CredentialRegistered event is mined.',
    underlyingConcept: 'Cryptographic Proofs vs Storing Personal Data on Blockchain: Personal claims (student name, CGPA, degree) are NEVER put on-chain. Only an unlinkable status hash is registered on the ledger.',
    route: '/issuer',
  },
  {
    id: 'demo-c',
    stepNumber: 3,
    letter: 'C',
    title: 'Hold Credential in Student Wallet',
    objective: 'Demonstrate self-sovereign holder custody: student controls their credential off-chain.',
    actionDescription: 'Inspect the newly issued credential inside the student digital wallet and view its cryptographic claims.',
    expectedResult: 'Credential is displayed as locally held. The student can inspect claims, export JSON, or present it to verifiers.',
    underlyingConcept: 'Self-Sovereign Identity (SSI): The student holds their own credentials independently of the issuing university. Even if the university portal goes down, the student retains cryptographic ownership.',
    route: '/wallet',
  },
  {
    id: 'demo-d',
    stepNumber: 4,
    letter: 'D',
    title: 'Verify Credential Successfully',
    objective: 'Demonstrate independent verification by a third-party scholarship provider or employer.',
    actionDescription: 'Present the student credential to the Verification Portal and run the complete 7-stage verification engine.',
    expectedResult: 'All 7 independent checks PASS: Structure, Signature, Issuer Trust, Temporal, Revocation Status, and Eligibility Claims.',
    underlyingConcept: 'The Trust Triangle: Verifier independently validates the credential directly using cryptography and the blockchain registry without contacting or calling the issuing university.',
    route: '/verify',
  },
  {
    id: 'demo-e',
    stepNumber: 5,
    letter: 'E',
    title: 'Demonstrate Cryptographic Tampering',
    objective: 'Prove that even a single-character modification to a claim breaks cryptographic verification.',
    actionDescription: 'Modify the degree programme from "B.Tech Computer Science" to "B.Tech Artificial Intelligence" and re-verify.',
    expectedResult: 'Signature validation FAILS with an INVALID SIGNATURE error. Shows exact SHA-256 hash mismatch.',
    underlyingConcept: 'Digital Signatures & Tamper-Evidence: The digital signature was computed over the SHA-256 digest of canonical claims. Changing any character alters the hash, causing public key recovery to fail.',
    route: '/tamper-demo',
  },
  {
    id: 'demo-f',
    stepNumber: 6,
    letter: 'F',
    title: 'Restore Original Credential',
    objective: 'Demonstrate that the original untampered credential remains valid and passes verification.',
    actionDescription: 'Restore the original credential claims and run verification again.',
    expectedResult: 'Cryptographic verification succeeds: CREDENTIAL VERIFIED.',
    underlyingConcept: 'Deterministic Integrity: Cryptographic verification is mathematical and reproducible. The original signature remains completely valid.',
    route: '/tamper-demo',
  },
  {
    id: 'demo-g',
    stepNumber: 7,
    letter: 'G',
    title: 'Revoke Credential on Blockchain',
    objective: 'Demonstrate institutional lifecycle management: an authorized university revokes a credential.',
    actionDescription: 'Issuer triggers on-chain revocation in CredentialStatusRegistry with reason "Disciplinary Sanction".',
    expectedResult: 'Transaction is mined on Hardhat EVM and a CredentialRevoked event is emitted. The credential status flips to revoked.',
    underlyingConcept: 'On-Chain Status Registry: Revocation is recorded on a transparent decentralized registry without altering the off-chain credential file in the student wallet.',
    route: '/revocation-demo',
  },
  {
    id: 'demo-h',
    stepNumber: 8,
    letter: 'H',
    title: 'Verify Revoked Credential',
    objective: 'Prove that verifiers catch revoked credentials even when the signature is mathematically intact.',
    actionDescription: 'Submit the revoked credential to the verification portal.',
    expectedResult: 'Check 2 (Signature) is VALID, but Check 5 (Revocation Status) FAILS. Overall: REVOKED CREDENTIAL.',
    underlyingConcept: 'Signature Validity != Credential Validity: A valid signature only proves the credential was genuine when issued. Verifiers MUST independently consult the status registry to check current status.',
    route: '/verify',
  },
  {
    id: 'demo-i',
    stepNumber: 9,
    letter: 'I',
    title: 'Inspect Blockchain Activity Logs',
    objective: 'Examine transparent decentralized audit logs and smart contract events.',
    actionDescription: 'Open the Blockchain Activity page and inspect real event logs with transaction hashes and block numbers.',
    expectedResult: 'Real events displayed: IssuerRegistered, CredentialRegistered, and CredentialRevoked with timestamps and decoded parameters.',
    underlyingConcept: 'Public Auditability without PII: Third parties can verify that credential lifecycle events occurred without revealing student names or marks.',
    route: '/activity',
  },
  {
    id: 'demo-j',
    stepNumber: 10,
    letter: 'J',
    title: 'Off-Chain Privacy vs On-Chain Registry',
    objective: 'Understand the architectural boundary between private data and public blockchain state.',
    actionDescription: 'Review the architecture diagram and educational comparison contrasting TrustID with Aadhaar and DigiLocker.',
    expectedResult: 'Clear understanding of SSI principles, cryptographic security boundaries, and responsible deployment limitations.',
    underlyingConcept: 'Privacy by Design: Blockchain is a decentralized public bulletin board for trust and revocation, while sensitive personal identity data remains strictly off-chain under student custody.',
    route: '/architecture',
  },
];

interface DemoContextType {
  currentStepIndex: number;
  currentStep: DemoStep;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  activeDemoCredential: TrustIdVerifiableCredential | null;
  setActiveDemoCredential: (vc: TrustIdVerifiableCredential | null) => void;
  resetAllDemoState: () => Promise<void>;
  isResetting: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeDemoCredential, setActiveDemoCredential] = useState<TrustIdVerifiableCredential | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Initialize sample demo credential on mount
  useEffect(() => {
    fetchSampleCredential()
      .then((data) => {
        if (data.success && data.sample) {
          setActiveDemoCredential(data.sample);
          saveCredentialToWallet(data.sample, 'SAMPLE');
        }
      })
      .catch((err) => console.warn('Could not prefetch sample credential:', err));
  }, []);

  const goToStep = (index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      setCurrentStepIndex(index);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const resetAllDemoState = async () => {
    setIsResetting(true);
    try {
      await resetDemoApi();
      clearStudentWallet();
      const freshSample = await fetchSampleCredential();
      if (freshSample.success && freshSample.sample) {
        setActiveDemoCredential(freshSample.sample);
        saveCredentialToWallet(freshSample.sample, 'SAMPLE');
      }
      setCurrentStepIndex(0);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        currentStepIndex,
        currentStep: DEMO_STEPS[currentStepIndex],
        goToStep,
        nextStep,
        prevStep,
        activeDemoCredential,
        setActiveDemoCredential,
        resetAllDemoState,
        isResetting,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
