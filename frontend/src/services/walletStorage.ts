import { TrustIdVerifiableCredential } from '../types';

const STORAGE_KEY = 'trustid_student_wallet_credentials_v1';
const HISTORY_KEY = 'trustid_verification_history_v1';

export interface WalletCredentialItem {
  credential: TrustIdVerifiableCredential;
  addedAt: string;
  source: 'ISSUED' | 'IMPORTED' | 'SAMPLE';
  notes?: string;
}

export interface VerificationHistoryItem {
  id: string;
  credentialId: string;
  studentName: string;
  outcome: string;
  isValid: boolean;
  timestamp: string;
}

export function getStoredCredentials(): WalletCredentialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read credentials from localStorage:', err);
    return [];
  }
}

export function saveCredentialToWallet(
  credential: TrustIdVerifiableCredential,
  source: 'ISSUED' | 'IMPORTED' | 'SAMPLE' = 'ISSUED'
): boolean {
  try {
    const list = getStoredCredentials();
    // Prevent duplicate entries
    const existingIndex = list.findIndex((c) => c.credential.id === credential.id);
    const item: WalletCredentialItem = {
      credential,
      addedAt: new Date().toISOString(),
      source,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list.unshift(item);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    console.error('Failed to save credential to wallet:', err);
    return false;
  }
}

export function removeCredentialFromWallet(credentialId: string): void {
  try {
    const list = getStoredCredentials().filter((c) => c.credential.id !== credentialId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to remove credential:', err);
  }
}

export function getVerificationHistory(): VerificationHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logVerificationHistory(item: Omit<VerificationHistoryItem, 'id'>): void {
  try {
    const list = getVerificationHistory();
    list.unshift({
      ...item,
      id: `verif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (err) {
    console.error('Failed to log verification history:', err);
  }
}

export function clearStudentWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
}
