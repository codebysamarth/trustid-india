import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle,
  FileCode,
  HardDrive,
  Info,
  History,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  getStoredCredentials,
  saveCredentialToWallet,
  removeCredentialFromWallet,
  getVerificationHistory,
  clearStudentWallet,
  WalletCredentialItem,
  VerificationHistoryItem,
} from '../services/walletStorage';
import { CredentialCard } from '../components/common/CredentialCard';
import { TrustIdVerifiableCredential } from '../types';
import { fetchSampleCredential } from '../services/api';

export const StudentWallet: React.FC = () => {
  const [credentials, setCredentials] = useState<WalletCredentialItem[]>([]);
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = () => {
    const stored = getStoredCredentials();
    if (stored.length === 0) {
      // Auto-load sample demo credential if wallet is empty
      fetchSampleCredential().then((res) => {
        if (res.success && res.sample) {
          saveCredentialToWallet(res.sample, 'SAMPLE');
          setCredentials(getStoredCredentials());
        }
      });
    } else {
      setCredentials(stored);
    }
    setHistory(getVerificationHistory());
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);

    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.id || !parsed.credentialSubject || !parsed.proof) {
        setImportError('Invalid credential JSON. Must contain "id", "credentialSubject", and "proof" properties.');
        return;
      }

      saveCredentialToWallet(parsed, 'IMPORTED');
      setCredentials(getStoredCredentials());
      setShowImportModal(false);
      setImportJsonText('');
    } catch (err: any) {
      setImportError(`Malformed JSON syntax: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setImportJsonText(text);
      } catch (err: any) {
        setImportError('Failed to read file');
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (credentialId: string) => {
    removeCredentialFromWallet(credentialId);
    setCredentials(getStoredCredentials());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Holder Self-Sovereignty
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Student Digital Credential Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hold, inspect, and present your tamper-evident academic credentials with full user consent.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            Import Credential JSON
          </button>
        </div>
      </div>

      {/* Storage Architecture Educational Banner */}
      <div className="bg-[#131F42]/40 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 shrink-0">
          <HardDrive className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Off-Chain Custody Status:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[10px]">
              Stored Locally in Browser Storage
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            These verifiable credentials exist solely within your local device custody. They are not stored in any centralized government or university database. In a production system, credentials reside inside hardware security enclaves on mobile devices (e.g. Apple Secure Enclave or Android Keystore).
          </p>
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Available Academic Credentials</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
              {credentials.length} Held
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            Fictitious demonstration profiles
          </span>
        </div>

        {credentials.length === 0 ? (
          <div className="bg-[#131F42]/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Wallet className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">Wallet is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Issue a new credential in the Issuer Dashboard or import a credential JSON to view it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {credentials.map((item, idx) => (
              <div key={idx} className="relative group">
                <CredentialCard credential={item.credential} />
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleDelete(item.credential.id)}
                    className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800 transition"
                    title="Remove from local wallet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification History Section */}
      <div className="bg-[#131F42]/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Recent Credential Presentations & Verifications
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Audit Trail
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No verification history logged yet. When you verify a credential in the Verification Portal, audit records appear here.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {history.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">{h.studentName}</span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {h.credentialId}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      h.isValid ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {h.outcome}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-[#0E172E] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Import Verifiable Credential
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {importError && (
              <div className="p-3 bg-rose-950 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                {importError}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Upload .json File
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Or Paste Credential JSON Directly
                </label>
                <textarea
                  rows={8}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste W3C VC 2.0 JSON here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow"
                >
                  Save to Local Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
