'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { nexusSDK, isInitialized, initializeWithProvider, deinit } from '@/lib/nexus';

interface NexusContextType {
  isConnected: boolean;
  isInitialized: boolean;
  provider: any;
  walletAddress: string | null;
  connect: (provider: any) => Promise<void>;
  disconnect: () => Promise<void>;
  sdk: typeof nexusSDK;
}

const NexusContext = createContext<NexusContextType | null>(null);

interface NexusProviderProps {
  children: ReactNode;
}

export function NexusProvider({ children }: NexusProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // nexus SDK 초기화 상태 확인
  useEffect(() => {
    const checkInitialization = () => {
      setIsInitialized(nexusSDK.isInitialized());
    };
    
    checkInitialization();
    
    // 지갑 변경 이벤트 리스너
    if ((window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // 지갑 연결 해제됨
          setIsConnected(false);
          setWalletAddress(null);
          setProvider(null);
        } else {
          // 지갑 변경됨
          setWalletAddress(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // 체인 변경 시 페이지 새로고침 (일반적인 패턴)
        window.location.reload();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = async (walletProvider: any) => {
    try {
      if (!walletProvider) {
        throw new Error('No EIP-1193 provider found');
      }

      // 지갑 연결 요청
      const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // nexus SDK 초기화
      if (!nexusSDK.isInitialized()) {
        await initializeWithProvider(walletProvider);
      }

      setProvider(walletProvider);
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      setIsInitialized(true);
    } catch (error) {
      console.error('Nexus connection failed:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      // nexus SDK 해제
      if (nexusSDK.isInitialized()) {
        await deinit();
      }

      setProvider(null);
      setWalletAddress(null);
      setIsConnected(false);
      setIsInitialized(false);
    } catch (error) {
      console.error('Nexus disconnection failed:', error);
      throw error;
    }
  };

  const value: NexusContextType = {
    isConnected,
    isInitialized,
    provider,
    walletAddress,
    connect,
    disconnect,
    sdk: nexusSDK,
  };

  return (
    <NexusContext.Provider value={value}>
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
}
