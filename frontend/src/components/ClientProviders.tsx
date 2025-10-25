"use client";
import { NexusProvider } from '@avail-project/nexus-widgets';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NexusProvider
      config={{
        debug: false,
        network: 'testnet'
      }}
    >
      {children}
    </NexusProvider>
  );
}
