import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle,
  FileCode,
  Lock,
  Plus,
  Trash2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  getStoredCredentials,
  saveCredentialToWallet,
  removeCredentialFromWallet,
  getVerificationHistory,
  WalletCredentialItem,
  VerificationHistoryItem,
} from '../services/walletStorage';
import { CredentialCard } from '../components/common/CredentialCard';
import { fetchSampleCredential } from '../services/api';
import { Link } from 'react-router-dom';

export const StudentWallet: React.FC = () => {
  const [credentials, setCredentials] = useState<WalletCredentialItem[]>([]);
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = () => {
    const stored = getStoredCredentials();
    const hasInitialized = localStorage.getItem('trustid_wallet_initialized');
    if (stored.length === 0 && !hasInitialized) {
      localStorage.setItem('trustid_wallet_initialized', 'true');
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

  const handleLoadSample = () => {
    fetchSampleCredential().then((res) => {
      if (res.success && res.sample) {
        saveCredentialToWallet(res.sample, 'SAMPLE');
        setCredentials(getStoredCredentials());
        setNotice('Sample credential loaded into your wallet.');
        setTimeout(() => setNotice(null), 3000);
      }
    });
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
      setNotice('Verifiable credential successfully imported into wallet.');
      setTimeout(() => setNotice(null), 3000);
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

  const handleDelete = (credentialId: string, index: number) => {
    removeCredentialFromWallet(credentialId, index);
    const updated = getStoredCredentials();
    setCredentials(updated);
    setNotice('Credential removed from local digital wallet.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Role Banner for Evaluation Clarity */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                PORTAL: STUDENT HOLDER
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Persona: Aarav Sharma (Graduate)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Student Digital Credential Wallet
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Hold, inspect, and present your tamper-proof academic credentials to employers and scholarship portals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/tamper-demo"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition"
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Anti-Tamper Sandbox</span>
          </Link>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Import Credential</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Self-Sovereign Identity (SSI) Storage Guarantee:</span>
            <p className="text-slate-600 mt-0.5">
              Your credentials are held strictly inside your private browser storage. No personal data, student names, or grades exist on the blockchain ledger.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-emerald-800 font-bold bg-white px-3 py-1 rounded-full border border-emerald-200 shrink-0">
          Zero-PII On-Chain
        </span>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>✓ {notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Credentials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>My Earned Credentials</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {credentials.length}
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            Click 'Verify Credential' to run 7-stage cryptographic audit
          </span>
        </div>

        {credentials.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Wallet is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You have removed all credentials from your local device. Issue a new degree in the University Portal or reload a sample credential.
              </p>
            </div>
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
            >
              <span>+ Load Sample Credential</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {credentials.map((item, idx) => (
              <div key={item.credential.id || idx}>
                <CredentialCard
                  credential={item.credential}
                  onDelete={() => handleDelete(item.credential.id, idx)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                Import Verifiable Credential JSON
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {importError}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload .json File
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Paste JSON String
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste W3C Verifiable Credential JSON..."
                  className="w-full h-36 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                >
                  Save to Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
