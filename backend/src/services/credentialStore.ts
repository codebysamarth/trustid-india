import { TrustIdVerifiableCredential } from '../types/credential';
import { signCredential, computeCredentialStatusId } from './crypto';
import { CONFIG } from '../config';
import fs from 'fs';
import path from 'path';

export interface IssuedCredentialMeta {
  credential: TrustIdVerifiableCredential;
  statusId: string;
  txHash?: string;
  isRevoked: boolean;
  revocationReason?: string;
  issuedAt: string;
}

const STORAGE_FILE = path.resolve(__dirname, '../../data/credentials.json');

class CredentialStore {
  private credentials: Map<string, IssuedCredentialMeta> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private ensureDirectory() {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const list: IssuedCredentialMeta[] = JSON.parse(raw);
        for (const item of list) {
          this.credentials.set(item.credential.id, item);
        }
      }
    } catch (err) {
      console.warn('Could not load credentials from disk:', err);
    }
  }

  private saveToDisk() {
    try {
      this.ensureDirectory();
      const list = Array.from(this.credentials.values());
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2));
    } catch (err) {
      console.error('Could not save credentials to disk:', err);
    }
  }

  public getAll(): IssuedCredentialMeta[] {
    return Array.from(this.credentials.values()).sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  }

  public getById(id: string): IssuedCredentialMeta | undefined {
    return this.credentials.get(id);
  }

  public add(meta: IssuedCredentialMeta) {
    this.credentials.set(meta.credential.id, meta);
    this.saveToDisk();
  }

  public updateStatus(id: string, isRevoked: boolean, reason?: string) {
    const existing = this.credentials.get(id);
    if (existing) {
      existing.isRevoked = isRevoked;
      if (reason) existing.revocationReason = reason;
      this.saveToDisk();
      return;
    }
    // Search across all items by statusId or credential ID
    for (const [_, item] of this.credentials) {
      if (
        item.statusId?.toLowerCase() === id.toLowerCase() ||
        item.credential?.id?.toLowerCase() === id.toLowerCase() ||
        item.credential?.credentialStatus?.id?.toLowerCase() === id.toLowerCase()
      ) {
        item.isRevoked = isRevoked;
        if (reason) item.revocationReason = reason;
        this.saveToDisk();
        return;
      }
    }
  }

  public clear() {
    this.credentials.clear();
    this.saveToDisk();
  }
}

export const credentialStore = new CredentialStore();
