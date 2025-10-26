'use client';

import React, { useState } from 'react';
import { Button } from '@/features/common/components/button';
import { useNexus } from '@avail-project/nexus-widgets';

interface ConnectButtonProps {
  className?: string;
}

export default function ConnectButton({ className }: ConnectButtonProps) {
  const { provider, setProvider, initializeSdk, isSdkInitialized } = useNexus();
  const [isLoading, setIsLoading] = useState(false);
  const isConnected = !!provider;

  const onClick = async () => {
    try {
      setIsLoading(true);
      
      if (isConnected) {
        // 연결 해제
        setProvider(undefined as any);
      } else {
        // 지갑 연결
        const eth = (window as any)?.ethereum;
        if (!eth) {
          alert('Please install an EIP-1193 wallet (e.g., MetaMask)');
          return;
        }
        
        // 먼저 지갑 연결 요청 (이때 지갑 연결 모달이 나타남)
        await eth.request({ method: 'eth_requestAccounts' });
        
        // nexus SDK 초기화 (이것이 올바른 방법)
        await initializeSdk(eth);
      }
    } catch (error) {
      console.error('Wallet connect/disconnect failed:', error);
      alert(isConnected ? 'Failed to disconnect wallet.' : 'Failed to connect wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading 
        ? 'Connecting...'
        : isConnected 
        ? 'Disconnect' 
        : 'Connect Wallet'
      }
    </Button>
  );
}
