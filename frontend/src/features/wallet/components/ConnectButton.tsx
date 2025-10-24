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
          alert('EIP-1193 지갑을 설치해주세요 (예: MetaMask)');
          return;
        }
        
        // 먼저 지갑 연결 요청 (이때 지갑 연결 모달이 나타남)
        await eth.request({ method: 'eth_requestAccounts' });
        
        // nexus SDK 초기화 (이것이 올바른 방법)
        await initializeSdk(eth);
      }
    } catch (error) {
      console.error('지갑 연결/해제 실패:', error);
      alert(isConnected ? '지갑 연결 해제에 실패했습니다.' : '지갑 연결에 실패했습니다.');
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
        ? (isConnected ? '연결 해제 중...' : '연결 중...')
        : isConnected 
        ? 'Disconnect' 
        : 'Connect Wallet'
      }
    </Button>
  );
}
