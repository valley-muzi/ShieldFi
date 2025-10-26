# 보험 가입 결제 기능 구현 문서

## 📋 개요

ShieldFi 프로젝트의 보험 가입 결제 기능 구현 문서입니다.
사용자가 보험 상품을 구매할 때 세 가지 결제 방식(직접 결제, 브릿지 결제, 스왑 결제)을 선택할 수 있습니다.

## 🎯 목표

- 다양한 결제 방식 제공으로 사용자 편의성 향상
- Ethereum 및 Base 체인에서 ETH로 보험료 결제
- 크로스체인 브릿지 및 토큰 스왑 기능 통합
- 안전하고 투명한 온체인 결제 프로세스

## 📁 파일 구조

```
src/features/
├─ insurance/
│  ├─ constants/
│  │  └─ payment.ts                    # 결제 상수 (지갑 주소 등)
│  └─ components/
│     ├─ payment/
│     │  └─ DirectPayment.tsx          # 직접 결제 컴포넌트
│     └─ products/
│        ├─ ProductsPage.tsx           # 보험 상품 페이지
│        └─ PaymentModal.tsx           # 결제 모달
├─ bridge/
│  └─ components/
│     └─ BridgePayment.tsx             # 브릿지 결제 컴포넌트
└─ swap/
   └─ components/
      └─ SwapPayment.tsx               # 스왑 결제 컴포넌트
```

## 🔧 구현된 기능

### 1. **결제 상수 정의** (`payment.ts`)

**위치**: `src/features/insurance/constants/payment.ts`

**주요 내용:**

```typescript
// 보험사 지갑 주소 (결제를 받을 주소)
export const INSURANCE_WALLET_ADDRESSES = {
  1: "0x2784177671da5525461296a2f170009339e92dc2", // Ethereum Mainnet
  11155111: "0x2784177671da5525461296a2f170009339e92dc2", // Ethereum Sepolia
  8453: "0x2784177671da5525461296a2f170009339e92dc2", // Base Mainnet
  84532: "0x2784177671da5525461296a2f170009339e92dc2", // Base Sepolia
} as const;
```

**헬퍼 함수:**

- `getInsuranceWalletAddress(chainId)`: 체인 ID에 따른 보험사 지갑 주소 반환
- `CHAIN_NAMES`: 체인 ID를 사용자 친화적인 이름으로 매핑

---

### 2. **직접 결제** (`DirectPayment.tsx`)

**위치**: `src/features/insurance/components/payment/DirectPayment.tsx`

**주요 기능:**

- 현재 연결된 체인(Ethereum 또는 Base)에서 ETH 직접 전송
- 지갑 연결 상태 확인
- 실시간 결제 진행 상태 표시
- 트랜잭션 해시 추적

**인터페이스:**

```typescript
interface DirectPaymentProps {
  amount: string; // ETH 단위 보험료
  onSuccess: () => void; // 성공 시 콜백
  onError: (error: string) => void; // 실패 시 콜백
}
```

**결제 프로세스:**

1. **준비 단계**

   - 보험료, 네트워크, 가스비 정보 표시
   - 사용자에게 안내 메시지 제공

2. **결제 실행**

   ```typescript
   const transactionParameters = {
     from: userAddress,
     to: insuranceWalletAddress,
     value: parseEther(amount).toString(16), // ETH → Wei
     gas: "0x5208", // 21000 gas
   };

   const txHash = await provider.request({
     method: "eth_sendTransaction",
     params: [transactionParameters],
   });
   ```

3. **트랜잭션 확인**
   - `eth_getTransactionReceipt`로 트랜잭션 상태 폴링
   - 최대 60초 대기
   - 완료 시 `onSuccess()` 콜백 호출

**UI 상태:**

- **preparation**: 결제 정보 표시 및 버튼
- **paying**: 지갑 승인 대기 및 트랜잭션 전송
- **success**: 결제 완료 메시지
- **error**: 에러 메시지 및 상세 정보

---

### 3. **브릿지 결제** (`BridgePayment.tsx`)

**위치**: `src/features/bridge/components/BridgePayment.tsx`

**주요 기능:**

- nexus-widgets의 `BridgeButton` 활용
- 다른 체인에서 ETH 브릿지 후 자동 결제
- 2단계 프로세스: 브릿지 → 결제

**인터페이스:**

