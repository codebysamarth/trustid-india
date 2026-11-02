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
  KeyRound,
  Building,
  Calendar,
  Activity,
  Award,
  User,
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
    verifierName: 'Scholarship & Academic Verification Authority',
    organization: 'Ministry of Higher Education',
    requiredEnrollmentStatus: 'Active',
    requireActiveStatus: false,
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Check if passed via react-router state
  useEffect(() => {
    const passedCredential = (location.state as any)?.credential || (location.state as any)?.credentialToVerify;
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
      console.warn('Could not load credentials:', err);
    }
  };

  const handleSelectPreset = (c: TrustIdVerifiableCredential) => {
    setSelectedCredential(c);
    setPastedJson(JSON.stringify(c, null, 2));
    setReport(null);
    setErrorNotice(null);
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
        setReport(null);
        setErrorNotice(null);
      } catch (err: any) {
        setErrorNotice(`Failed to parse file as JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const runVerification = async (targetVc?: TrustIdVerifiableCredential) => {
    setErrorNotice(null);
    setIsVerifying(true);

    try {
      let vcToVerify = targetVc;
      if (!vcToVerify) {
        try {
          vcToVerify = JSON.parse(pastedJson);
        } catch (err: any) {
          setErrorNotice('Invalid JSON format. Please verify the JSON syntax before submitting.');
          setIsVerifying(false);
          return;
        }
      }

      const res = await verifyCredentialApi(vcToVerify, policy);
      if (res.success && res.report) {
        setReport(res.report);
        if (vcToVerify?.id) {
          logVerificationHistory({
            credentialId: vcToVerify.id,
            studentName: res.report.credentialSummary?.studentName || 'Student',
            outcome: res.report.overallOutcome,
            isValid: res.report.isValid,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        setErrorNotice(res.error || 'Verification failed unexpectedly.');
      }
    } catch (err: any) {
      setErrorNotice(`Verification request failed: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Role Banner for Evaluation Clarity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 uppercase tracking-wider">
                PORTAL: EMPLOYER & VERIFIER
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Persona: Recruiter / Background Verification Agency
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              7-Stage Cryptographic & Blockchain Verifier
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verify degree authenticity mathematically without calling or querying the university database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-200 text-xs font-bold text-emerald-800 shrink-0">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Consortium EVM Smart Contract Audit</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-emerald-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                Select Credential to Verify
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setInputMode('SAMPLE')}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-semibold transition ${
                    inputMode === 'SAMPLE' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setInputMode('PASTE')}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-semibold transition ${
                    inputMode === 'PASTE' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  JSON Paste
                </button>
                <button
                  onClick={() => setInputMode('FILE')}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-semibold transition ${
                    inputMode === 'FILE' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Presets List */}
            {inputMode === 'SAMPLE' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Select an available credential from registry or wallet:
                </label>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {availableCredentials.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPreset(c)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs flex flex-col gap-0.5 transition ${
                        selectedCredential?.id === c.id
                          ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {c.credentialSubject?.name || 'Student'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.credentialSubject?.studentId}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 truncate">
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
                <label className="block text-[11px] font-semibold text-slate-600">
                  Upload W3C VC .json file:
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
            )}

            {/* JSON Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Credential JSON Payload:</span>
                <span className="font-mono text-emerald-700 font-semibold">RFC 8785 Canonical</span>
              </div>
              <textarea
                rows={9}
                value={pastedJson}
                onChange={(e) => {
                  setPastedJson(e.target.value);
                  try {
                    setSelectedCredential(JSON.parse(e.target.value));
                  } catch {}
                }}
                className="w-full bg-slate-900 text-emerald-400 border border-slate-700 rounded-xl p-3 font-mono text-[11px] focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder="Paste Verifiable Credential JSON here..."
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={() => runVerification()}
              disabled={isVerifying || !pastedJson.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running 7-Stage Audit...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Run Cryptographic Verification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Verification Report */}
        <div className="lg:col-span-7 space-y-4">
          {errorNotice && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {report ? (
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
              {/* Overall Verification Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  report.isValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      report.isValid
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-rose-600 text-white shadow-sm'
                    }`}
                  >
                    {report.isValid ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <XCircle className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold block">
                      Overall Verification Verdict
                    </span>
                    <h3 className="text-xl font-extrabold mt-0.5">
                      {report.overallOutcome}
                    </h3>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {report.summaryMessage}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block font-mono">Timestamp</span>
                  <span className="text-xs font-mono font-bold">
                    {new Date(report.verifiedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Credential Subject Summary */}
              {report.credentialSummary && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Student Subject</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {report.credentialSummary.studentName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {report.credentialSummary.studentId}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Degree & Programme</span>
                    <p className="font-bold text-emerald-800 mt-0.5">
                      {report.credentialSummary.degree}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {report.credentialSummary.programme}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Issuing University</span>
                    <p className="font-semibold text-slate-800 mt-0.5 truncate">
                      {report.credentialSummary.institution}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Enrollment</span>
                    <p className="font-bold text-emerald-700 mt-0.5">
                      {report.credentialSummary.enrollmentStatus}
                    </p>
                  </div>
                </div>
              )}

              {/* Independent Checks Detailed Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Independent Cryptographic & Blockchain Checks
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    All Checks Evaluated Independently
                  </span>
                </div>

                <CheckResultRow
                  title="Check 1: Structural Conformance"
                  sub="W3C Verifiable Credentials Data Model v2.0 schema, context & mandatory properties."
                  detail={report.checks.structural}
                />

                <CheckResultRow
                  title="Check 2: Cryptographic Signature Validation"
                  sub="Recovers issuer public key from Secp256k1 signature and canonical RFC 8785 digest."
                  detail={report.checks.signature}
                />

                <CheckResultRow
                  title="Check 3: Issuer Trust & Accreditation"
                  sub="Checks whether the recovered signing address is registered in IssuerRegistry smart contract."
                  detail={report.checks.issuerTrust}
                />

                <CheckResultRow
                  title="Check 4: Temporal Validity & Expiration"
                  sub="Validates validFrom and validUntil timestamps against current system time."
                  detail={report.checks.expiration}
                />

                <CheckResultRow
                  title="Check 5: Decentralized Revocation Status"
                  sub="Queries CredentialStatusRegistry smart contract to ensure the credential is active."
                  detail={report.checks.revocation}
                />

                <CheckResultRow
                  title="Check 6: Policy & Eligibility Claim Validation"
                  sub="Checks whether the candidate satisfies the verifier's specific academic criteria."
                  detail={report.checks.claimValidation}
                />
              </div>

              {/* Audit Trail */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Audit Log & Execution Steps
                </h5>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1">
                  {report.auditTrail.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-slate-500">[{log.timestamp.substring(11, 19)}]</span>
                      <span
                        className={log.status === 'SUCCESS' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}
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
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                Verification Engine Ready
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a credential from the left and click "Run Cryptographic Verification" to execute the 7 independent trust and validity checks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CheckResultRowProps {
  title: string;
  sub: string;
  detail: any;
}

const CheckResultRow: React.FC<CheckResultRowProps> = ({ title, sub, detail }) => {
  const isPassed = detail.status === 'PASSED';
  const isFailed = detail.status === 'FAILED';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h5 className="text-xs font-bold text-slate-900">
            {title}
          </h5>
          <p className="text-[11px] text-slate-500">{sub}</p>
        </div>
        <StatusBadge status={detail.status} size="sm" />
      </div>

      <div className="pt-0.5 text-xs">
        <p
          className={`text-[11px] ${
            isPassed
              ? 'text-emerald-700 font-medium'
              : isFailed
              ? 'text-rose-700 font-bold'
              : 'text-amber-700 font-medium'
          }`}
        >
          {detail.message}
        </p>

        {detail.details && (
          <div className="mt-1 p-2 rounded-lg bg-white border border-slate-200 font-mono text-[10px] text-slate-700 overflow-x-auto">
            {Object.entries(detail.details).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-400">{k}:</span>
                <span className="text-slate-800 font-semibold truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
