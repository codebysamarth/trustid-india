import React, { useState, useEffect } from 'react';
import {
  Layers,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Building,
  KeyRound,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import {
  fetchSampleCredential,
  verifyCredentialApi,
  revokeCredentialApi,
} from '../services/api';
import { revokeCredentialOnChainWithMetaMask } from '../services/contractService';
import { useWallet } from '../context/WalletContext';
import { TrustIdVerifiableCredential, VerificationReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const RevocationDemo: React.FC = () => {
  const { address, signer, isMetaMaskConnected } = useWallet();

  const [activeVc, setActiveVc] = useState<TrustIdVerifiableCredential | null>(null);
  const [isRevokedOnChain, setIsRevokedOnChain] = useState<boolean>(false);
  const [revocationReason, setRevocationReason] = useState<string>('Degree revoked due to academic misconduct');
  const [report, setReport] = useState<VerificationReport | null>(null);

  const [isProcessingRevoke, setIsProcessingRevoke] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTestCredential();
  }, []);

  const loadTestCredential = async () => {
    try {
      const res = await fetchSampleCredential();
      if (res.success && res.sample) {
        setActiveVc(res.sample);
        setIsRevokedOnChain(false);
        verifyCurrentState(res.sample);
      }
    } catch (err) {
      console.warn('Failed to load sample credential:', err);
    }
  };

  const verifyCurrentState = async (vc: TrustIdVerifiableCredential) => {
    setIsVerifying(true);
    try {
      const res = await verifyCredentialApi(vc);
      if (res.success && res.report) {
        setReport(res.report);
        const onChainRevoked = res.report.checks.revocation.status === 'FAILED';
        setIsRevokedOnChain(onChainRevoked);
      }
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRevokeOnChain = async () => {
    if (!activeVc) return;
    setIsProcessingRevoke(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      if (isMetaMaskConnected && signer) {
        setStatusMessage('MetaMask Action: Please confirm the revocation transaction in your MetaMask popup window...');
        const txRes = await revokeCredentialOnChainWithMetaMask(
          signer,
          activeVc.credentialStatus.id,
          revocationReason
        );
        setStatusMessage(
          `Revocation transaction confirmed on-chain via MetaMask! Tx: ${txRes.transactionHash.substring(0, 16)}...`
        );
        setIsRevokedOnChain(true);
        await verifyCurrentState(activeVc);
      } else {
        const res = await revokeCredentialApi({
          credentialId: activeVc.id,
          statusId: activeVc.credentialStatus.id,
          reason: revocationReason,
        });

        if (res.success) {
          setStatusMessage(
            `Revocation transaction mined! Tx: ${res.transactionHash?.substring(0, 16)}...`
          );
          setIsRevokedOnChain(true);
          await verifyCurrentState(activeVc);
        } else {
          setErrorMessage(res.error || 'Failed to revoke credential on-chain');
        }
      }
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('rejected')) {
        setErrorMessage('Revocation transaction was rejected in MetaMask.');
      } else {
        setErrorMessage(`Revocation error: ${err.message || String(err)}`);
      }
    } finally {
      setIsProcessingRevoke(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-800">
              Decentralized Status Registry Lifecycle
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Credential Revocation & On-Chain Status Demonstration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Demonstrate how an authorized university revokes a credential on the blockchain, and how verifiers detect it while the cryptographic signature remains intact.
          </p>
        </div>

        <button
          onClick={loadTestCredential}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-emerald-600" />
          Reset to Fresh Active Credential
        </button>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>✕</button>
        </div>
      )}

      {/* Step by Step Workflow Progression */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div
          className={`p-5 rounded-2xl border ${
            !isRevokedOnChain
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-emerald-800 block font-bold">
            STATE 1: BEFORE REVOCATION
          </span>
          <div className="font-bold text-sm mt-1 text-slate-900">Authentic & Active</div>
          <p className="text-[11px] text-slate-600 mt-1">
            Signature is valid and the smart contract reports status as ACTIVE.
          </p>
          <div className="mt-2.5 font-mono text-[11px] text-emerald-700 font-bold space-y-0.5">
            <div>✓ SIGNATURE VALID</div>
            <div>✓ CREDENTIAL ACTIVE</div>
            <div>✓ VERIFICATION SUCCESSFUL</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border bg-white border-amber-300 shadow-sm text-slate-900 space-y-3">
          <span className="text-[10px] uppercase font-mono text-amber-800 block font-bold">
            ACTION: TRIGGER ON-CHAIN REVOCATION
          </span>
          <div className="font-bold text-sm">Issuer Revocation</div>
          <input
            type="text"
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            placeholder="Revocation Reason"
          />
          <button
            onClick={handleRevokeOnChain}
            disabled={isProcessingRevoke || isRevokedOnChain}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow"
          >
            {isProcessingRevoke ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isRevokedOnChain
              ? 'Already Revoked on Blockchain'
              : isMetaMaskConnected
              ? '🦊 Revoke on Blockchain via MetaMask'
              : 'Revoke Credential Now'}
          </button>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isRevokedOnChain
              ? 'bg-rose-50/70 border-rose-300 text-rose-950 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-rose-800 block font-bold">
            STATE 2: AFTER REVOCATION
          </span>
          <div className="font-bold text-sm mt-1 text-slate-900">Cryptographically Valid but Revoked</div>
          <p className="text-[11px] text-slate-600 mt-1">
            The signature remains genuine, but smart contract reports REVOKED.
          </p>
          <div className="mt-2.5 font-mono text-[11px] text-rose-700 font-bold space-y-0.5">
            <div>✓ SIGNATURE: VALID</div>
            <div>✗ ON-CHAIN STATUS: REVOKED</div>
            <div>✗ VERIFICATION: FAILED</div>
          </div>
        </div>
      </div>

      {/* Verification Diagnostics */}
      {report && (
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Live Cryptographic Verification Breakdown
            </h3>
            <StatusBadge
              status={report.isValid ? 'VALID' : 'REVOKED'}
              label={report.isValid ? 'CREDENTIAL VALID' : 'CREDENTIAL REVOKED ON-CHAIN'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Signature Check (ECDSA):</span>
              <p className="text-emerald-700 font-medium">
                {report.checks.signature.message}
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-1 ${
                report.checks.revocation.status === 'PASSED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <span className="font-bold block">On-Chain Revocation Status:</span>
              <p className="font-medium">
                {report.checks.revocation.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
