import React from 'react';
import {
  ShieldCheck,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
  KeyRound,
  Database,
  Lock,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  Cpu,
  BookOpen,
  Info,
  Building2,
  Binary,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
            System Design & Cryptographic Foundations
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          TrustID India: Architecture & Self-Sovereign Identity (SSI) Deep Dive
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          A technical breakdown of Self-Sovereign Identity (SSI), W3C Verifiable Credentials (VCs), decentralized trust registries, and zero-PII blockchain architecture.
        </p>
      </div>

      {/* 1. The SSI Trust Triangle Diagram */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
            Decentralized Credential Architecture
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            The SSI Trust Triangle: Three Actors, Trustless Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            In traditional identity, verifiers must query the university's database. In SSI, verifiers audit the credential mathematically using open cryptography and the on-chain trust registry.
          </p>
        </div>

        {/* 3 Actor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Issuer */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                1. Issuer (University)
              </span>
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900">Accredited Institution</h3>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Signs degree with institutional private key (<code className="font-mono text-emerald-800 font-semibold text-[11px]">ECDSA Secp256k1</code> via MetaMask).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Registers opaque 32-byte status hash on <code className="font-mono text-emerald-800 font-semibold text-[11px]">CredentialStatusRegistry.sol</code>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Delivers signed W3C VC 2.0 directly to student wallet off-chain.</span>
              </li>
            </ul>
          </div>

          {/* 2. Holder */}
          <div className="bg-teal-50/40 border border-teal-200/80 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                2. Holder (Student)
              </span>
              <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900">Self-Sovereign Custody</h3>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Holds credential in private digital wallet off-chain in local browser storage.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Presents credentials directly to employers without asking university permission.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Retains permanent ownership even if the issuing university shuts down.</span>
              </li>
            </ul>
          </div>

          {/* 3. Verifier */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Verifier (Employer)
              </span>
              <div className="p-2 bg-slate-200 text-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900">Relying Party Portal</h3>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-600 font-bold">•</span>
                <span>Recovers university public key address directly from the digital signature.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-600 font-bold">•</span>
                <span>Checks on-chain accreditation in <code className="font-mono text-slate-800 font-semibold text-[11px]">IssuerRegistry.sol</code>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-600 font-bold">•</span>
                <span>Verifies live revocation state in <code className="font-mono text-slate-800 font-semibold text-[11px]">CredentialStatusRegistry.sol</code> in O(1) time.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Blockchain Trust Anchor Box */}
        <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <Cpu className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-900">
              Underlying Trust Registry: Consortium EVM Smart Contracts (Hardhat Node)
            </h4>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Acts as the public trust anchor: <strong className="text-slate-900 font-semibold">IssuerRegistry.sol</strong> accredits authorized university DIDs, and <strong className="text-slate-900 font-semibold">CredentialStatusRegistry.sol</strong> maintains active/revoked lifecycle states without storing any personal data.
          </p>
        </div>
      </section>

      {/* 2. Conceptual Evolution: Documents vs SSI */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-900">
            Conceptual Evolution: Paper vs SSI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Understanding why modern verifiable credentials supersede traditional scanned PDFs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono text-rose-700 uppercase font-bold">1. Paper Document</span>
            <p className="font-bold text-slate-900">Physical Certificate</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Easily forged with high-quality printing. Slow and expensive postal verification.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono text-amber-700 uppercase font-bold">2. Scanned PDF</span>
            <p className="font-bold text-slate-900">Unsigned PDF / JPEG</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Vulnerable to Photoshop editing in seconds. Zero cryptographic proof of authorship.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono text-teal-700 uppercase font-bold">3. Signed PDF</span>
            <p className="font-bold text-slate-900">Adobe PKI Signature</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Proves PDF bytes were untouched. But monolithic, hard to parse selectively, and proprietary.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">4. Verifiable Credential</span>
            <p className="font-bold text-slate-900">W3C VC 2.0 Standard</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Machine-readable structured claims with ECDSA cryptographic proof. Instantly verifiable anywhere.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">5. Blockchain Registry</span>
            <p className="font-bold text-slate-900">Decentralized Status</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Trustlessly verifies issuer accreditation and real-time revocation with zero PII stored on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Indian Identity Landscape Comparison */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          TrustID India vs DigiLocker & UIDAI Aadhaar
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          It is essential not to confuse national statutory identity systems with Self-Sovereign Identity. While they share the goal of digital verification, their architectures differ fundamentally:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 text-xs">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 text-sm">UIDAI Aadhaar</span>
            <span className="text-[10px] text-slate-500 font-mono font-semibold block">Centralized Identity Base</span>
            <p className="text-slate-600 leading-relaxed">
              A statutory national identity system managed by UIDAI. Authentication requires pinging central government biometric servers (CIDR). It is not an SSI platform.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 text-sm">DigiLocker</span>
            <span className="text-[10px] text-slate-500 font-mono font-semibold block">Federated Document Repository</span>
            <p className="text-slate-600 leading-relaxed">
              A cloud-based document repository where universities push URI links. Users log in through central government servers. Credentials exist on government servers, not in decentralized holder custody.
            </p>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <span className="font-bold text-slate-900 text-sm">TrustID India (Prototype)</span>
            <span className="text-[10px] text-emerald-800 font-mono font-bold block">Decentralized SSI Architecture</span>
            <p className="text-slate-700 leading-relaxed">
              Demonstrates W3C Verifiable Credentials where data is stored strictly on the student's device. Blockchain is used exclusively for decentralized issuer accreditation and revocation status. Zero central server dependency.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Limitations of Our Prototype */}
      <section className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-xl font-bold text-slate-900">
            Responsible Prototype Considerations & Limitations
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          An honest university engineering assessment must distinguish between an academic laboratory prototype and an enterprise production identity infrastructure:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900">1. Key Custody in Production:</strong>
            <p>Our prototype uses MetaMask for demonstration. In production, universities use Hardware Security Modules (HSMs, FIPS 140-2 Level 3) with multi-signature governance.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900">2. Lost Wallet Recovery:</strong>
            <p>If a student clears browser storage, credentials must be re-exported. Production SSI uses distributed social recovery or guardian key schemes.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900">3. Privacy & Linkability:</strong>
            <p>Personal data is off-chain. Production systems add Zero-Knowledge Proofs (ZKPs) or pairwise DIDs to prevent correlation across multiple verifiers.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900">4. Revocation Scalability:</strong>
            <p>We record individual 32-byte hashes. For millions of graduates, bit-vector accumulators (W3C StatusList2021) keep gas costs negligible.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900">5. Digital Accessibility:</strong>
            <p>SSI wallets require modern web browsers. Production nationwide deployments should support smartcards or assisted kiosks for underserved students.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900">6. Academic Scope:</strong>
            <p>Runs on local EVM (Chain ID 31337) with sample university profiles. Proves mathematical feasibility without claiming to replace official statutory bodies.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
