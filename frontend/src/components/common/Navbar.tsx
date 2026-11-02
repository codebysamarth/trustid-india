import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  CheckCircle2,
  Activity,
  BookOpen,
  Zap,
  Flame,
  LogOut,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    address,
    networkName,
    connectMetaMask,
    disconnectWallet,
    isMetaMaskConnected,
    isHardhatNetwork,
    promptAddHardhatNetwork,
    balance,
  } = useWallet();

  const isIssuer = location.pathname === '/issuer' || location.pathname === '/organization';
  const isWallet = location.pathname === '/wallet' || location.pathname === '/student';
  const isVerify = location.pathname === '/verify';
  const isActivity = location.pathname === '/activity';
  const isArchitecture = location.pathname === '/architecture';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Identity (Coinbase Style) */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  TrustID<span className="text-emerald-600 font-extrabold">India</span>
                </span>
                <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  VC 2.0
                </span>
              </div>
            </Link>

            {/* SEGMENTED 3-PORTAL SWITCHER (Instant Role Switching for Evaluation) */}
            <div className="hidden lg:flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/90 text-xs">
              <Link
                to="/issuer"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  isIssuer
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${isIssuer ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>University Portal</span>
              </Link>

              <Link
                to="/wallet"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  isWallet
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <GraduationCap className={`w-3.5 h-3.5 ${isWallet ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Student Wallet</span>
              </Link>

              <Link
                to="/verify"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  isVerify
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isVerify ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Verifier Portal</span>
              </Link>
            </div>
          </div>

          {/* Center-Right: Secondary Links (Ledger & How It Works) */}
          <div className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-500">
            <Link
              to="/activity"
              className={`flex items-center gap-1.5 hover:text-slate-950 transition ${
                isActivity ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Ledger Activity</span>
            </Link>
            <Link
              to="/architecture"
              className={`flex items-center gap-1.5 hover:text-slate-950 transition ${
                isArchitecture ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How It Works</span>
            </Link>
          </div>

          {/* Right: Actions & MetaMask Status */}
          <div className="flex items-center gap-2.5">
            {isMetaMaskConnected ? (
              <div className="flex items-center gap-2">
                {/* Account Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-slate-800 text-[11px]">
                    {address ? `${address.substring(0, 6)}...${address.substring(38)}` : 'Connected'}
                  </span>
                  {balance && (
                    <span className="hidden sm:inline font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {balance}
                    </span>
                  )}
                </div>

                {/* Disconnect MetaMask Button */}
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition active:scale-95"
                  title="Disconnect MetaMask session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>

                {!isHardhatNetwork && (
                  <button
                    onClick={promptAddHardhatNetwork}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition active:scale-95"
                    title="Switch MetaMask to local consortium network (Chain 31337)"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Switch Chain</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={connectMetaMask}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <span>🦊</span>
                <span>Connect MetaMask</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Segmented Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-white px-2 py-2 text-xs font-semibold">
        <Link
          to="/issuer"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
            isIssuer ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>University</span>
        </Link>
        <Link
          to="/wallet"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
            isWallet ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student</span>
        </Link>
        <Link
          to="/verify"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
            isVerify ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verifier</span>
        </Link>
      </div>
    </header>
  );
};
