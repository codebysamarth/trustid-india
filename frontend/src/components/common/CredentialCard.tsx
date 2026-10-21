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
} from 'lucide-react';
import { TrustIdVerifiableCredential } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';

interface CredentialCardProps {
  credential: TrustIdVerifiableCredential;
  isRevoked?: boolean;
  onVerifyClick?: () => void;
  showVerifyAction?: boolean;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  isRevoked = false,
  onVerifyClick,
  showVerifyAction = true,
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
    <div className="relative rounded-2xl bg-gradient-to-b from-[#131F42] to-[#0D1630] border border-slate-700/60 shadow-xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
      {/* Decorative top security stripe */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 w-full" />

      {/* Watermark background badge */}
      <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none">
        <Award className="w-64 h-64 text-cyan-400" />
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        {/* Header: Institution & Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
                  Verifiable Academic Credential
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  W3C VC 2.0
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {issuer.name || subject.institution || 'Accredited University'}
              </h3>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3 text-slate-500" />
                {issuer.id}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2">
            <StatusBadge
              status={isRevoked ? 'REVOKED' : 'ACTIVE'}
              label={isRevoked ? 'REVOKED ON-CHAIN' : 'ACTIVE & VALID'}
            />
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {credential.id.split(':').pop()?.substring(0, 12)}...
            </span>
          </div>
        </div>

        {/* Student & Academic Claims */}
        <div className="bg-[#0A1024]/70 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" /> Student Name (Demo)
              </span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {subject.name}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Student ID: {subject.studentId}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-cyan-400" /> Degree & Programme
              </span>
              <p className="text-sm font-semibold text-cyan-200 mt-0.5">
                {subject.degree}
              </p>
              <p className="text-xs text-slate-300">
                {subject.programme}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400">Enrollment</span>
              <p className="font-medium text-emerald-400">{subject.enrollmentStatus || 'Active'}</p>
            </div>
            {subject.cgpa && (
              <div>
                <span className="text-[10px] text-slate-400">Cumulative GPA</span>
                <p className="font-medium text-white">{subject.cgpa} / 10.0</p>
              </div>
            )}
            <div>
              <span className="text-[10px] text-slate-400">Issue Date</span>
              <p className="font-mono text-slate-300">
                {credential.validFrom ? new Date(credential.validFrom).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Expires</span>
              <p className="font-mono text-slate-300">
                {credential.validUntil ? new Date(credential.validUntil).toLocaleDateString() : 'Perpetual'}
              </p>
            </div>
          </div>
        </div>

        {/* Cryptographic Proof Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/40 px-3.5 py-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 truncate">
            <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">
              Signature: <span className="font-mono text-slate-300">{proof.proofValue.substring(0, 18)}...</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-300/80 shrink-0">
            {proof.type}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Inspect structured W3C VC JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Inspect JSON
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {showVerifyAction && (
            <Link
              to="/verify"
              state={{ credentialToVerify: credential }}
              onClick={onVerifyClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify in Portal
            </Link>
          )}
        </div>
      </div>

      {/* JSON Inspection Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0E172E] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131F42]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h4 className="font-semibold text-white text-sm">
                  W3C Verifiable Credential 2.0 (Structured JSON)
                </h4>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 bg-slate-950 font-mono text-xs text-cyan-200">
              <pre>{JSON.stringify(credential, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-[#131F42]">
              <span className="text-xs text-slate-400">
                Cryptographically signed using RFC 8785 canonical hash & Secp256k1
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition"
                >
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
