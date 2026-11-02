import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  Building,
  User,
  FileCode,
  X,
  Trash2,
} from 'lucide-react';
import { TrustIdVerifiableCredential } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';

interface CredentialCardProps {
  credential: TrustIdVerifiableCredential;
  isRevoked?: boolean;
  onVerifyClick?: () => void;
  showVerifyAction?: boolean;
  onDelete?: () => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  isRevoked = false,
  onVerifyClick,
  showVerifyAction = true,
  onDelete,
}) => {
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const subject = credential.credentialSubject;
  const issuer = credential.issuer;
  const proof = credential.proof;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(credential, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.studentId || 'credential'}-W3C-VC.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative bg-white border border-slate-200 hover:border-emerald-300 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Top emerald accent ribbon */}
      <div
        className={`h-2 w-full rounded-t-3xl ${
          isRevoked ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }`}
      />

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        
        {/* =========================================================================
            HEADER: Institution & Responsive Status Badge
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
          
          {/* Left: Institution Info with proper max-w and truncation */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-700">
                  Verifiable Academic Credential
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
                  W3C VC 2.0
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 truncate">
                {issuer.name || subject.institution || 'Accredited University'}
              </h3>
              <p
                className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5 truncate"
                title={issuer.id}
              >
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{issuer.id}</span>
              </p>
            </div>
          </div>

          {/* Right: Status Badge & Optional Clean Delete Button (Shrink-0 prevents cutoff) */}
          <div className="flex items-center sm:items-end sm:flex-col justify-between sm:justify-start gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={isRevoked ? 'REVOKED' : 'ACTIVE'}
                label={isRevoked ? 'REVOKED ON-CHAIN' : 'ACTIVE & VALID'}
                size="sm"
              />
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                  title="Remove credential from local wallet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {credential.id.split(':').pop()?.substring(0, 10)}...
            </span>
          </div>

        </div>

        {/* =========================================================================
            STUDENT & ACADEMIC CLAIMS (Clean grid layout)
           ========================================================================= */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-600" /> Student Name
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {subject.name}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                ID: {subject.studentId}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-600" /> Degree & Programme
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                {subject.degree}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {subject.programme}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-slate-200/60 text-xs">
            {subject.cgpa && (
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">CGPA</span>
                <span className="font-bold text-slate-800 font-mono text-xs sm:text-sm">
                  {subject.cgpa} / 10.0
                </span>
              </div>
            )}
            {subject.graduationYear && (
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Graduation</span>
                <span className="font-semibold text-slate-800 text-xs">
                  Class of {subject.graduationYear}
                </span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Status</span>
              <span className="font-semibold text-emerald-700 text-xs">
                {subject.enrollmentStatus || 'Conferred'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Issue Date</span>
              <span className="font-mono text-slate-600 text-[11px]">
                {new Date(credential.validFrom).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CRYPTOGRAPHIC PROOF SUMMARY (Truncated & clean)
           ========================================================================= */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Cryptographic Digital Proof
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-semibold">
              Secp256k1 Recovery
            </span>
          </div>
          <div className="font-mono text-[10px] sm:text-[11px] text-slate-600 break-all bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-400">Signature: </span>
            {proof?.proofValue
              ? `${proof.proofValue.substring(0, 24)}...${proof.proofValue.substring(proof.proofValue.length - 18)}`
              : 'Unsigned'}
          </div>
        </div>

        {/* =========================================================================
            ACTION BUTTONS (Export, Inspect JSON, Verify)
           ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowJsonModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Inspect W3C JSON</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>

          {showVerifyAction && (
            <div>
              {onVerifyClick ? (
                <button
                  onClick={onVerifyClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credential</span>
                </button>
              ) : (
                <Link
                  to="/verify"
                  state={{ credential }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credential</span>
                </Link>
              )}
            </div>
          )}
        </div>

      </div>

      {/* JSON Inspection Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  W3C Verifiable Credential Data Model 2.0 (Canonical JSON)
                </h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-emerald-400">
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(credential, null, 2)}
              </pre>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Compliant with W3C VC 2.0 and RFC 8785 canonicalization.
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
