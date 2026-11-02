import {
  TrustIdVerifiableCredential,
  VerificationReport,
  BlockchainEventLog,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchIssuers() {
  const res = await fetch(`${API_BASE}/issuers`);
  return res.json();
}

export async function fetchIssuerDetails(address: string) {
  const res = await fetch(`${API_BASE}/issuers/${address}`);
  return res.json();
}

export async function registerIssuerApi(data: {
  issuerAddress: string;
  name: string;
  detailsUri?: string;
  authorizeImmediately?: boolean;
}) {
  const res = await fetch(`${API_BASE}/issuers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function issueCredentialApi(data: {
  studentName: string;
  studentId: string;
  institution: string;
  degree: string;
  programme: string;
  enrollmentStatus?: string;
  cgpa?: string;
  graduationYear?: number;
  expirationDate?: string;
  issuerPrivateKey?: string;
}) {
  const res = await fetch(`${API_BASE}/credentials/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function verifyCredentialApi(
  credential: unknown,
  policy?: Record<string, unknown>
): Promise<{ success: boolean; report: VerificationReport; error?: string }> {
  const res = await fetch(`${API_BASE}/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, policy }),
  });
  return res.json();
}

export async function revokeCredentialApi(data: {
  credentialId?: string;
  statusId?: string;
  reason?: string;
}) {
  const res = await fetch(`${API_BASE}/credentials/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function recordCredentialApi(data: {
  credential: any;
  statusId?: string;
  txHash?: string;
}) {
  const res = await fetch(`${API_BASE}/credentials/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function syncRevocationApi(data: {
  credentialId?: string;
  statusId?: string;
  reason?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/credentials/sync-revoked`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch (err) {
    console.warn('Could not sync revocation with backend:', err);
    return { success: false };
  }
}

export async function fetchIssuedCredentials() {
  const res = await fetch(`${API_BASE}/credentials/issued`);
  return res.json();
}

export async function fetchSampleCredential() {
  const res = await fetch(`${API_BASE}/credentials/sample`);
  return res.json();
}

export async function fetchBlockchainActivity(limit = 50): Promise<{ success: boolean; events: BlockchainEventLog[] }> {
  const res = await fetch(`${API_BASE}/blockchain/activity?limit=${limit}`);
  return res.json();
}

export async function fetchBlockchainStatus() {
  const res = await fetch(`${API_BASE}/blockchain/status`);
  return res.json();
}

export async function resetDemoApi() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  return res.json();
}

export async function fetchDemoMetrics() {
  const res = await fetch(`${API_BASE}/demo/metrics`);
  return res.json();
}
