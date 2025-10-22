'use client';

import React, { useState } from 'react';
import { Button } from '@/features/common/components/button';
import { useNexus } from '@/features/nexus/hooks/useNexus';

interface ConnectButtonProps {
  className?: string;
}

export default function ConnectButton({ className }: ConnectButtonProps) {
  const { isConnected, connect, disconnect } = useNexus();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      
      if (isConnected) {
        // 연결 해제
        await disconnect();
      } else {
        // 지갑 연결
        const eth = (window as any)?.ethereum;
        if (!eth) {
          alert('EIP-1193 지갑을 설치해주세요 (예: MetaMask)');
          return;
        }
        
        await connect(eth);
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
