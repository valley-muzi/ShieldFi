# Insurance Contract Integration - 수정된 버전

## 개요

이 문서는 ShieldFi 프론트엔드에서 Insurance 컨트랙트를 호출하는 기능에 대한 **수정된** 구현 가이드입니다. 기존 프로젝트 구조에 맞게 간소화하고 실용적으로 구현했습니다.

## 핵심 프로세스

### 올바른 순서: 결제 → 컨트랙트 호출

1. **결제 단계**: 사용자가 ETH를 준비 (브릿지/스왑/직접)
2. **컨트랙트 호출 단계**: 준비된 ETH로 Insurance 컨트랙트의 `applyPolicy` 함수 호출

## 구현된 기능

### 1. 컨트랙트 설정 (`src/lib/contracts.ts`)

- **컨트랙트 주소 관리**: localhost 네트워크 컨트랙트 주소
- **ABI 정의**: Insurance 컨트랙트의 핵심 함수들만 포함
- **네트워크 설정**: 로컬 개발 환경 설정

```typescript
// 주요 컨트랙트 주소
export const CONTRACT_ADDRESSES = {
  localhost: {
    Insurance: '0x948B3c65b89DF0B4894ABE91E6D02FE579834F8F',
    PolicyNFT: '0x71C95911E9a5D330f4D621842EC243EE1343292e',
    Treasury: '0x8464135c8F25Da09e49BC8782676a84730C318bC',
  },
};
```

### 2. 타입 정의 (`types/insurance.d.ts`)

- **Policy 구조체**: 보험 정책의 모든 필드 정의
- **PolicyStatus enum**: 보험 정책 상태 (PENDING, ACTIVE, PAID, CANCELLED)
- **요청/응답 타입**: 보험 가입 관련 타입들

### 3. Insurance 컨트랙트 호출 컴포넌트 (`InsuranceContractCall.tsx`)

#### 주요 기능:
- **보험 조건 입력**: 보상 한도, 보험료 설정
- **wagmi 훅 사용**: `useWriteContract`, `useWaitForTransactionReceipt`
- **실시간 상태 관리**: 로딩, 에러, 성공 상태 표시
- **자동 프리미엄 계산**: 보상 한도의 5%

```typescript
// 보험 가입 실행
const { writeContract, data: hash, isPending, error } = useWriteContract();

const handleApplyPolicy = async () => {
  writeContract({
    address: getContractAddress('Insurance'),
    abi: INSURANCE_ABI,
    functionName: 'applyPolicy',
    args: [BigInt(parseInt(product.id)), parseEther(coverageAmount)],
    value: parseEther(premiumAmount), // ETH 전송
  });
};
```

### 4. PaymentModal 업데이트

#### 2단계 프로세스:
1. **결제 단계** (`contractCallStep === 'payment'`)
   - 결제 방식 선택 (브릿지/스왑/직접/컨트랙트)
   - Nexus SDK를 통한 결제 처리
2. **컨트랙트 호출 단계** (`contractCallStep === 'contract'`)
   - 준비된 ETH로 보험 가입

#### 결제 방식:
- **보험 가입**: 직접 컨트랙트 호출
- **브릿지 결제**: 다른 체인에서 ETH 브릿지 → 컨트랙트 호출
- **스왑 결제**: 다른 토큰을 ETH로 스왑 → 컨트랙트 호출
- **직접 결제**: 현재 체인의 ETH로 직접 결제 → 컨트랙트 호출

### 5. 브릿지/스왑 컴포넌트 연동

#### BridgePayment 업데이트:
- `onContractCall` 콜백 추가
- 브릿지 성공 후 자동으로 컨트랙트 호출 단계로 전환
- localhost 체인으로 ETH 브릿지

#### SwapPayment 업데이트:
- `onContractCall` 콜백 추가
- 스왑 성공 후 자동으로 컨트랙트 호출 단계로 전환
- 다른 토큰을 ETH로 스왑

### 6. Wagmi 설정 (`src/lib/wagmi.ts`)

- **로컬 네트워크 설정**: localhost:8545 연결
- **커넥터 설정**: MetaMask, WalletConnect, Injected 지갑 지원
- **체인 설정**: localhost와 sepolia 체인 지원

