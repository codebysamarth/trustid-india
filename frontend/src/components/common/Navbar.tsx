import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  Wallet,
  CheckCircle2,
  Activity,
  BookOpen,
  PlayCircle,
  Flame,
  RotateCcw,
  ChevronDown,
  Layers,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useWallet, DEMO_PROFILES } from '../../context/WalletContext';
import { useDemo } from '../../context/DemoContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    isConnected,
    address,
    networkName,
    selectedRole,
    switchRole,
    switchDemoProfile,
    activeProfileKey,
    connectMetaMask,
    isMetaMaskAvailable,
    isSimulated,
  } = useWallet();

  const { resetAllDemoState, isResetting } = useDemo();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const navItems = [
    { path: '/', label: 'Overview', icon: Shield },
    { path: '/issuer', label: 'Issuer', icon: GraduationCap },
    { path: '/wallet', label: 'My Wallet', icon: Wallet },
    { path: '/verify', label: 'Verify Credential', icon: CheckCircle2 },
    { path: '/registry', label: 'Credential Registry', icon: Layers },
    { path: '/tamper-demo', label: 'Tamper Demo', icon: Flame },
    { path: '/activity', label: 'Activity', icon: Activity },
    { path: '/architecture', label: 'How It Works', icon: BookOpen },
    { path: '/demo', label: 'Guided Demo', icon: PlayCircle, highlight: true },
  ];

  const roleLabels: Record<UserRole, { label: string; color: string; bg: string }> = {
    ISSUER: { label: 'University Issuer', color: 'text-cyan-400', bg: 'bg-cyan-950/70 border-cyan-500/40' },
    HOLDER: { label: 'Student Holder', color: 'text-emerald-400', bg: 'bg-emerald-950/70 border-emerald-500/40' },
    VERIFIER: { label: 'Scholarship Verifier', color: 'text-indigo-400', bg: 'bg-indigo-950/70 border-indigo-500/40' },
    GOVERNOR: { label: 'Registry Governor', color: 'text-amber-400', bg: 'bg-amber-950/70 border-amber-500/40' },
  };

  const handleResetConfirm = async () => {
    setShowConfirmReset(false);
    await resetAllDemoState();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#070C18]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Product Identity */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 p-0.5 shadow-md shadow-cyan-950/50 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white">
                      TrustID<span className="text-cyan-400">India</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                      SSI & VC 2.0
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 hidden sm:block">
                    Blockchain Trust & Status Registry
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        : item.highlight
                        ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive || item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side: Role Selector, MetaMask, Reset */}
            <div className="flex items-center gap-2.5">
              {/* Role Indicator & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${roleLabels[selectedRole].bg}`}
                  title="Switch Active Persona"
                >
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Role:</span>
                  <span className={roleLabels[selectedRole].color}>
                    {roleLabels[selectedRole].label}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0E172E] border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-800 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Demonstration Role
                    </div>
                    {Object.entries(DEMO_PROFILES).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => {
                          switchDemoProfile(key);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition ${
                          activeProfileKey === key
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{p.role}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          {p.address}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wallet / MetaMask Status */}
              {isConnected ? (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-slate-300">
                    {address ? `${address.substring(0, 6)}...${address.substring(38)}` : 'Connected'}
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                    {isSimulated ? 'Local Hardhat' : networkName}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectMetaMask}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                >
                  Connect MetaMask
                </button>
              )}

              {/* Reset Demo State Button */}
              <button
                onClick={() => setShowConfirmReset(true)}
                disabled={isResetting}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                title="Reset Demonstration State to Initial Preset"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden overflow-x-auto py-2 px-4 border-t border-slate-800/80 flex items-center gap-1.5 bg-[#0B132B]/80 scrollbar-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0E172E] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reset Demonstration State?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will clear local wallet storage, reset sample test credentials, and clear the backend demo cache. It will not destroy unrelated user files or real browser data.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
              >
                Yes, Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
