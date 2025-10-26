# Swap Feature 구현 문서

## 📋 개요
ShieldFi 프로젝트의 스왑 기능 구현 문서입니다. nexus SDK를 활용하여 토큰 스왑 기능을 구현했습니다.

## 🎯 목표
- nexus SDK를 활용한 토큰 스왑 기능 구현
- 보험 가입 시 다른 토큰을 스왑하여 결제
- 사용자 친화적인 UI/UX 제공

## 📁 파일 구조
```
src/features/swap/
└─ components/
   └─ SwapPayment.tsx            # 스왑 결제 컴포넌트
```

## 🔧 구현된 기능

### **SwapPayment.tsx**
**위치**: `src/features/swap/components/SwapPayment.tsx`

**주요 기능:**
- nexus-widgets의 `TransferButton` 컴포넌트 활용
- 스왑 정보 표시 (토큰 교환 비율, 수수료)
- 진행 상태 관리 (preparation → swapping → success/error)
- 에러 처리 및 사용자 피드백

**인터페이스:**
```typescript
interface SwapPaymentProps {
  amount: string;        // 스왑할 금액
  fromToken: string;    // 스왑할 토큰 (ETH)
  toToken: string;      // 스왑받을 토큰 (USDC)
  onSuccess: () => void; // 성공 시 콜백
  onError: (error: string) => void; // 실패 시 콜백
}
```

**사용된 nexus-widgets:**
```typescript
import { TransferButton } from '@avail-project/nexus-widgets';

<TransferButton
  prefill={{
    chainId: 1, // Ethereum
    token: 'USDC',
    amount: amount,
    recipient: '0x2784177671da5525461296a2f170009339e92dc2' // 보험사 지갑
  }}
>
  {({ onClick, isLoading }) => (
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading ? '스왑 진행 중...' : '스왑 시작'}
    </Button>
  )}
</TransferButton>
```

## 🔄 동작 플로우

### **1. 스왑 준비 단계**
- 사용자가 "스왑 결제" 선택
- 스왑 정보 표시 (토큰 교환 비율, 수수료)
- "스왑 시작" 버튼 활성화

### **2. 스왑 실행 단계**
- `TransferButton` 클릭
- nexus-widgets가 스왑 시뮬레이션 실행
- 지갑에서 트랜잭션 승인 요청
- 사용자가 MetaMask 등에서 승인

### **3. 스왑 완료 단계**
- 트랜잭션 확인 및 완료
- 성공 시 `onSuccess()` 콜백 호출
- 실패 시 `onError()` 콜백 호출

## 🎨 UI/UX 특징

### **진행 상태 표시:**
- **준비**: 스왑 정보와 시작 버튼
- **진행 중**: 로딩 스피너와 진행 메시지
- **완료**: 성공 메시지
- **실패**: 에러 메시지

### **스왑 정보:**
- **교환 비율**: 1 ETH = 1.02 USDC (예시)
- **수수료**: 0.3%
- **예상 시간**: 1-2분
- **대상 체인**: Ethereum (Chain ID: 1)

### **토큰 표시:**
```typescript
// 스왑 전후 토큰 시각화
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
      <span className="text-xs font-bold text-blue-600">{fromToken}</span>
    </div>
    <span className="font-medium">{amount} {fromToken}</span>
  </div>
  <ArrowRight className="w-4 h-4 text-slate-400" />
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <span className="text-xs font-bold text-green-600">{toToken}</span>
    </div>
    <span className="font-medium">{(parseFloat(amount) * parseFloat(swapRate)).toFixed(2)} {toToken}</span>
  </div>
</div>
```

## 🔗 연동된 컴포넌트

### **PaymentModal에서 사용:**
```typescript
{selectedMethod === 'swap' && (
  <SwapPayment
    amount="2.5"
    fromToken="ETH"
    toToken="USDC"
    onSuccess={handlePaymentSuccess}
    onError={handlePaymentError}
  />
)}
```

### **nexus SDK 연동:**
```typescript
import { useNexus } from '@/features/nexus/hooks/useNexus';

const { isConnected, sdk } = useNexus();
```

## 🧪 테스트 방법

### **1. 지갑 연결**
- Header에서 "Connect Wallet" 클릭
- MetaMask 등에서 지갑 연결

### **2. 스왑 테스트**
- `/products` 페이지에서 보험 상품 선택
- "Purchase Insurance" 클릭
- "스왑 결제" 선택
- "스왑 시작" 클릭
- 지갑에서 트랜잭션 승인

### **3. 예상 결과**
- ETH를 USDC로 스왑
- 스왑된 USDC로 보험료 결제
- 스왑 완료 후 보험 가입 성공 페이지로 이동

## 🛠️ 기술 스택

### **사용된 라이브러리:**
- **@avail-project/nexus-widgets**: TransferButton 컴포넌트
- **@avail-project/nexus-core**: nexus SDK
- **React**: 컴포넌트 구현
- **TypeScript**: 타입 안전성

### **nexus SDK 설정:**
- **네트워크**: testnet
- **체인**: Ethereum (1)
- **토큰**: ETH → USDC
- **스왑 방식**: nexus SDK 자동 최적화

## 📝 참고 사항

### **스왑 과정:**
1. **시뮬레이션**: 스왑 비율 및 수수료 계산
2. **토큰 승인**: ERC-20 토큰 스펜더 승인
3. **스왑 실행**: DEX에서 토큰 교환
4. **지갑 승인**: 사용자가 MetaMask에서 승인
5. **완료 확인**: 스왑된 토큰 수신 확인

### **에러 처리:**
- 지갑 연결 확인
- 토큰 잔액 확인
- 스왑 실패 처리
- 사용자 피드백 제공

### **성능 최적화:**
- nexus SDK의 자동 최적화 활용
- 가스비 최적화
- 스왑 시간 최소화
- 슬리피지 보호

### **보안 고려사항:**
- 스왑 비율 검증
- MEV 보호
- 프론트러닝 방지
- 트랜잭션 검증

---
*마지막 업데이트: 2024-12-19*
