import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Building2,
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
  Zap,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import {
  issueCredentialApi,
  fetchIssuedCredentials,
  revokeCredentialApi,
  fetchIssuerDetails,
  registerIssuerApi,
  recordCredentialApi,
  syncRevocationApi,
} from '../services/api';
import {
  getStatusRegistryAddress,
  signCredentialWithMetaMask,
  registerCredentialOnChainWithMetaMask,
  revokeCredentialOnChainWithMetaMask,
} from '../services/contractService';
import { CredentialCard } from '../components/common/CredentialCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustIdVerifiableCredential } from '../types';
import { saveCredentialToWallet } from '../services/walletStorage';

export const IssuerDashboard: React.FC = () => {
  const {
    address,
    isConnected,
    signer,
    isMetaMaskConnected,
    isHardhatNetwork,
    promptAddHardhatNetwork,
    connectMetaMask,
    balance,
  } = useWallet();

  // Registration & Status state
  const [issuerInfo, setIssuerInfo] = useState<{
    isAuthorized: boolean;
    isRegistered: boolean;
    name?: string;
  } | null>(null);
  const [isRegisteringIssuer, setIsRegisteringIssuer] = useState(false);
  const [regForm, setRegForm] = useState({
    name: 'Indian Institute of Technology Bombay',
    detailsUri: 'https://www.iitb.ac.in/academic-registry',
  });

  // Credential issuance form
  const [formData, setFormData] = useState({
    studentName: 'Aarav Sharma',
    studentId: 'BT-CS-2023-042',
    institution: 'Indian Institute of Technology Bombay',
    degree: 'Bachelor of Technology',
    programme: 'Computer Science & Engineering',
    enrollmentStatus: 'Graduated',
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
  const [hideRevoked, setHideRevoked] = useState(false);

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
        setSuccessMessage(`University "${regForm.name}" registered and accredited in the on-chain smart contract!`);
        await loadIssuerStatus(address);
      } else {
        setErrorMessage(res.error || 'Failed to register institution.');
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
      if (isMetaMaskConnected && signer && address) {
        // Check if on correct Consortium Network (Chain 31337)
        if (!isHardhatNetwork) {
          setErrorMessage(
            'Wrong Network Detected: Your MetaMask is connected to another network (Polygon Amoy 0x13882). Click "Switch to Chain 31337" above to switch to the consortium blockchain where contracts are deployed.'
          );
          await promptAddHardhatNetwork();
          setIsSubmitting(false);
          return;
        }

        // --- REAL METAMASK SIGNING & ON-CHAIN TRANSACTION ---
        const uniqueUuid =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'vc-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
        const credentialUrn = `urn:uuid:${uniqueUuid}`;
        const statusId = ethers.keccak256(ethers.toUtf8Bytes(credentialUrn));
        const statusRegistryAddress = getStatusRegistryAddress();
        const issueDate = new Date().toISOString();

        const unsignedVc: Omit<TrustIdVerifiableCredential, 'proof'> = {
          '@context': [
            'https://www.w3.org/ns/credentials/v2',
            'https://trustid.gov.in/contexts/v2',
          ],
          id: credentialUrn,
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: {
            id: `did:ethr:${address}`,
            name: formData.institution || issuerInfo?.name || 'Accredited University',
          },
          validFrom: issueDate,
          validUntil: formData.expirationDate || undefined,
          credentialSubject: {
            id: `did:example:student-${formData.studentId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: formData.studentName,
            studentId: formData.studentId,
            institution: formData.institution,
            degree: formData.degree,
            programme: formData.programme,
            enrollmentStatus: formData.enrollmentStatus as any,
            cgpa: formData.cgpa || undefined,
            graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
          },
          credentialStatus: {
            id: statusId,
            type: 'EthereumCredentialStatusList2026',
            statusRegistryContract: statusRegistryAddress,
            statusPurpose: 'revocation',
          },
        };

        // Step 1: MetaMask Signature Request
        setSuccessMessage('MetaMask Step 1/2: Please approve the digital signature request in your MetaMask popup...');
        const signedVc = await signCredentialWithMetaMask(signer, unsignedVc);

        // Step 2: MetaMask On-Chain Transaction
        setSuccessMessage('MetaMask Step 2/2: Digital signature valid! Now approve the on-chain registration transaction in MetaMask...');
        const chainTx = await registerCredentialOnChainWithMetaMask(signer, statusId);

        // Save to student wallet & record on backend
        saveCredentialToWallet(signedVc, 'ISSUED');
        await recordCredentialApi({
          credential: signedVc,
          statusId,
          txHash: chainTx.transactionHash,
        });

        setLatestIssuedVc(signedVc);
        setSuccessMessage(`Success! Credential signed with your MetaMask private key and registered on-chain! Tx: ${chainTx.transactionHash.substring(0, 18)}...`);
        await loadIssuedCredentials();
      } else {
        // Fallback if MetaMask not connected
        const res = await issueCredentialApi(formData);
        if (res.success && res.credential) {
          setLatestIssuedVc(res.credential);
          setSuccessMessage('Verifiable Credential signed and status registered on-chain!');
          saveCredentialToWallet(res.credential, 'ISSUED');
          await loadIssuedCredentials();
        } else {
          setErrorMessage(res.error || 'Failed to issue credential.');
        }
      }
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('rejected')) {
        setErrorMessage('Action was cancelled in MetaMask.');
      } else if (err.message?.includes('0x13882') || err.message?.includes('gas price below minimum') || err.message?.includes('gas tip cap')) {
        setErrorMessage(
          'Network Mismatch: MetaMask is connected to Polygon Amoy (0x13882). Click "Switch to Chain 31337" to connect to the local Consortium Blockchain where the contracts are deployed.'
        );
      } else {
        setErrorMessage(`Issuance error: ${err.message || String(err)}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeCredential = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    setErrorMessage(null);

    const credentialIssuerDid = revokeTarget.credential?.issuer?.id || '';
    const isOwnerOfCredential = address && credentialIssuerDid.toLowerCase().includes(address.toLowerCase());

    try {
      if (isMetaMaskConnected && signer && isOwnerOfCredential) {
        // The connected MetaMask account is the original issuer -> Revoke directly via MetaMask!
        setSuccessMessage('MetaMask: Please confirm the revocation transaction in your MetaMask popup...');
        const chainTx = await revokeCredentialOnChainWithMetaMask(
          signer,
          revokeTarget.statusId,
          revokeReason
        );
        await syncRevocationApi({
          credentialId: revokeTarget.credential?.id,
          statusId: revokeTarget.statusId,
          reason: revokeReason,
        });
        setIssuedHistory((prev) =>
          prev.map((i) =>
            i.statusId === revokeTarget.statusId || i.credential?.id === revokeTarget.credential?.id
              ? { ...i, isRevoked: true, revocationReason: revokeReason }
              : i
          )
        );
        setSuccessMessage(`Success! Credential revoked on-chain via your MetaMask account! Tx: ${chainTx.transactionHash?.substring(0, 16)}...`);
        setRevokeTarget(null);
        await loadIssuedCredentials();
      } else {
        // Credential was issued by a demo institution or governance authority -> Revoke via Consortium Governor
        setSuccessMessage('Consortium Governance: Revoking credential on-chain via smart contract...');
        const res = await revokeCredentialApi({
          credentialId: revokeTarget.credential?.id,
          statusId: revokeTarget.statusId,
          reason: revokeReason,
        });

        if (res.success) {
          await syncRevocationApi({
            credentialId: revokeTarget.credential?.id,
            statusId: revokeTarget.statusId,
            reason: revokeReason,
          });
          setIssuedHistory((prev) =>
            prev.map((i) =>
              i.statusId === revokeTarget.statusId || i.credential?.id === revokeTarget.credential?.id
                ? { ...i, isRevoked: true, revocationReason: revokeReason }
                : i
            )
          );
          setSuccessMessage(`Success! Credential revoked on blockchain! Tx: ${res.transactionHash?.substring(0, 16)}...`);
          setRevokeTarget(null);
          await loadIssuedCredentials();
        } else {
          setErrorMessage(res.error || 'Revocation failed.');
        }
      }
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('rejected')) {
        setErrorMessage('Revocation transaction was cancelled in MetaMask.');
      } else {
        // Fallback to governor API if MetaMask call reverts (e.g., unauthorized on smart contract)
        try {
          const res = await revokeCredentialApi({
            credentialId: revokeTarget.credential.id,
            statusId: revokeTarget.statusId,
            reason: revokeReason,
          });
          if (res.success) {
            setSuccessMessage(`Credential successfully revoked on-chain by Consortium Governance! Tx: ${res.transactionHash?.substring(0, 16)}...`);
            setRevokeTarget(null);
            await loadIssuedCredentials();
            return;
          }
        } catch (e) {}
        setErrorMessage(`Revocation error: ${err.message || String(err)}`);
      }
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Role Banner for Evaluation Clarity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                PORTAL: UNIVERSITY ISSUER
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Persona: Institutional Registrar ({regForm.name})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              University Issuance & Status Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Sign W3C Verifiable Credentials with MetaMask and anchor status hashes to the consortium EVM ledger.
            </p>
          </div>
        </div>

        {/* Accreditation Status Card */}
        <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-4 py-3 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              On-Chain Accreditation
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={issuerInfo?.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}
                label={issuerInfo?.isAuthorized ? 'ACCREDITED UNIVERSITY' : 'NOT ACCREDITED'}
              />
              <span className="text-xs text-slate-800 font-bold truncate max-w-[180px]">
                {issuerInfo?.name || 'Institutional Account'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wrong Network Warning Banner */}
      {isMetaMaskConnected && !isHardhatNetwork && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
                  Network Mismatch Detected
                </span>
                <span className="text-xs font-mono text-amber-800 font-bold">
                  Chain 0x13882 (Polygon Amoy)
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Your MetaMask is connected to Polygon Amoy instead of Consortium Chain 31337
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                The smart contracts (<code className="font-mono text-amber-900 font-semibold">IssuerRegistry.sol</code> and <code className="font-mono text-amber-900 font-semibold">CredentialStatusRegistry.sol</code>) are hosted on your local consortium node at <code className="font-mono text-amber-900 font-semibold">http://127.0.0.1:8545</code>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={promptAddHardhatNetwork}
            className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Switch to Chain 31337</span>
          </button>
        </div>
      )}

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Warning & 1-Click Accreditation if connected address is not yet accredited */}
      {issuerInfo && !issuerInfo.isAuthorized && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Connected MetaMask Account Not Yet Accredited in Smart Contract
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your MetaMask address (<code className="text-amber-800 font-mono font-semibold">{address}</code>) is not registered in <strong className="text-slate-800">IssuerRegistry.sol</strong>. You can register and accredit your university in 1 click below:
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterIssuer} className="pt-2 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              placeholder="University or College Name"
              className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 flex-1 min-w-[260px] focus:outline-none focus:border-emerald-500"
              required
            />
            <button
              type="submit"
              disabled={isRegisteringIssuer}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isRegisteringIssuer ? 'Accrediting on Blockchain...' : 'Accredit Institution on Blockchain'}
            </button>
          </form>
        </div>
      )}

      {/* Main Grid: Issuance Form & Latest Credential */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Credential Issuance Form */}
        <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Issue Student Academic Degree
              </h2>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              W3C VC 2.0 Standard
            </span>
          </div>

          <form onSubmit={handleIssueCredential} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student PRN / Roll Number <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. BT-CS-2023-042"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issuing University / Institution <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. Indian Institute of Technology Bombay"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree Conferred <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Technology"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Major <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.programme}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Status
                </label>
                <select
                  value={formData.enrollmentStatus}
                  onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Graduated">Graduated</option>
                  <option value="Active">Active Student</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cumulative CGPA
                </label>
                <input
                  type="text"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  placeholder="e.g. 9.24"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                🔒 Student data is stored off-chain. Only opaque status hash is written on-chain.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {isSubmitting
                  ? (isMetaMaskConnected ? 'Awaiting MetaMask (Sign / Tx)...' : 'Processing...')
                  : (isMetaMaskConnected ? '🦊 Sign with MetaMask & Register on Chain' : 'Sign & Issue Credential')}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Latest Issued Credential Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Latest Issued Credential
            </h3>
            {latestIssuedVc && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                ✓ Registered On-Chain
              </span>
            )}
          </div>

          {latestIssuedVc ? (
            <CredentialCard credential={latestIssuedVc} showVerifyAction={true} />
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                No credentials issued in this session yet. Complete the form to sign with MetaMask and publish status on the consortium blockchain.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Revocation & Previously Issued Credentials Management */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Institutional Credential Management & On-Chain Revocation
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideRevoked}
                onChange={(e) => setHideRevoked(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Hide Revoked Records</span>
            </label>
            <span className="text-xs font-semibold text-slate-500">
              Total: {issuedHistory.filter((i) => (hideRevoked ? !i.isRevoked : true)).length} Credentials
            </span>
          </div>
        </div>

        {issuedHistory.filter((i) => (hideRevoked ? !i.isRevoked : true)).length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            {hideRevoked
              ? 'All issued credentials in this session have been revoked.'
              : 'No previously issued credentials found in registry.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Degree</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">On-Chain Tx</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issuedHistory
                  .filter((item) => (hideRevoked ? !item.isRevoked : true))
                  .map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">
                        {item.credential?.credentialSubject?.name || 'Student'}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {item.credential?.credentialSubject?.studentId}
                      </td>
                      <td className="p-3 text-slate-700">
                        {item.credential?.credentialSubject?.degree}
                      </td>
                      <td className="p-3">
                        <StatusBadge
                          status={item.isRevoked ? 'REVOKED' : 'ACTIVE'}
                          label={item.isRevoked ? 'REVOKED' : 'ACTIVE'}
                          size="sm"
                        />
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {item.txHash ? `${item.txHash.substring(0, 10)}...` : 'Pending'}
                      </td>
                      <td className="p-3 text-right">
                        {item.isRevoked ? (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                            Permanently Revoked
                          </span>
                        ) : (
                          <button
                            onClick={() => setRevokeTarget(item)}
                            className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition"
                          >
                            Revoke on Chain
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revocation Confirmation Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">
                Confirm Blockchain Revocation
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to revoke the credential for <strong className="text-slate-900">{revokeTarget.credential?.credentialSubject?.name}</strong> on the smart contract. This action will be permanently recorded on the blockchain ledger.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Revocation
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                placeholder="Reason for revocation"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeCredential}
                disabled={isRevoking}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isRevoking ? 'Confirming in MetaMask...' : 'Confirm Revocation in MetaMask'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
