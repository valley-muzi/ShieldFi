// nexus 관련 타입 정의

export interface NexusConfig {
  network: 'mainnet' | 'testnet';
  debug?: boolean;
}

export interface NexusProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

export interface NexusContextType {
  isConnected: boolean;
  isInitialized: boolean;
  provider: NexusProvider | null;
  walletAddress: string | null;
  connect: (provider: NexusProvider) => Promise<void>;
  disconnect: () => Promise<void>;
  sdk: any; // NexusSDK 타입
}

export interface BridgeParams {
  chainId: number;
  token: string;
  amount: string;
}

export interface SwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
}

export interface UnifiedBalance {
  symbol: string;
  balance: string;
  chainId: number;
  tokenAddress: string;
}

export interface NexusError {
  code: number;
  message: string;
  data?: any;
}

// nexus SDK 메서드 타입
export interface NexusSDKMethods {
  isInitialized(): boolean;
  initialize(provider: NexusProvider): Promise<void>;
  deinit(): Promise<void>;
  getUnifiedBalances(): Promise<UnifiedBalance[]>;
}
