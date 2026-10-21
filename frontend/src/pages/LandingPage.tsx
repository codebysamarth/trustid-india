import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  CheckCircle2,
  Lock,
  Database,
  EyeOff,
  Flame,
  ArrowRight,
  FileCheck,
  FileX,
  Server,
  KeyRound,
  Users,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  Cpu,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-16 text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Blockchain-Assisted Self-Sovereign Identity (SSI) Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Trust Your Credentials, <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Not Just the Document.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            TrustID India demonstrates how digitally signed credentials and blockchain-assisted verification can simplify academic credential verification while reducing repeated document submissions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/60 transition"
            >
              <PlayCircle className="w-4 h-4" />
              Explore Guided Demo
            </Link>
            <Link
              to="/issuer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              Issue a Credential
            </Link>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verify a Credential
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto text-left">
            <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Standard</span>
              <p className="text-sm font-bold text-white mt-0.5">W3C VC Data Model 2.0</p>
            </div>
            <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Cryptography</span>
              <p className="text-sm font-bold text-cyan-300 mt-0.5">RFC 8785 + Secp256k1</p>
            </div>
            <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Privacy</span>
              <p className="text-sm font-bold text-emerald-300 mt-0.5">Off-Chain Custody (No PII)</p>
            </div>
            <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Status Check</span>
              <p className="text-sm font-bold text-indigo-300 mt-0.5">O(1) Smart Contract</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: The Problem with Traditional Verification */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
            Current Industry Challenges
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            The Problem with Traditional Document Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Traditional paper certificates and scanned PDFs rely on appearances rather than mathematical proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#131F42]/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FileX className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Trivial Forgery & PDF Alteration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scanned marksheets and PDFs can be effortlessly edited with free graphic software. Employers have no native mechanism to prove that grades or degrees weren't modified after issuance.
            </p>
          </div>

          <div className="bg-[#131F42]/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Slow, Costly Institutional Backchannels</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifying a degree currently requires background check agencies to email registrar desks, wait weeks for physical verification letters, and pay manual administration fees.
            </p>
          </div>

          <div className="bg-[#131F42]/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Repeated PII Over-Sharing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every job application demands submitting complete marksheets containing full date of birth, mother's name, and identification numbers, causing severe privacy leaks across hundreds of company databases.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: How Verifiable Credentials Work */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 bg-[#0E172E]/60 border border-slate-800/80 rounded-3xl p-8 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
              W3C VC Standard 2.0
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How Verifiable Credentials Work
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A Verifiable Credential (VC) is a machine-readable digital document containing identity or qualification claims combined with a cryptographic digital signature generated by the issuing authority.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Tamper-Evident:</strong> Changing even a single character in the credential invalidates the cryptographic proof.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Cryptographically Attributable:</strong> The signature ties the credential directly to the university's decentralized identifier (DID).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Instantly Verifiable:</strong> Third parties verify authenticity in milliseconds using open-source mathematics without calling the university.</span>
              </div>
            </div>
          </div>

          <div className="bg-[#070C18] border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[11px] text-slate-400">
              <span>W3C VC 2.0 Credential Structure</span>
              <span className="text-cyan-400 font-bold">Canonical JSON</span>
            </div>
            <pre className="text-cyan-200 text-[11px] leading-relaxed overflow-x-auto">
{`{
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  "id": "urn:uuid:7b3a4e...",
  "type": ["VerifiableCredential", "UniversityDegreeCredential"],
  "issuer": { "id": "did:ethr:0x7099...79C8", "name": "IIT Bombay" },
  "validFrom": "2026-06-15T00:00:00Z",
  "credentialSubject": {
    "name": "Aarav Sharma — DEMO",
    "degree": "Bachelor of Technology",
    "programme": "Computer Science & Engineering",
    "enrollmentStatus": "Active"
  },
  "credentialStatus": { "id": "0x4b7c...", "type": "EthereumStatusList" },
  "proof": {
    "type": "EcdsaSecp256k1RecoverySignature2020",
    "proofValue": "0x3f9a...81c2"
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* SECTION 3: The Trust Triangle Architecture */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
            SSI Core Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            The Trust Triangle: Issuer, Holder, and Verifier
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Decentralized identity decouples credential issuance from ongoing verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#131F42]/50 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                ACTOR 1
              </span>
              <GraduationCap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">University / Issuer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Signs academic claims using its private key and registers the credential status identifier onto the smart contract registry. Issues the credential directly to the student.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              Role: <strong>Issues & manages lifecycle</strong>
            </div>
          </div>

          <div className="bg-[#131F42]/50 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                ACTOR 2
              </span>
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Student / Holder</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Holds credentials in their private local wallet. The student retains full sovereignty over who sees the credential and presents it directly to scholarship portals or employers.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              Role: <strong>Owns & presents with consent</strong>
            </div>
          </div>

          <div className="bg-[#131F42]/50 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                ACTOR 3
              </span>
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Scholarship / Verifier</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Independently verifies the cryptographic signature, checks that the issuer is trusted in the smart contract registry, and validates that the credential has not been revoked.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              Role: <strong>Verifies without university callback</strong>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5: Role of Signatures & Role of Blockchain */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#131F42]/40 border border-slate-800 rounded-2xl p-7 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">The Role of Cryptographic Signatures</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The cryptographic signature provides <strong>integrity and authenticity</strong>. Using RFC 8785 JSON Canonicalization and Secp256k1 recovery, the signature guarantees that the claims have not been altered and were genuinely signed by the university's private key.
          </p>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">What Signatures Prove:</div>
            <div>• The document was created by the holder of the private key.</div>
            <div>• No fields or characters were altered since signing.</div>
          </div>
        </div>

        <div className="bg-[#131F42]/40 border border-slate-800 rounded-2xl p-7 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">The Role of Blockchain</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Blockchain is <strong>not</strong> the database where student documents are stored. Instead, the EVM blockchain acts as a decentralized trust and status registry: resolving institutional issuer authority and recording real-time revocation events.
          </p>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">What the Blockchain Provides:</div>
            <div>• Tamper-proof IssuerRegistry of authorized universities.</div>
            <div>• Real-time CredentialStatusRegistry for immediate revocation.</div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Privacy & Off-Chain Storage */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#131F42] to-cyan-950/40 border border-emerald-500/30 rounded-3xl p-8 sm:p-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <EyeOff className="w-3.5 h-3.5" />
              Privacy by Design Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Privacy and Off-Chain Credential Storage
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Public blockchains are immutable: once data is published, it can never be deleted or modified. Putting student names, grades, or personal identifiers on a public blockchain violates fundamental privacy laws (such as GDPR and India's DPDP Act 2023).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-[#0A1024]/80 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-rose-400">NEVER ON-CHAIN:</span>
                <p className="text-slate-400 mt-1">Student names, grades, Aadhaar, degree specifics, or personal identity documents.</p>
              </div>
              <div className="bg-[#0A1024]/80 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400">ON-CHAIN ONLY:</span>
                <p className="text-slate-400 mt-1">Authorized institutional wallet addresses and opaque 32-byte status hashes for revocation checks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Step-by-Step Interactive Demonstrations */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
            Interactive Technical Walkthrough
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Complete Step-by-Step Demonstration
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Experience each stage of the credential lifecycle with live cryptographic feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/issuer"
            className="group bg-[#131F42]/50 hover:bg-[#131F42] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-3 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">STEP 1 & 2</span>
              <GraduationCap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white">Issue Credential</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              University registers in IssuerRegistry and issues an authentic signed credential.
            </p>
            <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1 pt-1">
              Go to Issuer <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/wallet"
            className="group bg-[#131F42]/50 hover:bg-[#131F42] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 space-y-3 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">STEP 3 & 4</span>
              <FileCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white">Student Custody</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect off-chain storage in the student wallet and export or present credentials.
            </p>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 pt-1">
              Open Wallet <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/tamper-demo"
            className="group bg-[#131F42]/50 hover:bg-[#131F42] border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 space-y-3 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-400">STEP 5 & 6</span>
              <Flame className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white">Tamper Demo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Alter a claim in real-time and prove that signature verification immediately fails!
            </p>
            <div className="text-xs font-semibold text-rose-400 flex items-center gap-1 pt-1">
              Test Tampering <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/registry"
            className="group bg-[#131F42]/50 hover:bg-[#131F42] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400">STEP 7 & 8</span>
              <Database className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white">Revocation Demo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Revoke on-chain and demonstrate that valid signatures still fail verification.
            </p>
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 pt-1">
              Test Revocation <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 8: Limitations and Responsible Considerations */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#131F42]/30 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-white">
              Limitations and Responsible Deployment Considerations
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            This application is an educational prototype designed to demonstrate cryptographic concepts in a university laboratory. Real-world institutional deployment requires solving additional sociotechnical challenges:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-400 pt-2">
            <div className="space-y-1">
              <strong className="text-slate-200">1. Private Key Governance:</strong>
              <p>Universities must manage hardware security modules (HSM) to safeguard institutional signing keys from compromise.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-200">2. Lost Wallet Recovery:</strong>
              <p>Unlike centralized portals with "forgot password", decentralized SSI requires social recovery or guardian models.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-200">3. Distinction from DigiLocker:</strong>
              <p>DigiLocker is a centralized government-hosted repository. TrustID India demonstrates sovereign user custody where credentials exist locally.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
