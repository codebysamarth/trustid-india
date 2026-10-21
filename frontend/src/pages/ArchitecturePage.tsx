import React from 'react';
import {
  Shield,
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
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
            Educational Foundations & System Design
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
          TrustID India: Architecture & SSI Deep Dive
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          A comprehensive breakdown of Self-Sovereign Identity (SSI), W3C Verifiable Credentials (VCs), decentralized trust registries, and cryptographic integrity.
        </p>
      </div>

      {/* 1. Visual Trust Triangle Diagram */}
      <section className="bg-[#131F42]/60 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
            The SSI Trust Triangle
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Three Actors, Decentralized Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            The fundamental breakthrough of SSI: Verifiers validate credentials directly without pinging the issuing university.
          </p>
        </div>

        {/* Responsive Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Issuer */}
          <div className="bg-[#0A1024] border border-cyan-500/40 rounded-2xl p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                1. ISSUER (University)
              </span>
              <GraduationCap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white">Accredited Institution</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              • Signs academic credential with its private key (<code className="font-mono text-cyan-300 text-[10px]">Secp256k1</code>)<br />
              • Emits opaque status hash to <code className="font-mono text-cyan-300 text-[10px]">CredentialStatusRegistry</code><br />
              • Delivers signed credential directly to student wallet off-chain.
            </p>
          </div>

          {/* Holder */}
          <div className="bg-[#0A1024] border border-emerald-500/40 rounded-2xl p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                2. HOLDER (Student)
              </span>
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Self-Sovereign Custody</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              • Stores credentials in private digital wallet off-chain<br />
              • Discloses credentials strictly upon explicit user consent<br />
              • Retains ownership even if the issuing university ceases operations.
            </p>
          </div>

          {/* Verifier */}
          <div className="bg-[#0A1024] border border-indigo-500/40 rounded-2xl p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                3. VERIFIER (Scholarship)
              </span>
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white">Relying Party Portal</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              • Recovers issuer address from credential cryptographic signature<br />
              • Checks institutional authority in on-chain <code className="font-mono text-cyan-300 text-[10px]">IssuerRegistry</code><br />
              • Verifies real-time revocation status in <code className="font-mono text-cyan-300 text-[10px]">CredentialStatusRegistry</code>.
            </p>
          </div>
        </div>

        {/* Blockchain Trust Anchor Box */}
        <div className="bg-[#070C18] border border-slate-800 rounded-2xl p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-cyan-400">
            <Cpu className="w-5 h-5" />
            <h4 className="font-bold text-sm text-white">
              Underlying Trust Registry Layer: Local EVM Blockchain (Hardhat)
            </h4>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Acts as the public bulletin board: <strong className="text-slate-300">IssuerRegistry.sol</strong> maps DIDs to authorized universities, and <strong className="text-slate-300">CredentialStatusRegistry.sol</strong> tracks active/revoked lifecycle states in constant time O(1).
          </p>
        </div>
      </section>

      {/* 2. Key Technology Comparisons */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Conceptual Evolution: Documents vs SSI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Understanding the critical differences across 5 distinct paradigms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="bg-[#131F42]/40 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">1. Digital Document</span>
            <p className="font-bold text-white">Scanned PDF / Image</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Vulnerable to visual tampering in Photoshop. No cryptographic proof of origin. Requires phone calls to registrar to verify.
            </p>
          </div>

          <div className="bg-[#131F42]/40 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">2. Digitally Signed PDF</span>
            <p className="font-bold text-white">PKI / Adobe Sign</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Proves PDF bytes were untouched. But monolithic, human-oriented, and hard to parse machine-readable claims selectively.
            </p>
          </div>

          <div className="bg-[#131F42]/40 border border-cyan-500/30 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">3. Verifiable Credential</span>
            <p className="font-bold text-white">W3C VC Data Model 2.0</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Structured JSON holding atomic claims and cryptographic proof. Instantly machine-verifiable across heterogenous software.
            </p>
          </div>

          <div className="bg-[#131F42]/40 border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">4. Self-Sovereign Identity</span>
            <p className="font-bold text-white">Holder-Centric Custody</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Users own their identifiers (DIDs) and credentials directly off-chain. No centralized server can revoke or lock user identity.
            </p>
          </div>

          <div className="bg-[#131F42]/40 border border-indigo-500/30 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">5. Blockchain Registry</span>
            <p className="font-bold text-white">Decentralized Trust Anchor</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Resolves public keys and tracks revocation without storing personal data. Ensures verifiers can trust signatures trustlessly.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Indian Identity Landscape Comparison */}
      <section className="bg-[#0E172E]/70 border border-slate-800 rounded-3xl p-8 space-y-5">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          TrustID India vs DigiLocker, Digi Yatra, and Aadhaar
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          It is essential not to confuse national digital identity platforms with Self-Sovereign Identity. While they share the goal of digitizing verification, their underlying architecture differs fundamentally:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
          <div className="bg-[#0A1024] p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="font-bold text-white text-sm">UIDAI Aadhaar</span>
            <span className="text-[10px] text-cyan-400 font-mono block">Centralized Identity Base</span>
            <p className="text-slate-400 leading-relaxed">
              Aadhaar is a centralized statutory identification system managed by UIDAI. Authentication requires pinging central biometric servers (CIDR). It is not an SSI platform.
            </p>
          </div>

          <div className="bg-[#0A1024] p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="font-bold text-white text-sm">DigiLocker</span>
            <span className="text-[10px] text-emerald-400 font-mono block">Federated Document Repository</span>
            <p className="text-slate-400 leading-relaxed">
              DigiLocker is a cloud-based repository where government and academic issuers push URIs. Users log in through central government servers. Credentials exist on government servers, not in decentralized holder custody.
            </p>
          </div>

          <div className="bg-[#0A1024] p-5 rounded-2xl border border-cyan-500/40 space-y-2">
            <span className="font-bold text-white text-sm">TrustID India (Prototype)</span>
            <span className="text-[10px] text-cyan-300 font-mono block">Decentralized Self-Sovereign Model</span>
            <p className="text-slate-400 leading-relaxed">
              Demonstrates W3C Verifiable Credentials where data is stored strictly on the student's device. Blockchain is used exclusively for decentralized issuer accreditation and revocation status. Zero central server dependency.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Limitations of Our Prototype */}
      <section className="bg-[#131F42]/30 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-2.5 text-amber-400">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Limitations of Our Prototype
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          A responsible engineering evaluation must clearly delineate the boundary between an educational laboratory prototype and an enterprise production identity infrastructure:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs text-slate-400">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200">1. Issuer Governance & Key Management:</strong>
            <p>Our prototype uses local EVM accounts. In production, universities require Hardware Security Modules (HSMs, FIPS 140-2 Level 3) with multi-signature authorization to prevent private key theft.</p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200">2. Lost Wallet Recovery:</strong>
            <p>If a student clears browser storage or loses their hardware device, decentralized credentials are lost unless a distributed social recovery or threshold cryptography guardian scheme is implemented.</p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200">3. Privacy & Linkability:</strong>
            <p>While personal claims remain off-chain, re-using static public identifiers across multiple verifiers can permit correlation. Advanced production systems use Zero-Knowledge Proofs (ZKPs) or pairwise unique DIDs.</p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200">4. Revocation Scalability:</strong>
            <p>Our prototype records individual status IDs on-chain. For millions of university graduates, bit-vector accumulators (e.g., W3C StatusList2021) or Merkle trees are necessary to keep gas costs negligible.</p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200">5. Accessibility & Digital Divide:</strong>
            <p>Self-sovereign wallets require modern smartphones and digital literacy. Production deployments must provide assisted-custody or physical smartcard fallbacks for disadvantaged populations.</p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200">6. Prototype vs Production Boundary:</strong>
            <p>This implementation runs on a local Hardhat EVM (Chain ID 31337) with sample university profiles. It proves cryptographic and architectural feasibility without replacing real statutory registries.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
