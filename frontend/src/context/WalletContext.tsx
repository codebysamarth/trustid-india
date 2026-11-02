import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { UserRole, WalletState } from '../types';

export interface DemoAccountProfile {
  address: string;
  name: string;
  role: UserRole;
  privateKey?: string;
  institution?: string;
}

export const DEMO_PROFILES: Record<string, DemoAccountProfile> = {
  issuer1: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Indian Institute of Technology Bombay',
    role: 'ISSUER',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    institution: 'IIT Bombay',
  },
  issuer2: {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    name: 'NIT Karnataka',
    role: 'ISSUER',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    institution: 'NIT Karnataka',
  },
  governor: {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    name: 'National Academic Governance Authority',
    role: 'GOVERNOR',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  student: {
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    name: 'Aarav Sharma (Student Holder)',
    role: 'HOLDER',
  },
  verifier: {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    name: 'National Merit Scholarship Portal',
    role: 'VERIFIER',
  },
};

interface WalletContextType extends WalletState {
  signer: ethers.Signer | null;
  provider: ethers.BrowserProvider | null;
  isMetaMaskConnected: boolean;
  connectMetaMask: () => Promise<void>;
  disconnectWallet: () => void;
  switchRole: (role: UserRole) => void;
  switchDemoProfile: (profileKey: string) => void;
  activeProfileKey: string;
  isHardhatNetwork: boolean;
  promptAddHardhatNetwork: () => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(DEMO_PROFILES.issuer1.address);
  const [chainId, setChainId] = useState<number | null>(31337);
  const [networkName, setNetworkName] = useState<string | null>('Consortium Chain 31337');
  const [balance, setBalance] = useState<string | null>('10000.0 ETH');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ISSUER');
  const [activeProfileKey, setActiveProfileKey] = useState<string>('issuer1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const isMetaMaskAvailable = typeof window !== 'undefined' && Boolean((window as any).ethereum);
  const isHardhatNetwork = chainId === 31337;
  const isMetaMaskConnected = !isSimulated && isConnected && !!signer;

  // Auto-detect already connected MetaMask accounts on page load
  useEffect(() => {
    if (!isMetaMaskAvailable) return;
    if (localStorage.getItem('trustid_wallet_disconnected') === 'true') return;

    const ethereum = (window as any).ethereum;
    ethereum
      .request({ method: 'eth_accounts' })
      .then(async (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          try {
            const bp = new ethers.BrowserProvider(ethereum);
            const s = await bp.getSigner();
            const signerAddress = await s.getAddress();
            let bal = await bp.getBalance(signerAddress);
            const currentChainHex = await ethereum.request({ method: 'eth_chainId' });
            const currentChain = parseInt(currentChainHex, 16);

            // Auto-fund connected account if balance is zero on local consortium node
            if (currentChain === 31337 && bal < ethers.parseEther('1.0')) {
              try {
                await fetch('/api/demo/faucet', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ address: signerAddress }),
                });
                bal = await bp.getBalance(signerAddress);
              } catch (faucetErr) {
                console.warn('Auto-faucet error:', faucetErr);
              }
            }

            setSigner(s);
            setProvider(bp);
            setAddress(signerAddress);
            setChainId(currentChain);
            setNetworkName(currentChain === 31337 ? 'Consortium Chain 31337' : `Chain ID ${currentChain}`);
            setBalance(`${parseFloat(ethers.formatEther(bal)).toFixed(3)} ETH`);
            setIsConnected(true);
            setIsSimulated(false);
          } catch (e) {
            console.warn('Auto-connect on load:', e);
          }
        }
      })
      .catch((err: any) => console.warn('Could not read eth_accounts:', err));
  }, [isMetaMaskAvailable]);

  // Listen to MetaMask account / network changes if active
  useEffect(() => {
    if (!isMetaMaskAvailable) return;

    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAddress(null);
        setSigner(null);
      } else {
        const bp = new ethers.BrowserProvider(ethereum);
        const s = await bp.getSigner();
        const addr = ethers.getAddress(accounts[0]);
        const bal = await bp.getBalance(addr);
        setAddress(addr);
        setSigner(s);
        setProvider(bp);
        setBalance(`${parseFloat(ethers.formatEther(bal)).toFixed(3)} ETH`);
        setIsConnected(true);
        setIsSimulated(false);
      }
    };

    const handleChainChanged = (chainHex: string) => {
      const newChainId = parseInt(chainHex, 16);
      setChainId(newChainId);
      setNetworkName(newChainId === 31337 ? 'Consortium Chain 31337' : `Chain ID ${newChainId}`);
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskAvailable]);

  const connectMetaMask = useCallback(async () => {
    setErrorMessage(null);
    localStorage.removeItem('trustid_wallet_disconnected');
    if (!isMetaMaskAvailable) {
      setErrorMessage('MetaMask is not installed in this browser. Please install the MetaMask extension to use live signing and transactions.');
      return;
    }

    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainHex = await ethereum.request({ method: 'eth_chainId' });
      const currentChain = parseInt(currentChainHex, 16);

      const browserProvider = new ethers.BrowserProvider(ethereum);
      const metaMaskSigner = await browserProvider.getSigner();
      const signerAddress = await metaMaskSigner.getAddress();
      let bal = await browserProvider.getBalance(signerAddress);

      // Auto-fund connected account if balance is zero on local consortium node
      if (currentChain === 31337 && bal < ethers.parseEther('1.0')) {
        try {
          await fetch('/api/demo/faucet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: signerAddress }),
          });
          bal = await browserProvider.getBalance(signerAddress);
        } catch (faucetErr) {
          console.warn('Auto-faucet on connect error:', faucetErr);
        }
      }

      setSigner(metaMaskSigner);
      setProvider(browserProvider);
      setAddress(signerAddress);
      setChainId(currentChain);
      setNetworkName(currentChain === 31337 ? 'Consortium Chain 31337' : `Chain ID ${currentChain}`);
      setBalance(`${parseFloat(ethers.formatEther(bal)).toFixed(3)} ETH`);
      setIsConnected(true);
      setIsSimulated(false);
    } catch (err: any) {
      console.error('MetaMask connection failed:', err);
      if (err.code === 4001) {
        setErrorMessage('Connection request was rejected in MetaMask.');
      } else {
        setErrorMessage(`MetaMask error: ${err.message || String(err)}`);
      }
    }
  }, [isMetaMaskAvailable]);

  const promptAddHardhatNetwork = useCallback(async () => {
    if (!isMetaMaskAvailable) return;
    try {
      const ethereum = (window as any).ethereum;
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }], // 31337 in hex
        });
      } catch (switchError: any) {
        if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7A69',
                chainName: 'Hardhat Consortium (TrustID India)',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['http://127.0.0.1:8545'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (err: any) {
      console.warn('Network addition/switch prompt returned:', err);
    }
  }, [isMetaMaskAvailable]);

  const disconnectWallet = useCallback(() => {
    localStorage.setItem('trustid_wallet_disconnected', 'true');
    setIsConnected(false);
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setIsSimulated(false);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setSelectedRole(role);
    const entry = Object.entries(DEMO_PROFILES).find(([_, p]) => p.role === role);
    if (entry) {
      setActiveProfileKey(entry[0]);
      setAddress(entry[1].address);
      setSigner(null);
      setIsSimulated(true);
      setIsConnected(true);
    }
  }, []);

  const switchDemoProfile = useCallback((profileKey: string) => {
    const profile = DEMO_PROFILES[profileKey];
    if (profile) {
      setActiveProfileKey(profileKey);
      setAddress(profile.address);
      setSelectedRole(profile.role);
      setSigner(null);
      setIsSimulated(true);
      setIsConnected(true);
    }
  }, []);

  const clearError = () => setErrorMessage(null);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        chainId,
        networkName,
        balance,
        isMetaMaskAvailable,
        isSimulated,
        selectedRole,
        signer,
        provider,
        isMetaMaskConnected,
        connectMetaMask,
        disconnectWallet,
        switchRole,
        switchDemoProfile,
        activeProfileKey,
        isHardhatNetwork,
        promptAddHardhatNetwork,
        errorMessage,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
