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
  Info,
  KeyRound,
  FileCode,
} from 'lucide-react';
import { fetchSampleCredential, verifyCredentialApi } from '../services/api';
import {
  canonicalizeCredential,
  computeCredentialDigest,
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
  const [nameField, setNameField] = useState('Aarav Sharma');

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

        verifyPayload(res.sample);
      }
    } catch (err) {
      console.error('Failed to load credential:', err);
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

    const newCanonical = canonicalizeCredential(updated);
    const newHash = computeCredentialDigest(newCanonical);
    setCurrentDigest(newHash);

    const hasChanged = newHash !== originalDigest;
    setIsTampered(hasChanged);

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
    handleApplyTamper('cgpa', '9.98');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-800">
              Interactive Security Sandbox
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Anti-Tampering Cryptographic Demonstration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Test how altering any claim (e.g., student name or CGPA) invalidates the ECDSA signature instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickTamper}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Flame className="w-4 h-4" />
            Simulate CGPA Tamper (9.98)
          </button>
          <button
            onClick={handleRestoreOriginal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            Restore Original
          </button>
        </div>
      </div>

      {/* Real-Time Hash Comparison Box */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              SHA-256 Canonical JSON Digest Comparison
            </h3>
          </div>
          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              isTampered
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {isTampered ? '⚠️ DIGEST MISMATCH (TAMPERED)' : '✓ DIGEST IDENTICAL (GENUINE)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans font-bold">
              1. Original Issued Digest (Signed by University):
            </span>
            <div className="text-emerald-700 font-bold break-all text-[11px]">
              {originalDigest || 'Loading...'}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border space-y-1 ${
              isTampered
                ? 'bg-rose-50 border-rose-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans font-bold">
              2. Computed Digest from Current Data:
            </span>
            <div
              className={`break-all text-[11px] font-bold ${
                isTampered ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {currentDigest}
            </div>
          </div>
        </div>

        {isTampered && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Why Verification Failed:</strong> The university's digital signature in MetaMask was computed over the <em>original digest</em>. Modifying any character produces a completely different SHA-256 hash. When the verifier recovers the public key address, it does not match the issuer!
            </p>
          </div>
        )}
      </div>

      {/* Interactive Modification Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Field Inputs */}
        <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-600" />
              Live Claims Editor
            </h3>
            <span className="text-[11px] text-slate-500">
              Edit values to test tamper detection
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={nameField}
                onChange={(e) => handleApplyTamper('name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree Conferred
              </label>
              <input
                type="text"
                value={degreeField}
                onChange={(e) => handleApplyTamper('degree', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Major / Department
              </label>
              <input
                type="text"
                value={programmeField}
                onChange={(e) => handleApplyTamper('programme', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cumulative CGPA
              </label>
              <input
                type="text"
                value={cgpaField}
                onChange={(e) => handleApplyTamper('cgpa', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Cryptographic Result */}
        <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live Cryptographic Verification Status
            </h3>
            <span className="text-xs text-slate-500">Auto-evaluates on edit</span>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              verificationReport?.isValid
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationReport?.isValid ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600" />
              )}
              <div>
                <span className="font-bold block text-sm">
                  {verificationReport?.isValid ? 'CRYPTOGRAPHIC SIGNATURE VALID' : 'CRYPTOGRAPHIC SIGNATURE INVALID'}
                </span>
                <span className="text-xs opacity-90">
                  {verificationReport?.isValid
                    ? 'All claims match the issuer digital signature bit-for-bit.'
                    : 'The modified payload does not match the issuer signature hash.'}
                </span>
              </div>
            </div>
          </div>

          {verificationReport && (
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">ECDSA Recovery Diagnostic:</span>
                <p className="text-slate-600">
                  {verificationReport.checks.signature.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