## 사용 방법

### 1. 환경 설정

```bash
# 로컬 하드햇 노드 실행
cd contracts/hardhat
npx hardhat node

# 컨트랙트 배포
npx hardhat run scripts/deploy.local.ts --network localhost
```

### 2. 보험 가입 프로세스

1. **상품 선택**: Products 페이지에서 원하는 보험 상품 선택
2. **결제 방식 선택**: 
   - "보험 가입": 직접 컨트랙트 호출
   - "브릿지 결제": 다른 체인에서 ETH 브릿지
   - "스왑 결제": 다른 토큰을 ETH로 스왑
   - "직접 결제": 현재 체인의 ETH로 결제
3. **보험 조건 설정**: 보상 한도 입력 (보험료 자동 계산)
4. **보험 가입**: 실제 컨트랙트 호출로 보험 가입 완료

## 주요 특징

### 1. 기존 구조 활용

- **Nexus SDK**: 브릿지/스왑 기능 재사용
- **기존 컴포넌트**: BridgePayment, SwapPayment 컴포넌트 활용
- **wagmi**: 간단한 컨트랙트 호출

### 2. 2단계 프로세스

- **결제 단계**: ETH 준비 (브릿지/스왑/직접)
- **컨트랙트 호출 단계**: 준비된 ETH로 보험 가입

### 3. 사용자 경험

- **직관적인 플로우**: 결제 → 컨트랙트 호출 순서
- **실시간 피드백**: 각 단계별 상태 표시
- **에러 처리**: 각 단계별 에러 메시지

### 4. 유연한 결제 방식

- **다양한 옵션**: 브릿지, 스왑, 직접 결제
- **자동 전환**: 결제 성공 후 컨트랙트 호출로 자동 전환
- **통합 인터페이스**: 하나의 모달에서 모든 과정 관리

## 컨트랙트 분석

### Insurance.sol의 applyPolicy 함수

```solidity
function applyPolicy(uint256 productId, uint256 coverageAmount)
    external
    payable  // ETH를 받음
    nonReentrant
    whenNotPaused
    returns (uint256 policyId)
{
    if (msg.value == 0) revert InvalidAmount(); // ETH가 0이면 에러
    // ...
    treasury.depositPremium{value: msg.value}(policyId); // ETH를 Treasury로 전송
}
```

**중요**: 이 함수는 `payable`이므로 ETH를 `msg.value`로 받습니다. 따라서 결제 단계에서 ETH를 준비한 후 컨트랙트를 호출해야 합니다.

## 문제 해결

### 1. 일반적인 문제

**지갑 연결 실패**
- MetaMask가 로컬 네트워크에 추가되었는지 확인
- RPC URL이 올바른지 확인 (http://127.0.0.1:8545)

**컨트랙트 호출 실패**
- 하드햇 노드가 실행 중인지 확인
- 컨트랙트가 올바르게 배포되었는지 확인
- 지갑에 충분한 ETH가 있는지 확인

**트랜잭션 실패**
- 가스 한도가 충분한지 확인
- 네트워크 상태 확인
- 컨트랙트 상태 확인 (pause 상태 등)

### 2. 디버깅

```typescript
// 트랜잭션 상태 확인
const { isPending, error } = useWriteContract();
const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

console.log('Transaction status:', { isPending, isConfirming, isConfirmed, error });
```

## 결론

이 수정된 구현은 기존 프로젝트 구조를 최대한 활용하면서도 Insurance 컨트랙트와의 통합을 성공적으로 달성했습니다. 

**핵심 개선사항:**
1. **올바른 프로세스**: 결제 → 컨트랙트 호출 순서
2. **기존 구조 활용**: Nexus SDK와 기존 컴포넌트 재사용
3. **간소화된 구현**: 복잡한 서비스 레이어 제거, wagmi 훅 직접 사용
4. **사용자 경험**: 직관적인 2단계 프로세스

이제 `/products` 화면에서 "Purchase Insurance" 버튼을 클릭하면 올바른 순서로 보험 가입을 진행할 수 있습니다!
