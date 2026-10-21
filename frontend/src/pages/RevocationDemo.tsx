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
import { useWallet } from '../context/WalletContext';
import { TrustIdVerifiableCredential, VerificationReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const RevocationDemo: React.FC = () => {
  const { address } = useWallet();

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
        // Immediately re-verify to demonstrate the difference!
        await verifyCurrentState(activeVc);
      } else {
        setErrorMessage(res.error || 'Failed to revoke credential on-chain');
      }
    } catch (err: any) {
      setErrorMessage(`Revocation error: ${err.message}`);
    } finally {
      setIsProcessingRevoke(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-950/80 border border-amber-500/30 text-amber-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              Decentralized Status Registry Lifecycle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Credential Revocation & On-Chain Status Demonstration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Demonstrate how an authorized university revokes a credential on the blockchain, and how verifiers detect it while the cryptographic signature remains intact.
          </p>
        </div>

        <button
          onClick={loadTestCredential}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          Reset to Fresh Active Credential
        </button>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>✕</button>
        </div>
      )}

      {/* Step by Step Workflow Progression */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div
          className={`p-4 rounded-2xl border ${
            !isRevokedOnChain
              ? 'bg-[#131F42] border-cyan-500/40 text-white'
              : 'bg-[#0E172E] border-slate-800 text-slate-400'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-cyan-400 block font-semibold">
            STATE 1: BEFORE REVOCATION
          </span>
          <div className="font-bold text-sm mt-1">Authentic & Active</div>
          <p className="text-[11px] text-slate-300 mt-1">
            Signature is valid and the smart contract reports status as ACTIVE.
          </p>
          <div className="mt-2.5 font-mono text-[10px] text-emerald-400">
            ✓ SIGNATURE VALID <br />
            ✓ CREDENTIAL ACTIVE <br />
            ✓ VERIFICATION SUCCESSFUL
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-[#131F42] border-amber-500/40 text-white space-y-2">
          <span className="text-[10px] uppercase font-mono text-amber-400 block font-semibold">
            ACTION: TRIGGER ON-CHAIN REVOCATION
          </span>
          <div className="font-bold text-sm">Issuer Revocation</div>
          <input
            type="text"
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[11px] text-white"
            placeholder="Revocation Reason"
          />
          <button
            onClick={handleRevokeOnChain}
            disabled={isProcessingRevoke || isRevokedOnChain}
            className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow"
          >
            {isProcessingRevoke ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isRevokedOnChain ? 'Already Revoked on Blockchain' : 'Revoke Credential Now'}
          </button>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isRevokedOnChain
              ? 'bg-rose-950/30 border-rose-500/40 text-white'
              : 'bg-[#0E172E] border-slate-800 text-slate-400'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-rose-400 block font-semibold">
            STATE 2: AFTER REVOCATION
          </span>
          <div className="font-bold text-sm mt-1">Signature Valid, Status Fails</div>
          <p className="text-[11px] text-slate-300 mt-1">
            The cryptographic signature is untouched, but on-chain status check rejects the credential.
          </p>
          <div className="mt-2.5 font-mono text-[10px] text-rose-300">
            ✓ SIGNATURE VALID <br />
            ✕ CREDENTIAL REVOKED <br />
            ✕ VERIFICATION FAILED
          </div>
        </div>
      </div>

      {/* Verification Engine Real-Time Output */}
      {report && (
        <div className="bg-[#131F42]/80 border border-slate-700 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Independent Verifier Output
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">
                {report.overallOutcome}
              </h3>
            </div>
            <StatusBadge
              status={report.isValid ? 'ACTIVE' : 'REVOKED'}
              label={report.isValid ? 'CREDENTIAL VERIFIED' : 'VERIFICATION REJECTED'}
              size="lg"
            />
          </div>

          {/* Key Educational Distinction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  Check 2: Cryptographic Signature
                </span>
                <StatusBadge status={report.checks.signature.status} size="sm" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {report.checks.signature.message}
              </p>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                Notice: The cryptographic signature is STILL COMPLETELY VALID because the physical credential claims were never modified.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Check 5: On-Chain Revocation Status
                </span>
                <StatusBadge status={report.checks.revocation.status} size="sm" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {report.checks.revocation.message}
              </p>
              <div className="text-[10px] text-rose-300 font-mono pt-1">
                Notice: The verifier caught the revocation by independently querying the decentralized smart contract registry!
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
            <strong className="text-white block">Key Architectural Takeaway:</strong>
            <p>
              This demonstration proves why cryptographic signature verification alone is insufficient for real-world identity. A credential can be legitimately issued, but subsequent events (such as academic misconduct, degree revocation, or license suspension) require an independent, real-time revocation registry. The blockchain provides this registry without revealing student PII.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
