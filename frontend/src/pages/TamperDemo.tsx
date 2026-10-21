import React, { useState, useEffect } from 'react';
import {
  Flame,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Hash,
  Binary,
  ArrowRight,
  Sparkles,
  Info,
  KeyRound,
  FileCode,
} from 'lucide-react';
import { fetchSampleCredential, verifyCredentialApi } from '../services/api';
import {
  canonicalizeCredential,
  computeCredentialDigest,
  verifySignatureClientSide,
} from '../services/clientCrypto';
import { TrustIdVerifiableCredential, VerificationReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const TamperDemo: React.FC = () => {
  const [originalVc, setOriginalVc] = useState<TrustIdVerifiableCredential | null>(null);
  const [tamperedVc, setTamperedVc] = useState<TrustIdVerifiableCredential | null>(null);

  // Editable claim fields
  const [programmeField, setProgrammeField] = useState('Computer Science & Engineering');
  const [degreeField, setDegreeField] = useState('Bachelor of Technology');
  const [cgpaField, setCgpaField] = useState('9.24');
  const [nameField, setNameField] = useState('Aarav Sharma — DEMO');

  const [originalDigest, setOriginalDigest] = useState('');
  const [currentDigest, setCurrentDigest] = useState('');

  const [verificationReport, setVerificationReport] = useState<VerificationReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTampered, setIsTampered] = useState(false);

  useEffect(() => {
    loadBaseCredential();
  }, []);

  const loadBaseCredential = async () => {
    try {
      const res = await fetchSampleCredential();
      if (res.success && res.sample) {
        setOriginalVc(res.sample);
        setTamperedVc(JSON.parse(JSON.stringify(res.sample)));

        const sub = res.sample.credentialSubject;
        setProgrammeField(sub.programme);
        setDegreeField(sub.degree);
        setCgpaField(sub.cgpa || '9.24');
        setNameField(sub.name);

        const origCanonical = canonicalizeCredential(res.sample);
        const origHash = computeCredentialDigest(origCanonical);
        setOriginalDigest(origHash);
        setCurrentDigest(origHash);
        setIsTampered(false);

        // Run initial verification
        verifyPayload(res.sample);
      }
    } catch (err) {
      console.error('Failed to load sample credential:', err);
    }
  };

  const verifyPayload = async (vc: TrustIdVerifiableCredential) => {
    setIsVerifying(true);
    try {
      const res = await verifyCredentialApi(vc);
      if (res.success && res.report) {
        setVerificationReport(res.report);
      }
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApplyTamper = (
    field: 'programme' | 'cgpa' | 'name' | 'degree',
    value: string
  ) => {
    if (!tamperedVc || !originalVc) return;

    const updated: TrustIdVerifiableCredential = JSON.parse(JSON.stringify(tamperedVc));

    if (field === 'programme') {
      setProgrammeField(value);
      updated.credentialSubject.programme = value;
    } else if (field === 'cgpa') {
      setCgpaField(value);
      updated.credentialSubject.cgpa = value;
    } else if (field === 'name') {
      setNameField(value);
      updated.credentialSubject.name = value;
    } else if (field === 'degree') {
      setDegreeField(value);
      updated.credentialSubject.degree = value;
    }

    setTamperedVc(updated);

    // Compute new canonical digest
    const newCanonical = canonicalizeCredential(updated);
    const newHash = computeCredentialDigest(newCanonical);
    setCurrentDigest(newHash);

    const hasChanged = newHash !== originalDigest;
    setIsTampered(hasChanged);

    // Automatically trigger real cryptographic verification
    verifyPayload(updated);
  };

  const handleRestoreOriginal = () => {
    if (!originalVc) return;
    setTamperedVc(JSON.parse(JSON.stringify(originalVc)));
    setProgrammeField(originalVc.credentialSubject.programme);
    setDegreeField(originalVc.credentialSubject.degree);
    setCgpaField(originalVc.credentialSubject.cgpa || '9.24');
    setNameField(originalVc.credentialSubject.name);
    setCurrentDigest(originalDigest);
    setIsTampered(false);
    verifyPayload(originalVc);
  };

  const handleQuickTamper = () => {
    handleApplyTamper('programme', 'Artificial Intelligence & Robotics');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-950/80 border border-rose-500/30 text-rose-400 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
              Interactive Cryptographic Proof Demonstration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Cryptographic Credential Tampering Demonstration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Observe in real-time how altering a single character causes mathematical verification to fail immediately.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickTamper}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950 transition"
          >
            <Flame className="w-4 h-4" />
            Demonstrate Credential Tampering
          </button>
          <button
            onClick={handleRestoreOriginal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            Restore Original Credential
          </button>
        </div>
      </div>

      {/* Real-Time Hash Comparison Visualizer */}
      <div className="bg-[#131F42]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              SHA-256 Canonical JSON Digest Comparison
            </h3>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              isTampered
                ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                : 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
            }`}
          >
            {isTampered ? 'HASH MISMATCH (TAMPERED)' : 'HASH IDENTICAL (UNTOUCHED)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#0A1024] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              1. Original Issued Digest (Signed by Issuer):
            </span>
            <div className="text-emerald-400 break-all text-[11px]">
              {originalDigest || 'Loading original digest...'}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border space-y-1 ${
              isTampered
                ? 'bg-rose-950/40 border-rose-500/40'
                : 'bg-[#0A1024] border-slate-800'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              2. Current Computed Digest (From Current Payload):
            </span>
            <div
              className={`break-all text-[11px] ${
                isTampered ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}
            >
              {currentDigest}
            </div>
          </div>
        </div>

        {isTampered && (
          <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Why Signature Validation Failed:</strong> The digital signature (<code className="font-mono text-cyan-300">proofValue</code>) was mathematically computed using the issuer's private key over the <span className="underline">original digest</span>. Modifying any claim produces a completely different SHA-256 digest. When the verifier performs ECDSA public key recovery, the derived signer address will no longer match the authorized university!
            </p>
          </div>
        )}
      </div>

      {/* Interactive Claim Modification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tampering Controls */}
        <div className="lg:col-span-5 bg-[#131F42]/50 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              Live Claims Editor
            </h3>
            <span className="text-[11px] text-slate-400">
              Edit claims to test tamper resistance
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Programme / Major
              </label>
              <input
                type="text"
                value={programmeField}
                onChange={(e) => handleApplyTamper('programme', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Original: <strong className="text-slate-300">Computer Science & Engineering</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Degree Programme
              </label>
              <input
                type="text"
                value={degreeField}
                onChange={(e) => handleApplyTamper('degree', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Original: <strong className="text-slate-300">Bachelor of Technology</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cumulative GPA
                </label>
                <input
                  type="text"
                  value={cgpaField}
                  onChange={(e) => handleApplyTamper('cgpa', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Original: <strong className="text-slate-300">9.24</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={nameField}
                  onChange={(e) => handleApplyTamper('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={handleRestoreOriginal}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Original State
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Verification Feedback */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Live Cryptographic Verification Result
            </h3>
            {isVerifying && (
              <span className="text-xs text-cyan-400 font-mono animate-pulse">
                Verifying...
              </span>
            )}
          </div>

          {verificationReport ? (
            <div className="bg-[#131F42]/80 border border-slate-700 rounded-2xl p-6 space-y-5">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  verificationReport.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                {verificationReport.isValid ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Result:
                  </div>
                  <h4 className="text-lg font-extrabold text-white">
                    {verificationReport.overallOutcome}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {verificationReport.summaryMessage}
                  </p>
                </div>
              </div>

              {/* Check 2 (Signature) Detail */}
              <div className="bg-[#0D1630] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Check 2: Cryptographic Signature Status
                  </span>
                  <StatusBadge status={verificationReport.checks.signature.status} size="sm" />
                </div>
                <p
                  className={`text-xs ${
                    verificationReport.checks.signature.status === 'PASSED'
                      ? 'text-emerald-300'
                      : 'text-rose-300 font-semibold'
                  }`}
                >
                  {verificationReport.checks.signature.message}
                </p>

                {verificationReport.checks.signature.details && (
                  <div className="p-2.5 rounded bg-slate-950 text-[11px] font-mono text-cyan-200 space-y-1">
                    <div>
                      <span className="text-slate-500">Expected University DID Address: </span>
                      <span className="text-white">
                        {String(verificationReport.checks.signature.details.expectedIssuer)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">ECDSA Recovered Signer Address: </span>
                      <span
                        className={
                          verificationReport.isValid ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {String(verificationReport.checks.signature.details.recoveredSigner || 'None')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Educational Note */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <strong className="text-slate-200">What this proves:</strong>
                <p>
                  A student or attacker holding a JSON credential cannot forge claims (like increasing their GPA or changing their degree) because doing so breaks the digital signature, which can only be computed with the university's private signing key.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Loading initial report...</div>
          )}
        </div>
      </div>
    </div>
  );
};
