import React from 'react';
import { ShieldCheck, ExternalLink, AlertCircle, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-emerald-100 text-slate-500 text-xs mt-20">
      {/* University Disclaimer Banner */}
      <div className="bg-emerald-50/60 border-b border-emerald-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5 text-slate-600">
          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-800">University Assessment Prototype Notice:</strong> TrustID India is a technical demonstration of Self-Sovereign Identity (SSI) and W3C Verifiable Credentials for a Blockchain Technologies curriculum. All identities and student records shown are fictitious demonstration samples. Zero student PII is written to the blockchain.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-900 text-sm">TrustID India</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your Credentials. Your Control. Independently Verifiable. Demonstrating privacy-preserving academic credential verification on EVM consortium blockchain.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-mono font-medium">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Consortium EVM (Chain ID: 31337)</span>
            </div>
          </div>

          {/* Quick Links: 2 Portals */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Primary Portals
            </h4>
            <ul className="space-y-1.5 font-medium">
              <li>
                <Link to="/issuer" className="hover:text-emerald-600 transition">
                  🏛️ Organization Portal (Universities)
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-emerald-600 transition">
                  🎓 Student Portal (Digital Wallet)
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-emerald-600 transition">
                  🔍 Credential Verification Portal
                </Link>
              </li>
              <li>
                <Link to="/activity" className="hover:text-emerald-600 transition">
                  ⛓️ On-Chain Blockchain Activity
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Cryptographic Standards
            </h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>• W3C Verifiable Credentials 2.0</li>
              <li>• RFC 8785 JSON Canonicalization</li>
              <li>• ECDSA Secp256k1 Key Recovery</li>
              <li>• Decentralized Identifiers (did:ethr)</li>
            </ul>
          </div>

          {/* Privacy Guarantee */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Privacy Architecture
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Personal student data and grades are stored strictly off-chain in the student's personal wallet. The blockchain maintains only issuer accreditation and opaque revocation status hashes.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© 2026 TrustID India Prototype. Built for Blockchain Technologies Assessment.</p>
          <p className="font-mono text-emerald-700 font-medium">
            MetaMask EIP-191 & EVM Smart Contracts
          </p>
        </div>
      </div>
    </footer>
  );
};
