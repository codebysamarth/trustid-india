export * from '../../../shared/types/credential';

export type UserRole = 'ISSUER' | 'HOLDER' | 'VERIFIER' | 'GOVERNOR';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  balance: string | null;
  isMetaMaskAvailable: boolean;
  isSimulated: boolean;
  selectedRole: UserRole;
}
