# Bridge Feature 구현 문서

## 📋 개요
ShieldFi 프로젝트의 브릿지 기능 구현 문서입니다. nexus SDK를 활용하여 크로스체인 브릿지 기능을 구현했습니다.

## 🎯 목표
- nexus SDK를 활용한 크로스체인 브릿지 기능 구현
- 보험 가입 시 다른 체인에서 토큰을 브릿지하여 결제
- 사용자 친화적인 UI/UX 제공

## 📁 파일 구조
```
src/features/bridge/
└─ components/
   └─ BridgePayment.tsx          # 브릿지 결제 컴포넌트
```

## 🔧 구현된 기능

### **BridgePayment.tsx**
**위치**: `src/features/bridge/components/BridgePayment.tsx`

**주요 기능:**
- nexus-widgets의 `BridgeButton` 컴포넌트 활용
- 브릿지 정보 표시 (금액, 수수료, 예상 시간)
- 진행 상태 관리 (preparation → bridging → success/error)
- 에러 처리 및 사용자 피드백

**인터페이스:**
```typescript
interface BridgePaymentProps {
  amount: string;        // 브릿지할 금액
  token: string;         // 브릿지할 토큰 (USDC)
  onSuccess: () => void; // 성공 시 콜백
  onError: (error: string) => void; // 실패 시 콜백
}
```

**사용된 nexus-widgets:**
```typescript
import { BridgeButton } from '@avail-project/nexus-widgets';

<BridgeButton 
  prefill={{ 
    chainId: 137, // Polygon
    token: 'USDC', 
    amount: amount 
  }}
>
  {({ onClick, isLoading }) => (
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading ? '브릿지 진행 중...' : '브릿지 시작'}
    </Button>
  )}
</BridgeButton>
```

## 🔄 동작 플로우

### **1. 브릿지 준비 단계**
- 사용자가 "브릿지 결제" 선택
- 브릿지 정보 표시 (금액, 수수료, 예상 시간)
- "브릿지 시작" 버튼 활성화

### **2. 브릿지 실행 단계**
- `BridgeButton` 클릭
- nexus-widgets가 브릿지 시뮬레이션 실행
- 지갑에서 트랜잭션 승인 요청
- 사용자가 MetaMask 등에서 승인

### **3. 브릿지 완료 단계**
- 트랜잭션 확인 및 완료
- 성공 시 `onSuccess()` 콜백 호출
- 실패 시 `onError()` 콜백 호출

## 🎨 UI/UX 특징

### **진행 상태 표시:**
- **준비**: 브릿지 정보와 시작 버튼
- **진행 중**: 로딩 스피너와 진행 메시지
- **완료**: 성공 메시지
- **실패**: 에러 메시지

### **브릿지 정보:**
- **금액**: 브릿지할 토큰 양
- **수수료**: 예상 가스비 (~0.001 ETH)
- **예상 시간**: 2-5분
- **대상 체인**: Polygon (Chain ID: 137)

## 🔗 연동된 컴포넌트

### **PaymentModal에서 사용:**
```typescript
{selectedMethod === 'bridge' && (
  <BridgePayment
    amount="2.5"
    token="USDC"
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

### **2. 브릿지 테스트**
- `/products` 페이지에서 보험 상품 선택
- "Purchase Insurance" 클릭
- "브릿지 결제" 선택
- "브릿지 시작" 클릭
- 지갑에서 트랜잭션 승인

### **3. 예상 결과**
- Ethereum에서 Polygon으로 USDC 브릿지
- 브릿지 완료 후 보험 가입 성공 페이지로 이동

## 🛠️ 기술 스택

### **사용된 라이브러리:**
- **@avail-project/nexus-widgets**: BridgeButton 컴포넌트
- **@avail-project/nexus-core**: nexus SDK
- **React**: 컴포넌트 구현
- **TypeScript**: 타입 안전성

### **nexus SDK 설정:**
- **네트워크**: testnet
- **대상 체인**: Polygon (137)
- **토큰**: USDC
- **브릿지 방식**: nexus SDK 자동 최적화

## 📝 참고 사항

### **브릿지 과정:**
1. **시뮬레이션**: 가스비 및 수수료 계산
2. **트랜잭션 생성**: 소스 체인에서 브릿지 트랜잭션 생성
3. **지갑 승인**: 사용자가 MetaMask에서 승인
4. **브릿지 실행**: nexus SDK가 브릿지 실행
5. **완료 확인**: 대상 체인에서 토큰 수신 확인

### **에러 처리:**
- 지갑 연결 확인
- 네트워크 오류 처리
- 트랜잭션 실패 처리
- 사용자 피드백 제공

### **성능 최적화:**
- nexus SDK의 자동 최적화 활용
- 가스비 최적화
- 브릿지 시간 최소화

---
*마지막 업데이트: 2024-12-19*
