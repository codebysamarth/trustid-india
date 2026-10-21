import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  FileCode,
  Layers,
  Sparkles,
  KeyRound,
  Building,
  Calendar,
  Activity,
  Award,
  User,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { verifyCredentialApi, fetchSampleCredential, fetchIssuedCredentials } from '../services/api';
import { getStoredCredentials, logVerificationHistory } from '../services/walletStorage';
import { TrustIdVerifiableCredential, VerificationReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const VerifyPortal: React.FC = () => {
  const location = useLocation();

  // Mode: 'SAMPLE' | 'PASTE' | 'FILE'
  const [inputMode, setInputMode] = useState<'SAMPLE' | 'PASTE' | 'FILE'>('SAMPLE');
  const [pastedJson, setPastedJson] = useState('');
  const [selectedCredential, setSelectedCredential] = useState<TrustIdVerifiableCredential | null>(null);
  const [availableCredentials, setAvailableCredentials] = useState<TrustIdVerifiableCredential[]>([]);

  // Policy options
  const [policy, setPolicy] = useState({
    verifierName: 'National Merit Scholarship Portal — Verifier',
    organization: 'Ministry of Education & Academic Services',
    requiredEnrollmentStatus: 'Active',
    requireActiveStatus: true,
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Check if passed via react-router state
  useEffect(() => {
    const passedCredential = (location.state as any)?.credentialToVerify;
    if (passedCredential) {
      setSelectedCredential(passedCredential);
      setPastedJson(JSON.stringify(passedCredential, null, 2));
      setInputMode('PASTE');
      runVerification(passedCredential);
    } else {
      loadDemoCredentials();
    }
  }, [location.state]);

  const loadDemoCredentials = async () => {
    try {
      const fromWallet = getStoredCredentials().map((c) => c.credential);
      const issuedRes = await fetchIssuedCredentials();
      const fromBackend = issuedRes.success ? issuedRes.credentials.map((c: any) => c.credential) : [];

      // Deduplicate by ID
      const combined = [...fromWallet, ...fromBackend];
      const uniqueMap = new Map<string, TrustIdVerifiableCredential>();
      for (const c of combined) {
        if (c && c.id) uniqueMap.set(c.id, c);
      }

      let list = Array.from(uniqueMap.values());
      if (list.length === 0) {
        const sampleRes = await fetchSampleCredential();
        if (sampleRes.success && sampleRes.sample) {
          list = [sampleRes.sample];
        }
      }

      setAvailableCredentials(list);
      if (list.length > 0 && !selectedCredential) {
        setSelectedCredential(list[0]);
        setPastedJson(JSON.stringify(list[0], null, 2));
      }
    } catch (err) {
      console.warn('Failed to load demo credentials list:', err);
    }
  };

  const handleSelectPreset = (vc: TrustIdVerifiableCredential) => {
    setSelectedCredential(vc);
    setPastedJson(JSON.stringify(vc, null, 2));
    setReport(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setPastedJson(text);
        const parsed = JSON.parse(text);
        setSelectedCredential(parsed);
      } catch (err) {
        setErrorNotice('Uploaded file is not valid JSON');
      }
    };
    reader.readAsText(file);
  };

  const runVerification = async (targetVc?: any) => {
    setIsVerifying(true);
    setErrorNotice(null);
    setReport(null);

    let payload = targetVc;
    if (!payload) {
      try {
        payload = JSON.parse(pastedJson);
      } catch (err: any) {
        setErrorNotice(`JSON parsing error: ${err.message}`);
        setIsVerifying(false);
        return;
      }
    }

    try {
      const result = await verifyCredentialApi(payload, policy);
      if (result.success && result.report) {
        setReport(result.report);

        // Record into student wallet history
        if (result.report.credentialSummary) {
          logVerificationHistory({
            credentialId: result.report.credentialSummary.id,
            studentName: result.report.credentialSummary.studentName,
            outcome: result.report.overallOutcome,
            isValid: result.report.isValid,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        setErrorNotice(result.error || 'Verification request failed');
      }
    } catch (err: any) {
      setErrorNotice(`Verification request error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              Independent Verifier Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Academic Credential Verification Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Independently verify digital signatures, on-chain issuer authority, and real-time revocation status without contacting the university.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#131F42] border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs">
          <Building className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium">
            Verifier: <strong className="text-white">Scholarship & Placement Portal</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Modes & JSON Editor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#131F42]/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            {/* Input Mode Selector */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Credential Input
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setInputMode('SAMPLE')}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition ${
                    inputMode === 'SAMPLE' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setInputMode('PASTE')}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition ${
                    inputMode === 'PASTE' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JSON Paste
                </button>
                <button
                  onClick={() => setInputMode('FILE')}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition ${
                    inputMode === 'FILE' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Presets List */}
            {inputMode === 'SAMPLE' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-slate-400">
                  Select an available demo credential:
                </label>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {availableCredentials.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPreset(c)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs flex flex-col gap-0.5 transition ${
                        selectedCredential?.id === c.id
                          ? 'bg-cyan-950/80 border-cyan-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-200">
                          {c.credentialSubject?.name || 'Student'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.credentialSubject?.studentId}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">
                        {c.credentialSubject?.degree} — {c.credentialSubject?.programme}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Mode */}
            {inputMode === 'FILE' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-slate-400">
                  Upload W3C VC .json file:
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
            )}

            {/* JSON Editor / Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Credential JSON Payload:</span>
                <span className="font-mono text-cyan-400">RFC 8785 Format</span>
              </div>
              <textarea
                rows={10}
                value={pastedJson}
                onChange={(e) => {
                  setPastedJson(e.target.value);
                  try {
                    setSelectedCredential(JSON.parse(e.target.value));
                  } catch {}
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-[11px] text-cyan-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                placeholder="Paste Verifiable Credential JSON here..."
              />
            </div>

            {/* Verifier Policy Settings Toggle */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Verifier Requirement Check</span>
                <span className="text-[10px] text-cyan-400 font-mono">Scholarship Policy</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  id="requireActive"
                  checked={policy.requireActiveStatus}
                  onChange={(e) => setPolicy({ ...policy, requireActiveStatus: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500"
                />
                <label htmlFor="requireActive" className="cursor-pointer">
                  Require Enrollment Status = "Active" for eligibility
                </label>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={() => runVerification()}
              disabled={isVerifying || !pastedJson.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running 7-Stage Verification Engine...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify Credential Independently
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Verification Report */}
        <div className="lg:col-span-7 space-y-5">
          {errorNotice && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {report ? (
            <div className="bg-[#131F42]/80 border border-slate-700 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl">
              {/* Overall Verification Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  report.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      report.isValid
                        ? 'bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-900/60 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {report.isValid ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <XCircle className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold block">
                      Overall Verification Verdict
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      {report.overallOutcome}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {report.summaryMessage}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block font-mono">Verified At</span>
                  <span className="text-xs font-mono text-slate-200 font-semibold">
                    {new Date(report.verifiedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Credential Subject Summary */}
              {report.credentialSummary && (
                <div className="bg-[#0A1024]/70 border border-slate-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Student Subject</span>
                    <p className="font-semibold text-white mt-0.5">
                      {report.credentialSummary.studentName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {report.credentialSummary.studentId}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Degree & Programme</span>
                    <p className="font-semibold text-cyan-300 mt-0.5">
                      {report.credentialSummary.degree}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {report.credentialSummary.programme}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Issuing Institution</span>
                    <p className="font-semibold text-slate-200 mt-0.5 truncate">
                      {report.credentialSummary.institution}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Enrollment</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">
                      {report.credentialSummary.enrollmentStatus}
                    </p>
                  </div>
                </div>
              )}

              {/* All 6 Independent Checks Detailed Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Independent Cryptographic & Blockchain Checks
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    All 6 Checks Must Pass
                  </span>
                </div>

                {/* Check 1: Structure */}
                <CheckResultRow
                  checkNumber={1}
                  title="Check 1: Structural Conformance"
                  sub="W3C Verifiable Credentials Data Model v2.0 schema, context & mandatory properties."
                  detail={report.checks.structural}
                />

                {/* Check 2: Signature */}
                <CheckResultRow
                  checkNumber={2}
                  title="Check 2: Cryptographic Signature Validation"
                  sub="Recovers issuer public key from Secp256k1 signature and canonical RFC 8785 digest."
                  detail={report.checks.signature}
                />

                {/* Check 3: Issuer Trust */}
                <CheckResultRow
                  checkNumber={3}
                  title="Check 3: Issuer Trust & Accreditation"
                  sub="Checks whether the recovered signing address is registered in IssuerRegistry smart contract."
                  detail={report.checks.issuerTrust}
                />

                {/* Check 4: Expiration */}
                <CheckResultRow
                  checkNumber={4}
                  title="Check 4: Temporal Validity & Expiration"
                  sub="Validates validFrom and validUntil timestamps against current system time."
                  detail={report.checks.expiration}
                />

                {/* Check 5: Revocation */}
                <CheckResultRow
                  checkNumber={5}
                  title="Check 5: Decentralized Revocation Status"
                  sub="Queries CredentialStatusRegistry smart contract to ensure the credential is active."
                  detail={report.checks.revocation}
                />

                {/* Check 6: Claims */}
                <CheckResultRow
                  checkNumber={6}
                  title="Check 6: Policy & Eligibility Claim Validation"
                  sub="Checks whether the candidate satisfies the verifier's specific academic criteria."
                  detail={report.checks.claimValidation}
                />
              </div>

              {/* Cryptographic Audit Trail */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Verification Execution Log & Audit Trail
                </h5>
                <div className="bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1">
                  {report.auditTrail.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-slate-500">[{log.timestamp.substring(11, 19)}]</span>
                      <span
                        className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {log.step}:
                      </span>
                      <span className="text-slate-300">{log.info}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#131F42]/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <ShieldCheck className="w-14 h-14 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">
                Verification Engine Idle
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a demo credential on the left and click "Verify Credential Independently" to run the 7 cryptographic & blockchain trust checks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CheckResultRowProps {
  checkNumber: number;
  title: string;
  sub: string;
  detail: any;
}

const CheckResultRow: React.FC<CheckResultRowProps> = ({ checkNumber, title, sub, detail }) => {
  const isPassed = detail.status === 'PASSED';
  const isWarning = detail.status === 'WARNING';
  const isFailed = detail.status === 'FAILED';

  return (
    <div className="bg-[#0D1630] border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h5 className="text-xs font-bold text-white flex items-center gap-2">
            <span>{title}</span>
          </h5>
          <p className="text-[11px] text-slate-400">{sub}</p>
        </div>
        <StatusBadge status={detail.status} size="sm" />
      </div>

      <div className="pt-1 text-xs">
        <p
          className={`leading-relaxed text-[11px] ${
            isPassed
              ? 'text-emerald-300'
              : isFailed
              ? 'text-rose-300 font-semibold'
              : 'text-amber-300'
          }`}
        >
          {detail.message}
        </p>

        {detail.details && (
          <div className="mt-1.5 p-2 rounded bg-slate-950 font-mono text-[10px] text-cyan-200/90 overflow-x-auto">
            {Object.entries(detail.details).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-500">{k}:</span>
                <span className="text-cyan-300 truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