```typescript
interface BridgePaymentProps {
  amount: string; // ETH 단위 보험료
  onSuccess: () => void; // 성공 시 콜백
  onError: (error: string) => void; // 실패 시 콜백
}
```

**결제 프로세스:**

1. **브릿지 준비**

   - nexus SDK로 브릿지 시뮬레이션
   - 수수료 및 예상 시간 계산

2. **브릿지 실행**

   ```typescript
   <BridgeButton
     prefill={{
       chainId: 1, // Ethereum Mainnet
       token: "ETH",
       amount: amount,
     }}
     onSuccess={handleBridgeSuccess}
     onError={handleBridgeError}
   >
     {({ onClick, isLoading }) => (
       <Button onClick={onClick}>브릿지 & 결제 시작</Button>
     )}
   </BridgeButton>
   ```

3. **자동 결제**
   - 브릿지 완료 후 `handleBridgeSuccess` 호출
   - ETH 전송 트랜잭션 자동 실행
   - 보험사 지갑으로 ETH 전송

**UI 상태:**

- **preparation**: 브릿지 정보 및 안내
- **bridging**: 브릿지 트랜잭션 진행
- **transferring**: 보험료 결제 진행
- **success**: 브릿지 및 결제 완료
- **error**: 에러 메시지

---

### 4. **스왑 결제** (`SwapPayment.tsx`)

**위치**: `src/features/swap/components/SwapPayment.tsx`

**주요 기능:**

- 다른 토큰(USDC 등)을 ETH로 스왑 후 결제
- DEX 연동 준비 (현재는 시뮬레이션)
- 스왑 비율 계산 및 표시

**인터페이스:**

```typescript
interface SwapPaymentProps {
  amount: string; // ETH로 변환될 목표 금액
  fromToken: string; // 스왑할 토큰 (예: USDC)
  onSuccess: () => void; // 성공 시 콜백
  onError: (error: string) => void; // 실패 시 콜백
}
```

**결제 프로세스:**

1. **스왑 준비**

   - 스왑 비율 확인 (예: 1 ETH = 3000 USDC)
   - 필요한 토큰 양 계산
   - 수수료 및 예상 시간 표시

2. **스왑 실행**

   ```typescript
   // 1단계: 토큰 → ETH 스왑 (DEX 연동)
   await simulateSwap();

   // 2단계: ETH 전송
   await sendPaymentAfterSwap();
   ```

3. **자동 결제**
   - 스왑 완료 후 ETH 전송
   - 보험사 지갑으로 결제

**스왑 비율:**

- USDC: 1 ETH = 3000 USDC
- 실제 프로덕션에서는 DEX API로 실시간 비율 조회

**UI 상태:**

- **preparation**: 스왑 정보 및 비율 표시
- **swapping**: 토큰 스왑 진행
- **transferring**: 보험료 결제 진행
- **success**: 스왑 및 결제 완료
- **error**: 에러 메시지

---

### 5. **결제 모달** (`PaymentModal.tsx`)

**위치**: `src/features/insurance/components/products/PaymentModal.tsx`

**주요 기능:**

- 세 가지 결제 방식 선택 UI
- 각 결제 컴포넌트 통합
- 보험 상품 정보 표시
- 지갑 연결 상태 확인

**결제 방식 카드:**

```typescript
const paymentMethods = [
  {
    id: "direct",
    name: "직접 결제",
    description: "현재 체인의 토큰으로 직접 결제",
    icon: CreditCard,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "bridge",
    name: "브릿지 결제",
    description: "다른 체인에서 토큰을 브릿지하여 결제",
    icon: ArrowLeftRight,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "swap",
    name: "스왑 결제",
    description: "다른 토큰을 스왑하여 결제",
    icon: Zap,
    color: "from-green-500 to-green-600",
  },
];
```

**컴포넌트 연동:**

```typescript
{
  selectedMethod === "direct" && (
    <DirectPayment
      amount={product.premium.replace(" ETH", "")}
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}

{
  selectedMethod === "bridge" && (
    <BridgePayment
      amount={product.premium.replace(" ETH", "")}
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}

{
  selectedMethod === "swap" && (
    <SwapPayment
      amount={product.premium.replace(" ETH", "")}
      fromToken="USDC"
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}
```

---

## 🔄 전체 동작 플로우

### 1. 보험 상품 선택

