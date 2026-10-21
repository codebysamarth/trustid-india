import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Key,
  ExternalLink,
  History,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import {
  issueCredentialApi,
  fetchIssuedCredentials,
  revokeCredentialApi,
  fetchIssuerDetails,
  registerIssuerApi,
} from '../services/api';
import { CredentialCard } from '../components/common/CredentialCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustIdVerifiableCredential } from '../types';
import { saveCredentialToWallet } from '../services/walletStorage';

export const IssuerDashboard: React.FC = () => {
  const { address, isConnected, selectedRole, switchRole } = useWallet();

  // Registration & Status state
  const [issuerInfo, setIssuerInfo] = useState<{
    isAuthorized: boolean;
    isRegistered: boolean;
    name?: string;
  } | null>(null);
  const [isRegisteringIssuer, setIsRegisteringIssuer] = useState(false);
  const [regForm, setRegForm] = useState({
    name: 'Indian Institute of Technology Bombay — DEMO',
    detailsUri: 'https://www.iitb.ac.in/academic-demo',
  });

  // Credential issuance form
  const [formData, setFormData] = useState({
    studentName: 'Aarav Sharma — DEMO',
    studentId: 'BT-CS-2023-042',
    institution: 'Indian Institute of Technology Bombay — DEMO',
    degree: 'Bachelor of Technology',
    programme: 'Computer Science & Engineering',
    enrollmentStatus: 'Active',
    cgpa: '9.24',
    graduationYear: 2026,
    expirationDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestIssuedVc, setLatestIssuedVc] = useState<TrustIdVerifiableCredential | null>(null);
  const [issuedHistory, setIssuedHistory] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Revocation state
  const [revokeTarget, setRevokeTarget] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState('Degree revoked due to academic misconduct');
  const [isRevoking, setIsRevoking] = useState(false);

  // Load issuer authorization status
  useEffect(() => {
    if (address) {
      loadIssuerStatus(address);
    }
    loadIssuedCredentials();
  }, [address]);

  const loadIssuerStatus = async (addr: string) => {
    try {
      const data = await fetchIssuerDetails(addr);
      if (data.success) {
        setIssuerInfo({
          isAuthorized: data.isAuthorized,
          isRegistered: data.isRegistered,
          name: data.name,
        });
      }
    } catch (err: any) {
      console.warn('Could not load issuer info:', err.message);
    }
  };

  const loadIssuedCredentials = async () => {
    try {
      const data = await fetchIssuedCredentials();
      if (data.success) {
        setIssuedHistory(data.credentials || []);
      }
    } catch (err) {
      console.warn('Could not load issued credentials:', err);
    }
  };

  const handleRegisterIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setIsRegisteringIssuer(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await registerIssuerApi({
        issuerAddress: address,
        name: regForm.name,
        detailsUri: regForm.detailsUri,
        authorizeImmediately: true,
      });

      if (res.success) {
        setSuccessMessage(`University "${regForm.name}" registered and authorized in smart contract!`);
        await loadIssuerStatus(address);
      } else {
        setErrorMessage(res.error || 'Failed to register institution');
      }
    } catch (err: any) {
      setErrorMessage(`Registration error: ${err.message}`);
    } finally {
      setIsRegisteringIssuer(false);
    }
  };

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await issueCredentialApi(formData);
      if (res.success && res.credential) {
        setLatestIssuedVc(res.credential);
        setSuccessMessage('Verifiable Credential signed and status registered on-chain!');
        // Automatically save to local student wallet as well for convenience
        saveCredentialToWallet(res.credential, 'ISSUED');
        await loadIssuedCredentials();
      } else {
        setErrorMessage(res.error || 'Failed to issue credential.');
      }
    } catch (err: any) {
      setErrorMessage(`Issuance error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeCredential = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    setErrorMessage(null);

    try {
      const res = await revokeCredentialApi({
        credentialId: revokeTarget.credential.id,
        statusId: revokeTarget.statusId,
        reason: revokeReason,
      });

      if (res.success) {
        setSuccessMessage(`Credential successfully revoked on blockchain! Tx: ${res.transactionHash?.substring(0, 16)}...`);
        setRevokeTarget(null);
        await loadIssuedCredentials();
      } else {
        setErrorMessage(res.error || 'Revocation failed.');
      }
    } catch (err: any) {
      setErrorMessage(`Revocation error: ${err.message}`);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
              Institutional Authority Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            University Credential Issuer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Issue cryptographically signed W3C Verifiable Credentials and manage status on the EVM blockchain.
          </p>
        </div>

        {/* Issuer Accreditation Badge */}
        <div className="flex items-center gap-3 bg-[#131F42] border border-slate-700/80 rounded-xl px-4 py-3">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              On-Chain Accreditation
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={issuerInfo?.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}
                label={issuerInfo?.isAuthorized ? 'ACCREDITED ISSUER' : 'NOT AUTHORIZED'}
              />
              <span className="text-xs text-slate-300 font-medium">
                {issuerInfo?.name || 'Institutional Account'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Warning if connected address is not authorized */}
      {issuerInfo && !issuerInfo.isAuthorized && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                Account Not Registered as an Authorized Issuer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The current wallet address (<code className="text-amber-300 font-mono">{address}</code>) is not recorded in the on-chain <strong className="text-white">IssuerRegistry</strong>. Credential issuance requires institutional accreditation by governance authority.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterIssuer} className="pt-2 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              placeholder="University or College Name"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 flex-1 min-w-[240px]"
              required
            />
            <button
              type="submit"
              disabled={isRegisteringIssuer}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
            >
              {isRegisteringIssuer ? 'Registering on Blockchain...' : 'Register Institution Now'}
            </button>
          </form>
        </div>
      )}

      {/* Main Grid: Issuance Form & Latest Credential */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Credential Issuance Form */}
        <div className="lg:col-span-7 bg-[#131F42]/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                Issue Academic Credential
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              W3C VC 2.0 Compliant
            </span>
          </div>

          <form onSubmit={handleIssueCredential} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student Display Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="e.g. Aarav Sharma — DEMO"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Demo Student Identifier <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. BT-CS-2023-042"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Issuing University / Institution <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. Indian Institute of Technology Bombay — DEMO"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Degree / Programme Level <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Bachelor of Technology">Bachelor of Technology (B.Tech)</option>
                  <option value="Master of Technology">Master of Technology (M.Tech)</option>
                  <option value="Bachelor of Science">Bachelor of Science (B.Sc)</option>
                  <option value="Master of Science">Master of Science (M.Sc)</option>
                  <option value="Doctor of Philosophy">Doctor of Philosophy (Ph.D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Specialization / Programme <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.programme}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enrollment Status
                </label>
                <select
                  value={formData.enrollmentStatus}
                  onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cumulative GPA
                </label>
                <input
                  type="text"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  placeholder="e.g. 9.24"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Leave empty for perpetual academic degree credentials (per W3C VC 2.0 specification).
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <span>Personal data is kept strictly off-chain.</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/60 transition disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {isSubmitting ? 'Signing & Registering on Blockchain...' : 'Sign & Issue Credential'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Latest Issued Credential View */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Latest Issued Verifiable Credential
            </h3>
            {latestIssuedVc && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                Cryptographically Signed
              </span>
            )}
          </div>

          {latestIssuedVc ? (
            <CredentialCard credential={latestIssuedVc} />
          ) : (
            <div className="bg-[#131F42]/30 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">
                No Credential Issued in this Session
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Fill the form on the left and click "Sign & Issue Credential" to generate a W3C-compliant credential.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Previously Issued Credentials Table */}
      <div className="bg-[#131F42]/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Issued Credential Audit & Revocation Management
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {issuedHistory.length} Credentials Tracked
          </span>
        </div>

        {issuedHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No credentials issued yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0A1024] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Programme</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">On-Chain Status ID</th>
                  <th className="py-2.5 px-3">Issued At</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {issuedHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      {item.credential.credentialSubject.name}
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.credential.credentialSubject.studentId}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {item.credential.credentialSubject.degree}
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {item.credential.credentialSubject.programme}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        status={item.isRevoked ? 'REVOKED' : 'ACTIVE'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {item.statusId ? `${item.statusId.substring(0, 10)}...` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(item.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!item.isRevoked ? (
                        <button
                          onClick={() => setRevokeTarget(item)}
                          className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px] font-medium transition"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-[11px] text-rose-400 font-mono">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0E172E] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Revoke Academic Credential?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action writes an on-chain revocation event to the smart contract for credential identifier: <code className="font-mono text-cyan-300 text-[11px]">{revokeTarget.statusId?.substring(0, 16)}...</code>
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Official Revocation Reason
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Disciplinary suspension or credential re-issuance"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRevokeTarget(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeCredential}
                disabled={isRevoking}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow disabled:opacity-50"
              >
                {isRevoking ? 'Revoking on-chain...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
