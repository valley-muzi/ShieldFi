# 보험 가입 결제 기능 설정 가이드

## 🚀 빠른 시작

### 1. 개발 서버 실행

```bash
cd frontend
pnpm install  # 이미 실행한 경우 생략
pnpm dev
```

### 2. 브라우저에서 테스트

1. http://localhost:3000 접속
2. Header에서 "Connect Wallet" 클릭하여 지갑 연결
3. `/products` 페이지로 이동
4. 보험 상품 선택 후 "Purchase Insurance" 클릭
5. 세 가지 결제 방식 중 하나 선택:
   - **직접 결제**: 현재 체인에서 ETH로 직접 결제
   - **브릿지 결제**: 다른 체인에서 ETH 브릿지 후 결제
   - **스왑 결제**: USDC 등 다른 토큰을 ETH로 스왑 후 결제

---

## 📂 구현된 파일 목록

### 새로 생성된 파일

1. **`src/features/insurance/constants/payment.ts`**

   - 보험사 지갑 주소 상수
   - 체인별 지갑 주소 매핑
   - 헬퍼 함수

2. **`src/features/insurance/components/payment/DirectPayment.tsx`**

   - 직접 결제 컴포넌트
   - ETH 전송 로직
   - 트랜잭션 확인

3. **`insurance-payment-feature.md`**
   - 전체 기능 구현 문서
   - 개발자 가이드
   - 테스트 시나리오

### 수정된 파일

1. **`src/features/bridge/components/BridgePayment.tsx`**

   - 브릿지 후 자동 결제 로직 추가
   - 2단계 프로세스 구현

2. **`src/features/swap/components/SwapPayment.tsx`**

   - 스왑 후 자동 결제 로직 추가
   - DEX 연동 준비

3. **`src/features/insurance/components/products/PaymentModal.tsx`**
   - DirectPayment 컴포넌트 import
   - 세 가지 결제 방식 통합

---

## 🔧 주요 기능

### 1. 직접 결제 (DirectPayment)

**사용 방법:**

```typescript
<DirectPayment
  amount="0.05" // ETH 단위
  onSuccess={() => console.log("결제 완료")}
  onError={(error) => console.error("결제 실패:", error)}
/>
```

**특징:**

- ✅ 현재 연결된 체인에서 ETH 직접 전송
- ✅ Ethereum, Base 체인 지원
- ✅ 실시간 트랜잭션 상태 표시
- ✅ 가스비 정보 제공

### 2. 브릿지 결제 (BridgePayment)

**사용 방법:**

```typescript
<BridgePayment
  amount="0.05" // ETH 단위
  onSuccess={() => console.log("브릿지 및 결제 완료")}
  onError={(error) => console.error("실패:", error)}
/>
```

**특징:**

- ✅ Nexus SDK 활용한 크로스체인 브릿지
- ✅ 브릿지 완료 후 자동 결제 버튼 제공
- ✅ 2단계 프로세스 (브릿지 → 결제)
- ✅ 브릿지 수수료 및 예상 시간 표시

### 3. 스왑 결제 (SwapPayment)

**사용 방법:**

```typescript
<SwapPayment
  amount="0.05" // ETH로 변환될 목표 금액
  fromToken="USDC" // 스왑할 토큰
  onSuccess={() => console.log("스왑 및 결제 완료")}
  onError={(error) => console.error("실패:", error)}
/>
```

**특징:**

- ✅ 다른 토큰을 ETH로 스왑
- ✅ 스왑 비율 실시간 계산
- ✅ DEX 연동 준비 완료 (현재는 시뮬레이션)
- ✅ 스왑 수수료 및 예상 시간 표시

---

## 💰 보험사 지갑 주소

모든 결제는 다음 주소로 전송됩니다:

| 네트워크             | Chain ID | 지갑 주소                                    |
| -------------------- | -------- | -------------------------------------------- |
| **Ethereum Mainnet** | 1        | `0x2784177671da5525461296a2f170009339e92dc2` |
| **Ethereum Sepolia** | 11155111 | `0x2784177671da5525461296a2f170009339e92dc2` |
| **Base Mainnet**     | 8453     | `0x2784177671da5525461296a2f170009339e92dc2` |
| **Base Sepolia**     | 84532    | `0x2784177671da5525461296a2f170009339e92dc2` |

---

## 🔄 결제 프로세스

### 직접 결제 플로우

```
1. 사용자가 보험 상품 선택
2. "직접 결제" 선택
3. 결제 정보 확인 (보험료, 네트워크, 가스비)
4. "ETH 결제하기" 버튼 클릭
5. MetaMask 등에서 트랜잭션 승인
6. 트랜잭션 전송 및 확인 (최대 60초)
7. 성공 시 → 성공 페이지로 이동
```

### 브릿지 결제 플로우