- 사용자가 `/products` 페이지에서 보험 상품 선택
- "Purchase Insurance" 버튼 클릭
- `PaymentModal` 오픈

### 2. 결제 방식 선택

- 직접 결제 / 브릿지 결제 / 스왑 결제 중 선택
- 지갑 연결 상태 확인
- 선택한 결제 컴포넌트 렌더링

### 3. 결제 실행

**직접 결제:**

1. 결제 정보 확인
2. "ETH 결제하기" 버튼 클릭
3. 지갑에서 트랜잭션 승인
4. 트랜잭션 전송 및 확인
5. 성공 페이지로 이동

**브릿지 결제:**

1. 브릿지 정보 확인
2. "브릿지 & 결제 시작" 버튼 클릭
3. 지갑에서 브릿지 트랜잭션 승인 (1차)
4. 브릿지 실행 및 완료
5. 지갑에서 결제 트랜잭션 승인 (2차)
6. 보험료 전송 및 확인
7. 성공 페이지로 이동

**스왑 결제:**

1. 스왑 정보 확인
2. "스왑 & 결제 시작" 버튼 클릭
3. 지갑에서 토큰 승인 (1차)
4. 스왑 실행 (토큰 → ETH)
5. 지갑에서 결제 트랜잭션 승인 (2차)
6. 보험료 전송 및 확인
7. 성공 페이지로 이동

### 4. 성공 페이지

- 정책 ID, 보험 유형, 보장 금액, 보험료, 기간 표시
- NFT 인증서 발급 (향후 구현)

---

## 🎨 UI/UX 특징

### 진행 상태 표시

각 결제 컴포넌트는 단계별로 명확한 피드백 제공:

- 아이콘: 각 단계를 시각적으로 표현
- 텍스트: 현재 진행 중인 작업 설명
- 로딩 애니메이션: 진행 중임을 표시
- 색상 코딩: 준비(파란색), 진행(보라/초록), 성공(초록), 실패(빨강)

### 안내 메시지

- 각 결제 방식마다 안내 메시지 표시
- 필요한 승인 횟수 명시
- 예상 시간 및 수수료 정보 제공

### 에러 처리

- 지갑 연결 확인
- 네트워크 오류 처리
- 사용자가 트랜잭션을 거부한 경우 처리
- 명확한 에러 메시지 제공

---

## 🔒 보안 고려사항

### 지갑 주소 검증

- 보험사 지갑 주소를 상수로 관리
- 체인 ID별로 올바른 주소 사용

### 트랜잭션 확인

- 모든 트랜잭션의 receipt 확인
- 타임아웃 설정 (최대 60초)
- 실패 시 적절한 에러 처리

### 사용자 승인

- 모든 트랜잭션은 지갑에서 사용자 승인 필요
- 트랜잭션 파라미터 명시적 표시
- 가스비 정보 제공

---

## 🛠️ 기술 스택

### 사용된 라이브러리

- **viem** (v2.38.3): Ethereum 클라이언트, ETH 단위 변환
- **@avail-project/nexus-widgets**: 브릿지 UI 컴포넌트
- **@avail-project/nexus-core**: 크로스체인 SDK
- **React**: 컴포넌트 구현
- **TypeScript**: 타입 안전성
- **Lucide React**: 아이콘

### 주요 함수 및 타입

```typescript
// viem 유틸리티
import { parseEther } from "viem";

// 보험사 지갑 주소 조회
import { getInsuranceWalletAddress } from "@/features/insurance/constants/payment";

// nexus hooks
import { useNexus } from "@avail-project/nexus-widgets";
```

---

## 📊 지원하는 네트워크

| 네트워크         | Chain ID | 보험사 지갑 주소                           |
| ---------------- | -------- | ------------------------------------------ |
| Ethereum Mainnet | 1        | 0x2784177671da5525461296a2f170009339e92dc2 |
| Ethereum Sepolia | 11155111 | 0x2784177671da5525461296a2f170009339e92dc2 |
| Base Mainnet     | 8453     | 0x2784177671da5525461296a2f170009339e92dc2 |
| Base Sepolia     | 84532    | 0x2784177671da5525461296a2f170009339e92dc2 |

---

## 🧪 테스트 시나리오

### 1. 직접 결제 테스트

