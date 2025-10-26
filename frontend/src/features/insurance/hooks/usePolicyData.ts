import { useAccount, useReadContract } from 'wagmi';
import { INSURANCE_ABI, getContractAddress } from '@/lib/contracts';
import { Policy, PolicyStatus } from '@/types/insurance';

export function usePolicyData(policyId: bigint) {
  const { address } = useAccount();
  
  const { data: policy, isLoading, error } = useReadContract({
    address: getContractAddress('Insurance'),
    abi: INSURANCE_ABI,
    functionName: 'getPolicy',
    args: [policyId],
  });

  return {
    policy: policy as Policy | undefined,
    isLoading,
    error,
  };
}

export function useUserPolicies() {
  const { address } = useAccount();
  
  // 실제로는 사용자의 모든 정책을 가져오는 로직이 필요하지만,
  // 현재는 간단하게 최근 가입한 정책 하나만 반환
  const mockPolicy: Policy = {
    id: BigInt(1),
    holder: address as `0x${string}`,
    productId: BigInt(1),
    premiumPaid: BigInt('1000000000000000'), // 0.001 ETH
    coverageAmount: BigInt('1000000000000000000'), // 1 ETH
    createdAt: BigInt(Date.now()),
    activatedAt: BigInt(Date.now()),
    tokenId: BigInt(1),
    status: PolicyStatus.ACTIVE,
  };

  return {
    policies: [mockPolicy],
    isLoading: false,
    error: null,
  };
}
