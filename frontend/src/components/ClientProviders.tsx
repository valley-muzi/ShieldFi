"use client";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { NexusProvider } from '@avail-project/nexus-widgets';

interface ClientProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NexusProvider
          config={{
            debug: false,
            network: 'testnet'
          }}
        >
          {children}
        </NexusProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
