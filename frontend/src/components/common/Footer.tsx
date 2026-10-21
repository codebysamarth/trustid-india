import React from 'react';
import { Shield, BookOpen, ExternalLink, Heart, AlertCircle, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070C18] border-t border-slate-800 text-slate-400 text-xs mt-16">
      {/* Student Disclaimer Banner */}
      <div className="bg-[#0B132B]/80 border-b border-slate-800/80 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5 text-slate-400">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-300">University Assessment Prototype Notice:</strong> TrustID India is a technical demonstration of Self-Sovereign Identity (SSI) and W3C Verifiable Credentials for a Blockchain Technologies curriculum. It is <span className="underline decoration-cyan-500">not</span> an official Government of India portal, nor an integration with UIDAI Aadhaar, DigiLocker, or Digi Yatra. All identities and student records shown are fictitious demo samples.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white text-sm">TrustID India</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Credentials. Your Control. Independently Verifiable. Demonstrating privacy-preserving academic credential verification on local EVM blockchain.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400/90 font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardhat EVM (Chain ID 31337)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Core Modules
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/issuer" className="hover:text-cyan-400 transition">
                  University Issuer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-cyan-400 transition">
                  Student Digital Wallet
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-cyan-400 transition">
                  Credential Verification Portal
                </Link>
              </li>
              <li>
                <Link to="/registry" className="hover:text-cyan-400 transition">
                  On-Chain Status & Revocation
                </Link>
              </li>
              <li>
                <Link to="/tamper-demo" className="hover:text-cyan-400 transition">
                  Cryptographic Tampering Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Standards */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Standards & Architecture
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/architecture" className="hover:text-cyan-400 transition">
                  Trust Triangle Architecture
                </Link>
              </li>
              <li>
                <Link to="/demo" className="hover:text-cyan-400 transition">
                  10-Step Guided Presentation Flow
                </Link>
              </li>
              <li>
                <a
                  href="https://www.w3.org/TR/vc-data-model-2.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 inline-flex items-center gap-1 transition"
                >
                  W3C VC Data Model 2.0 <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.rfc-editor.org/rfc/rfc8785"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 inline-flex items-center gap-1 transition"
                >
                  RFC 8785 JSON Canonicalization <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Smart Contracts & Security */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Decentralized Registries
            </h4>
            <ul className="space-y-1.5 text-[11px] font-mono">
              <li className="text-slate-300">
                IssuerRegistry.sol
              </li>
              <li className="text-slate-400">
                Accreditation & Institutional Keys
              </li>
              <li className="text-slate-300 pt-1">
                CredentialStatusRegistry.sol
              </li>
              <li className="text-slate-400">
                Opaque O(1) Status & Revocation Check
              </li>
              <li className="text-emerald-400 font-sans pt-1">
                ✓ Zero PII Stored On-Chain
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 TrustID India — University Blockchain Assessment Project</p>
          <p className="flex items-center gap-1">
            Built with React, TypeScript, Solidity, Hardhat & Ethers.js
          </p>
        </div>
      </div>
    </footer>
  );
};