```
1. 사용자가 보험 상품 선택
2. "브릿지 결제" 선택
3. 브릿지 정보 확인
4. "ETH 브릿지 시작" 버튼 클릭
5. MetaMask에서 브릿지 트랜잭션 승인 (1차)
6. 브릿지 완료 대기 (약 2-5분)
7. "ETH 결제하기" 버튼 클릭
8. MetaMask에서 결제 트랜잭션 승인 (2차)
9. 결제 완료 확인
10. 성공 시 → 성공 페이지로 이동
```

### 스왑 결제 플로우

```
1. 사용자가 보험 상품 선택
2. "스왑 결제" 선택
3. 스왑 정보 확인 (비율, 필요 토큰 양)
4. "스왑 & 결제 시작" 버튼 클릭
5. MetaMask에서 토큰 승인 (1차)
6. 스왑 실행 (토큰 → ETH)
7. MetaMask에서 결제 트랜잭션 승인 (2차)
8. 결제 완료 확인
9. 성공 시 → 성공 페이지로 이동
```

---

## 🧪 테스트 가이드

### 테스트넷 설정

1. **Sepolia Testnet 사용**

   - Sepolia Faucet에서 테스트 ETH 받기
   - https://sepoliafaucet.com/

2. **Base Sepolia Testnet 사용**
   - Base Sepolia Faucet에서 테스트 ETH 받기
   - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### 직접 결제 테스트

```bash
# 1. 지갑 연결 (Sepolia 네트워크)
# 2. /products 페이지 접속
# 3. 보험 상품 선택 (예: Smart Contract Insurance - 0.05 ETH)
# 4. "직접 결제" 선택
# 5. 결제 진행
# 6. Etherscan에서 트랜잭션 확인
```

### 브릿지 결제 테스트

```bash
# 1. 지갑 연결 (Polygon Mumbai 등 다른 네트워크)
# 2. /products 페이지 접속
# 3. 보험 상품 선택
# 4. "브릿지 결제" 선택
# 5. 브릿지 진행
# 6. 브릿지 완료 후 결제 진행
# 7. Etherscan에서 트랜잭션 확인
```

### 스왑 결제 테스트

```bash
# 1. 지갑 연결 (USDC 보유 확인)
# 2. /products 페이지 접속
# 3. 보험 상품 선택
# 4. "스왑 결제" 선택
# 5. 스왑 및 결제 진행
# 7. Etherscan에서 트랜잭션 확인
```

---

## 🐛 문제 해결

### "지갑이 연결되지 않았습니다"

**문제:** 지갑이 연결되지 않음  
**해결:**

1. Header의 "Connect Wallet" 버튼 클릭
2. MetaMask 등 지갑 확장 프로그램 설치 확인
3. 브라우저에서 지갑 확장 프로그램 활성화

### "Insufficient funds"

**문제:** 지갑 잔액 부족  
**해결:**

1. 충분한 ETH 보유 확인
2. 가스비 포함한 총 금액 확인
3. 테스트넷의 경우 Faucet에서 테스트 ETH 받기

### "Transaction failed"

**문제:** 트랜잭션 실패  
**해결:**

1. 가스비 설정 확인
2. 네트워크 혼잡도 확인
3. 지갑 주소 확인
4. 브라우저 콘솔에서 에러 메시지 확인

### "User rejected the request"

**문제:** 사용자가 트랜잭션 거부  
**해결:**

1. MetaMask에서 승인 버튼 클릭
2. 트랜잭션 내용 확인 후 승인

---

## 📚 추가 문서

### 상세 문서

- **`insurance-payment-feature.md`**: 전체 기능 구현 가이드
- **`bridge-feature.md`**: 브릿지 기능 가이드
- **`Nexus-widgets.md`**: Nexus SDK 사용 가이드
- **`Nexus-core.md`**: Nexus Core 가이드

### 관련 파일

- **`payment.ts`**: 결제 상수 및 헬퍼 함수
- **`DirectPayment.tsx`**: 직접 결제 컴포넌트
- **`BridgePayment.tsx`**: 브릿지 결제 컴포넌트
- **`SwapPayment.tsx`**: 스왑 결제 컴포넌트
- **`PaymentModal.tsx`**: 결제 모달 컴포넌트

---

## 🎯 다음 단계

### 개선 사항

1. **DEX 연동**

   - Uniswap, Sushiswap 등 실제 DEX 연동
   - 실시간 스왑 비율 조회

2. **가스비 최적화**

   - 가스비 실시간 조회
   - 사용자 정의 가스비 설정

3. **트랜잭션 히스토리**

   - 결제 내역 저장 및 조회
   - 블록 익스플로러 링크

4. **다중 토큰 지원**

   - USDC, USDT 등 스테이블코인 직접 결제
   - 토큰 선택 옵션 추가

5. **알림 시스템**
   - 트랜잭션 진행 상황 알림
   - 이메일 또는 푸시 알림

---

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. `insurance-payment-feature.md` 문서 확인
2. 브라우저 콘솔 로그 확인
3. 개발팀에 문의

---

_마지막 업데이트: 2025-01-26_
