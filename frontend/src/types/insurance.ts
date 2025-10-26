// 보험 타입 정의
import { Address } from 'viem';

// Policy 상태 enum
export enum PolicyStatus {
  PENDING = 0,
  ACTIVE = 1,
  PAID = 2,
  CANCELLED = 3,
}

// Policy 구조체 타입
export interface Policy {
  id: bigint;
  holder: Address;
  productId: bigint;
  premiumPaid: bigint;
  coverageAmount: bigint;
  createdAt: bigint;
  activatedAt: bigint;
  tokenId: bigint;
  status: PolicyStatus;
}

// 보험 상품 타입
export interface InsuranceProduct {
  id: number;
  name: string;
  description: string;
  premiumRate: number; // 프리미엄 비율 (예: 0.05 = 5%)
  coverageLimit: bigint; // 최대 보상 한도
  minCoverageAmount: bigint; // 최소 보상 금액
  maxCoverageAmount: bigint; // 최대 보상 금액
  isActive: boolean;
}

// 보험 가입 요청 타입
export interface ApplyPolicyRequest {
  productId: number;
  coverageAmount: bigint;
  premiumAmount: bigint;
}

// 보험 가입 결과 타입
export interface ApplyPolicyResult {
  policyId: bigint;
  transactionHash: string;
  success: boolean;
  error?: string;
}

// 보험 활성화 결과 타입
export interface ActivatePolicyResult {
  tokenId: bigint;
  transactionHash: string;
  success: boolean;
  error?: string;
}

// 컨트랙트 호출 상태 타입
export interface ContractCallState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// 보험 정책 조회 결과 타입
export interface PolicyQueryResult {
  policy: Policy | null;
  isLoading: boolean;
  error: string | null;
}

// 보험 이벤트 타입
export interface PolicyCreatedEvent {
  policyId: bigint;
  holder: Address;
  productId: bigint;
  premiumPaid: bigint;
  coverageAmount: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

export interface PolicyActivatedEvent {
  policyId: bigint;
  tokenId: bigint;
  activatedAt: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

// 보험 관련 에러 타입
export interface InsuranceError {
  code: string;
  message: string;
  details?: any;
}

// 보험 가입 시뮬레이션 결과 타입
export interface PolicySimulationResult {
  estimatedGas: bigint;
  estimatedCost: bigint;
  success: boolean;
  error?: string;
}
