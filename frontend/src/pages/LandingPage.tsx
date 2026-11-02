import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  CheckCircle2,
  Lock,
  ArrowRight,
  KeyRound,
  FileCheck,
  Flame,
  Activity,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Cpu,
  BadgeCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [quickSearchId, setQuickSearchId] = useState('');
  const navigate = useNavigate();

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchId.trim()) {
      navigate(`/verify?id=${encodeURIComponent(quickSearchId.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* =========================================================================
          HERO SECTION (Coinbase-Inspired Split Layout)
          Clean white background, bold display typography, floating credential mockup
         ========================================================================= */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Content & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Eyebrow Pill Badge (Coinbase style) */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Next-Gen Academic Verifiable Credentials</span>
                <span className="text-emerald-500 font-normal">→</span>
              </div>

              {/* Bold Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
                Trust your credentials,{' '}
                <span className="text-emerald-600 block sm:inline">
                  not just the document.
                </span>
              </h1>

              {/* Punchy Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                TrustID India is a consortium blockchain platform where universities digitally sign academic degrees with MetaMask, students hold credentials off-chain, and employers verify authenticity in seconds.
              </p>

              {/* Quick Actions (Dual Portals + Quick Verify Input) */}
              <div className="pt-2 space-y-4">
                
                {/* Two Primary Portal CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    to="/issuer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition active:scale-95"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Organization Portal</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>

                  <Link
                    to="/wallet"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition active:scale-95"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student Digital Wallet</span>
                  </Link>
                </div>

                {/* Instant Verification Search Bar (Coinbase style action input) */}
                <form
                  onSubmit={handleQuickVerify}
                  className="max-w-xl flex items-center bg-white border border-slate-200 hover:border-emerald-300 rounded-full p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
                >
                  <div className="pl-3.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Credential ID or inspect sample degree..."
                    value={quickSearchId}
                    onChange={(e) => setQuickSearchId(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verify Credential</span>
                  </button>
                </form>

                {/* Micro Trust Indicators */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] font-semibold text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    W3C VC 2.0 Standard
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Secp256k1 MetaMask Signatures
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Zero-PII On-Chain
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Floating High-Fidelity Credential Mockup (Coinbase Style) */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* Decorative Background Blob */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/50 via-teal-50/30 to-slate-100/40 rounded-[2.5rem] filter blur-xl -z-10 transform -rotate-1" />

              {/* Outer Layered Container */}
              <div className="w-full max-w-md relative">
                
                {/* Secondary Floating Card Behind (Offset Depth) */}
                <div className="hidden sm:block absolute -top-4 -right-4 w-full h-full bg-slate-100/80 border border-slate-200/90 rounded-3xl transform rotate-2 -z-10 shadow-sm" />

                {/* Primary Floating Verifiable Credential Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl shadow-slate-200/80 space-y-5">
                  
                  {/* Card Header: Issuer Info & Verified Badge */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-sm border border-emerald-100 shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                            VISHWAKARMA INSTITUTE OF TECH
                          </h4>
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Accredited Consortium Issuer
                        </span>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ON-CHAIN VALID
                    </span>
                  </div>

                  {/* Degree Claims Section */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Conferred Credential
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Bachelor of Technology in Computer Engineering
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                        <span className="text-[10px] text-slate-400 block font-medium">Graduate</span>
                        <span className="text-xs font-bold text-slate-800">Samarath Sharma</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                        <span className="text-[10px] text-slate-400 block font-medium">CGPA / Honors</span>
                        <span className="text-xs font-bold text-emerald-700">9.42 / First Class Dist.</span>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Verification Anchor Box */}
                  <div className="bg-slate-950 text-slate-200 rounded-2xl p-3.5 space-y-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        ECDSA Secp256k1 Proof
                      </span>
                      <span className="text-emerald-400">MATH VALID</span>
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">
                      <span className="text-slate-500">Signer: </span>
                      0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">
                      <span className="text-slate-500">Status Hash: </span>
                      0x4e9c71...d31be0
                    </div>
                  </div>

                  {/* Action Link to Wallet / Verify */}
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to="/verify"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Audit full 7-stage cryptographic proof</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[10px] font-mono text-slate-400">Block #1</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          ROLE SELECTION (Organization vs Student)
         ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
            Dedicated Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 tracking-tight">
            Select Your Role to Begin
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Experience both sides of Self-Sovereign Identity: institutional issuance or student self-custody.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Portal Card */}
          <div className="bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                For Universities
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Organization Portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Connect university MetaMask wallet, verify institutional accreditation in <code className="font-mono text-emerald-800 font-semibold text-xs">IssuerRegistry.sol</code>, digitally sign academic degrees with ECDSA, and anchor status hashes on-chain.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/issuer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition group-hover:translate-x-1"
              >
                <span>Launch Organization Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Student Portal Card */}
          <div className="bg-white border border-slate-200 hover:border-slate-400 rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                For Students & Alumni
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Student Digital Wallet
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Hold your verifiable academic credentials directly in your browser off-chain. Export standardized W3C VC JSON files, present credentials to employers, or test anti-tamper mechanisms.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/wallet"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition group-hover:translate-x-1"
              >
                <span>Open Student Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4 ARCHITECTURAL PILLARS (Clean Minimalist Cards)
         ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
            System Architecture
          </span>
          <h2 className="text-2xl font-extrabold text-slate-950 mt-1 tracking-tight">
            Built on Open Standards & Trustless Cryptography
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Consortium Blockchain</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Universities maintain accredited identities and publish opaque 32-byte status hashes to EVM smart contracts.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">MetaMask Key Custody</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Institutional private keys stay in MetaMask. Degrees are signed with ECDSA Secp256k1 recovery signatures.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Zero-PII On-Chain</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Grades, student names, and personal identifiers never touch the blockchain, adhering to data privacy standards.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Instant Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Employers verify mathematical authenticity in milliseconds without waiting for manual registrar responses.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CLASSROOM EVALUATION WALKTHROUGH
         ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Evaluation Walkthrough
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                How to Demonstrate This Project to Your Evaluator
              </h2>
            </div>
            <Link
              to="/tamper-demo"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition self-start sm:self-auto"
            >
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Try Anti-Tamper Demo</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Issue with MetaMask</h4>
              <p className="text-slate-600 leading-relaxed">
                Log into the <strong>Organization Portal</strong>. Issue a student degree. Show MetaMask popping up for digital signature and on-chain registration!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Hold in Student Wallet</h4>
              <p className="text-slate-600 leading-relaxed">
                Open the <strong>Student Portal</strong>. Show that the credential is held off-chain in private browser custody. Export JSON or present to employer.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Verify & Anti-Tamper</h4>
              <p className="text-slate-600 leading-relaxed">
                Run the <strong>7-Stage Verifier</strong>. Show green verification. Then tamper with 1 letter in the degree and show instant mathematical failure!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
