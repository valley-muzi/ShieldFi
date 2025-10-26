import { useNexus as useNexusContext } from '../providers/NexusProvider';

/**
 * nexus SDK 상태와 기능에 접근하는 훅
 * 
 * @returns nexus 상태 및 기능
 * - isConnected: 지갑 연결 상태
 * - isInitialized: nexus SDK 초기화 상태
 * - provider: 지갑 프로바이더
 * - walletAddress: 연결된 지갑 주소
 * - connect: 지갑 연결 함수
 * - disconnect: 지갑 연결 해제 함수
 * - sdk: nexus SDK 인스턴스
 */
export function useNexus() {
  return useNexusContext();
}

/**
 * nexus SDK가 초기화되었는지 확인하는 훅
 */
export function useNexusInitialized() {
  const { isInitialized } = useNexus();
  return isInitialized;
}

/**
 * 지갑 연결 상태를 확인하는 훅
 */
export function useWalletConnected() {
  const { isConnected, walletAddress } = useNexus();
  return { isConnected, walletAddress };
}

/**
 * nexus SDK 인스턴스에 접근하는 훅
 */
export function useNexusSDK() {
  const { sdk, isInitialized } = useNexus();
  return { sdk, isInitialized };
}