```
1. 지갑 연결 (Ethereum 또는 Base)
2. /products 페이지에서 보험 상품 선택
3. "Purchase Insurance" 클릭
4. "직접 결제" 선택
5. 결제 정보 확인 (보험료, 네트워크, 가스비)
6. "ETH 결제하기" 클릭
7. 지갑에서 트랜잭션 승인
8. 결제 완료 확인
9. 성공 페이지로 이동 확인
```

### 2. 브릿지 결제 테스트

```
1. 지갑 연결 (Polygon 등 다른 체인)
2. /products 페이지에서 보험 상품 선택
3. "Purchase Insurance" 클릭
4. "브릿지 결제" 선택
5. 브릿지 정보 확인
6. "브릿지 & 결제 시작" 클릭
7. 지갑에서 브릿지 트랜잭션 승인 (1차)
8. 브릿지 완료 대기
9. 지갑에서 결제 트랜잭션 승인 (2차)
10. 결제 완료 확인
11. 성공 페이지로 이동 확인
```

### 3. 스왑 결제 테스트

```
1. 지갑 연결 (USDC 보유)
2. /products 페이지에서 보험 상품 선택
3. "Purchase Insurance" 클릭
4. "스왑 결제" 선택
5. 스왑 정보 확인 (비율, 필요 토큰 양)
6. "스왑 & 결제 시작" 클릭
7. 지갑에서 토큰 승인 (1차)
8. 스왑 완료 대기
9. 지갑에서 결제 트랜잭션 승인 (2차)
10. 결제 완료 확인
11. 성공 페이지로 이동 확인
```

---

## 📝 향후 개선 사항

### 1. DEX 통합

- Uniswap, Sushiswap 등 실제 DEX 연동
- 실시간 스왑 비율 조회
- 최적 스왑 경로 계산

### 2. 가스비 최적화

- 가스비 실시간 조회 및 표시
- 사용자가 가스비 설정 가능

### 3. 트랜잭션 히스토리

- 모든 결제 트랜잭션 기록
- 블록 익스플로러 링크 제공

### 4. 다중 토큰 지원

- ETH 외에 USDC, USDT 등으로도 직접 결제
- 스테이블코인 결제 옵션

### 5. 결제 재시도

- 트랜잭션 실패 시 재시도 기능
- 실패 원인 분석 및 해결 방안 제시

### 6. 알림 시스템

- 트랜잭션 진행 상황 실시간 알림
- 이메일 또는 푸시 알림 지원

---

## 🔍 디버깅 가이드

### 콘솔 로그 확인

각 결제 컴포넌트는 중요한 단계마다 콘솔 로그 출력:

```typescript
console.log("Transaction sent:", txHash);
console.log("Payment transaction sent:", hash);
console.error("Direct payment error:", err);
```

### 흔한 에러 및 해결 방법

**1. "지갑이 연결되지 않았습니다"**

- 원인: MetaMask 등 지갑이 연결되지 않음
- 해결: Header에서 "Connect Wallet" 클릭

**2. "트랜잭션 확인 시간 초과"**

- 원인: 네트워크 혼잡 또는 가스비 부족
- 해결: 가스비 높여서 재시도

**3. "User rejected the request"**

- 원인: 사용자가 지갑에서 트랜잭션 거부
- 해결: 다시 시도하고 승인

**4. "Insufficient funds"**

- 원인: 지갑 잔액 부족
- 해결: ETH 또는 토큰 충전

---

## 📚 참고 자료

### Nexus SDK

- [Nexus Widgets 문서](../Nexus-widgets.md)
- [Nexus Core 문서](../Nexus-core.md)
- [Bridge Feature 문서](../bridge-feature.md)

### Viem

- [Viem 공식 문서](https://viem.sh/)
- [parseEther 함수](https://viem.sh/docs/utilities/parseEther.html)

### Ethereum JSON-RPC

- [eth_sendTransaction](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
- [eth_getTransactionReceipt](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt)

---

## ✅ 체크리스트

### 개발자용

- [ ] 모든 결제 방식 테스트 완료
- [ ] 에러 처리 구현 확인
- [ ] 타입 안전성 확인
- [ ] 코드 리뷰 완료
- [ ] 문서 작성 완료

### 사용자용

- [ ] 지갑 연결
- [ ] 충분한 잔액 확인
- [ ] 네트워크 선택 확인
- [ ] 트랜잭션 승인 준비

---

_마지막 업데이트: 2025-01-26_
_작성자: AI Assistant_
_버전: 1.0.0_
