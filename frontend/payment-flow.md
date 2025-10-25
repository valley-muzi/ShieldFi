# Payment Flow 구현 문서

## 📋 개요
ShieldFi 프로젝트의 보험 가입 결제 플로우 구현 문서입니다. nexus SDK를 활용하여 다양한 결제 방식을 제공합니다.

## 🎯 목표
- 보험 가입 시 다양한 결제 방식 제공 (직접/브릿지/스왑)
- nexus SDK를 활용한 크로스체인 결제 기능
- 사용자 친화적인 결제 경험 제공

## 📁 파일 구조
```
src/features/insurance/components/products/
├─ PaymentModal.tsx              # 결제 방식 선택 모달
└─ ProductsPage.tsx              # 보험 상품 페이지 (수정됨)

src/features/bridge/components/
└─ BridgePayment.tsx             # 브릿지 결제 컴포넌트

src/features/swap/components/
└─ SwapPayment.tsx               # 스왑 결제 컴포넌트
```

## 🔧 구현된 기능

### **1. PaymentModal.tsx**
**위치**: `src/features/insurance/components/products/PaymentModal.tsx`

**주요 기능:**
- 3가지 결제 방식 선택 (직접/브릿지/스왑)
- 지갑 연결 상태 확인
- 선택한 결제 방식에 따른 컴포넌트 렌더링
- 결제 성공/실패 처리

**인터페이스:**
```typescript
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    premium: string;
    coverage: string;
  };
  onPaymentSuccess: () => void;
}
```

**결제 방식:**
```typescript
type PaymentMethod = 'direct' | 'bridge' | 'swap';

const paymentMethods = [
  {
    id: 'direct',
    name: '직접 결제',
    description: '현재 체인의 토큰으로 직접 결제',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'bridge',
    name: '브릿지 결제',
    description: '다른 체인에서 토큰을 브릿지하여 결제',
    icon: ArrowLeftRight,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'swap',
    name: '스왑 결제',
    description: '다른 토큰을 스왑하여 결제',
    icon: Zap,
    color: 'from-green-500 to-green-600'
  }
];
```

### **2. ProductsPage.tsx 수정**
**위치**: `src/features/insurance/components/products/ProductsPage.tsx`

**변경 사항:**
```typescript
// 기존: 바로 success 페이지로 이동
const handlePurchase = (policy: Record<string, string>) => {
  router.push(`/success?${params.toString()}`);
};

// 새로운: 결제 모달 표시
const handlePurchase = (product: any) => {
  setSelectedProduct(product);
  setIsPaymentModalOpen(true);
};
```

**추가된 상태 관리:**
```typescript
const [selectedProduct, setSelectedProduct] = useState<any>(null);
const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
```

## 🔄 전체 결제 플로우

### **1. 보험 상품 선택**
```
사용자 → ProductsPage → "Purchase Insurance" 클릭
```

### **2. 결제 방식 선택**
```
PaymentModal → 3가지 결제 방식 중 선택
├─ 직접 결제
├─ 브릿지 결제
└─ 스왑 결제
```

### **3. 결제 실행**
```
선택한 방식에 따라 해당 컴포넌트 렌더링
├─ 직접 결제 → 간단한 결제 처리
├─ 브릿지 결제 → BridgePayment 컴포넌트
└─ 스왑 결제 → SwapPayment 컴포넌트
```

### **4. 결제 완료**
```
성공 → /success 페이지로 이동
실패 → 에러 메시지 표시
```

## 🎨 UI/UX 특징

### **결제 모달 UI:**
- **상품 정보 표시**: 보험 상품명, 보상금액, 보험료
- **지갑 연결 상태**: 연결됨/연결 안됨 상태 표시
- **결제 방식 선택**: 3가지 방식의 카드 형태 선택
- **진행 상태 표시**: 로딩, 성공, 실패 상태

### **결제 방식별 UI:**
- **직접 결제**: 간단한 정보 표시와 결제 버튼
- **브릿지 결제**: BridgePayment 컴포넌트 렌더링
- **스왑 결제**: SwapPayment 컴포넌트 렌더링

## 🔗 컴포넌트 연동

### **PaymentModal → BridgePayment:**
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

### **PaymentModal → SwapPayment:**
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

const { isConnected, walletAddress } = useNexus();
```

## 🧪 테스트 방법

### **1. 기본 테스트**
1. 지갑 연결 (Header → "Connect Wallet")
2. `/products` 페이지 이동
3. 보험 상품 선택
4. "Purchase Insurance" 클릭
5. 결제 방식 선택
6. 결제 진행

### **2. 직접 결제 테스트**
- "직접 결제" 선택
- "직접 결제" 버튼 클릭
- 성공 시 `/success` 페이지 이동

### **3. 브릿지 결제 테스트**
- "브릿지 결제" 선택
- BridgePayment 컴포넌트 렌더링 확인
- "브릿지 시작" 클릭
- 지갑에서 트랜잭션 승인

### **4. 스왑 결제 테스트**
- "스왑 결제" 선택
- SwapPayment 컴포넌트 렌더링 확인
- "스왑 시작" 클릭
- 지갑에서 트랜잭션 승인

## 🛠️ 기술 스택

### **사용된 라이브러리:**
- **@avail-project/nexus-widgets**: BridgeButton, TransferButton
- **@avail-project/nexus-core**: nexus SDK
- **React**: 컴포넌트 구현
- **TypeScript**: 타입 안전성
- **Framer Motion**: 애니메이션

### **nexus SDK 설정:**
- **네트워크**: testnet
- **지갑 연결**: MetaMask 등 EIP-1193 지갑
- **브릿지**: Ethereum → Polygon
- **스왑**: ETH → USDC

## 📝 참고 사항

### **결제 과정:**
1. **상품 선택**: 사용자가 보험 상품 선택
2. **결제 방식 선택**: 직접/브릿지/스왑 중 선택
3. **지갑 연결 확인**: 연결되지 않은 경우 경고
4. **결제 실행**: 선택한 방식으로 결제 진행
5. **완료 처리**: 성공/실패에 따른 처리

### **에러 처리:**
- 지갑 연결 확인
- 네트워크 오류 처리
- 트랜잭션 실패 처리
- 사용자 피드백 제공

### **성능 최적화:**
- nexus SDK의 자동 최적화 활용
- 가스비 최적화
- 트랜잭션 시간 최소화
- 사용자 경험 개선

### **보안 고려사항:**
- 트랜잭션 검증
- 지갑 연결 보안
- 사용자 데이터 보호
- 스마트 컨트랙트 보안

---
*마지막 업데이트: 2024-12-19*
