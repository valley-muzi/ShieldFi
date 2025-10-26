# 보험금 청구 API 구현 문서

## 📋 개요

ShieldFi 보험금 청구 API는 사용자가 보험금을 청구하면 백엔드에서 검증 후 스마트 컨트랙트를 실행하여 자동으로 지급을 처리하는 시스템입니다.

### 🎯 핵심 특징
- **단일 API 엔드포인트**: `POST /api/claims`
- **자동 검증**: 트랜잭션 유효성 및 NFT 소유권 검증
- **즉시 지급**: 검증 통과 시 바로 컨트랙트 실행
- **원자성 보장**: 승인과 지급이 하나의 트랜잭션에서 처리

## 🔄 전체 플로우

### 1. 프론트엔드 → 백엔드 API 호출

```javascript
// 프론트엔드에서 청구 요청
const response = await fetch('/api/claims', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tx_hash: "0xabc1234fae5b0d9b0e9e3f1b9b5e8b9fce3a9d6c4f7c9a6b9a7a2b1c8d9e0f1",
    wallet_addr: "0x742d35Cc6634C0532925a3b8D4C2C4e0C5C2C4e0",
    nft_addr: "0xdef5678...",
    nft_id: 123
  })
});
```

### 2. 백엔드 처리 단계

```
요청 접수 (Controller)
    ↓
검증 및 컨트랙트 실행 (Service)
    ↓
1. 트랜잭션 검증
2. NFT 소유권 검증
3. 정책 정보 추출
4. Payout.approveAndPay() 실행
    ↓
응답 반환 (200/400/500)
```

### 3. 스마트 컨트랙트 실행

```solidity
// 백엔드에서 호출
Payout.approveAndPay(policyId, beneficiary, amount)
    ↓ (컨트랙트 내부에서 자동)
Treasury.payOut(beneficiary, policyId, amount)
    ↓ (컨트랙트 내부에서 자동)
실제 ETH 전송 + 이벤트 발생
```

## 📁 파일 구조

```
backend/src/
├── routes/
│   └── claim.routes.js          # API 라우팅 정의
├── controllers/
│   └── claim.controller.js      # 요청/응답 처리
├── services/
│   └── claim.service.js         # 비즈니스 로직 및 컨트랙트 실행
└── web3/
    └── contracts/
        └── payout.abi.json      # Payout 컨트랙트 ABI
```

## 🛠️ 구현 상세

### 1. 라우팅 (claim.routes.js)

```javascript
/**
 * 보험금 청구 요청 라우트
 * @route POST /api/claims
 * @access Public (트랜잭션 해시로 검증)
 */
router.post('/', submitClaimRequest);
```

### 2. 컨트롤러 (claim.controller.js)

**역할**: 요청 받기 → 서비스 호출 → 응답 반환

```javascript
export const submitClaimRequest = asyncHandler(async (req, res) => {
  const { tx_hash, wallet_addr, nft_addr, nft_id } = req.body;
  
  // 서비스 레이어에서 모든 비즈니스 로직 처리
  const result = await claimService.processClaim({
    tx_hash, wallet_addr, nft_addr, nft_id
  });
  
  // 결과에 따른 HTTP 상태코드 반환
  if (!result.success) {
    return res.status(400).json({ status: "error", message: result.message });
  }
  
  res.status(200).json({ status: "ok", message: "청구 요청 완료" });
});
```

### 3. 서비스 (claim.service.js)

**역할**: 검증 로직 + 컨트랙트 실행

#### 3-1. 트랜잭션 검증

```javascript
async validateTransaction(txHash) {
  const receipt = await web3.eth.getTransactionReceipt(txHash);
  
  // 1. 트랜잭션 존재 확인
  if (!receipt) return { isValid: false, message: '트랜잭션을 찾을 수 없습니다.' };
  
  // 2. 트랜잭션 성공 확인
  if (!receipt.status) return { isValid: false, message: '실패한 트랜잭션입니다.' };
  
  // 3. PolicyCreated 이벤트 확인
  const policyCreatedEvent = receipt.logs.find(log => 
    log.topics[0] === web3.utils.keccak256('PolicyCreated(uint256,address,uint256,uint256,uint256)')
  );
  
  if (!policyCreatedEvent) {
    return { isValid: false, message: '보험 가입 트랜잭션이 아닙니다.' };
  }
  
  return { isValid: true };
}
```

#### 3-2. NFT 소유권 검증 (선택사항)

```javascript
async validateNFTOwnership(walletAddr, nftAddr, nftId) {
  const erc721ABI = [{ /* ERC721 ownerOf ABI */ }];
  const nftContract = new web3.eth.Contract(erc721ABI, nftAddr);
  const owner = await nftContract.methods.ownerOf(nftId).call();
  
  if (owner.toLowerCase() !== walletAddr.toLowerCase()) {
    return { isValid: false, message: 'NFT 소유권이 확인되지 않습니다.' };
  }
  
  return { isValid: true };
}
```

#### 3-3. 정책 정보 추출

```javascript
async extractPolicyFromTx(txHash) {
  const receipt = await web3.eth.getTransactionReceipt(txHash);
  const eventSignature = web3.utils.keccak256('PolicyCreated(uint256,address,uint256,uint256,uint256)');
  const policyCreatedEvent = receipt.logs.find(log => log.topics[0] === eventSignature);
  
  if (policyCreatedEvent) {
    // indexed 파라미터들 (topics에서 추출)
    const policyId = web3.utils.hexToNumber(policyCreatedEvent.topics[1]);
    const holder = '0x' + policyCreatedEvent.topics[2].slice(26);
    const productId = web3.utils.hexToNumber(policyCreatedEvent.topics[3]);
    
    // non-indexed 파라미터들 (data에서 디코딩)
    const decodedData = web3.eth.abi.decodeParameters(
      ['uint256', 'uint256'], // premiumPaid, coverageAmount
      policyCreatedEvent.data
    );
    
    return {
      policyId, holder, productId,
      premiumPaid: decodedData[0],    // Wei 단위
      coverageAmount: decodedData[1]  // Wei 단위
    };
  }
  
  return null;
}
```

#### 3-4. 컨트랙트 실행

```javascript
async executeApproveAndPay(policyId, beneficiary, amount) {
  const transaction = {
    to: this.payoutContract.options.address,
    data: this.payoutContract.methods.approveAndPay(
      policyId,
      beneficiary,
      amount  // Wei 단위
    ).encodeABI()
  };
  
  // Web3Client를 통해 트랜잭션 전송
  const result = await web3Client.sendTransaction(transaction);
  
  return {
    success: true,
    transactionHash: result.transactionHash,
    message: '청구 승인 및 지급 완료'
  };
}
```

## 🔧 백엔드와 컨트랙트 상호작용

### 1. ABI를 통한 컨트랙트 호출

```javascript
// 1. ABI 로드
import payoutABI from '../web3/contracts/payout.abi.json';

// 2. 환경변수에서 컨트랙트 주소 가져오기
const contractAddress = env.PAYOUT_CONTRACT_ADDRESS;

// 3. 컨트랙트 인스턴스 생성
this.payoutContract = web3Client.createContract(payoutABI, contractAddress);

// 4. 함수 호출 데이터 인코딩
const data = this.payoutContract.methods.approveAndPay(
  policyId, beneficiary, amount
).encodeABI();

// 5. 트랜잭션 전송
const result = await web3Client.sendTransaction({
  to: contractAddress,
  data: data
});
```

### 2. 이벤트 로그 파싱

```javascript
// PolicyCreated 이벤트 구조:
// event PolicyCreated(
//   uint256 indexed policyId,
//   address indexed holder, 
//   uint256 indexed productId,
//   uint256 premiumPaid,      // non-indexed
//   uint256 coverageAmount    // non-indexed
// );

// 이벤트 시그니처 생성
const eventSignature = web3.utils.keccak256(
  'PolicyCreated(uint256,address,uint256,uint256,uint256)'
);

// 로그에서 이벤트 찾기
const event = receipt.logs.find(log => log.topics[0] === eventSignature);

// indexed 파라미터 (topics에서)
const policyId = web3.utils.hexToNumber(event.topics[1]);
const holder = '0x' + event.topics[2].slice(26);
const productId = web3.utils.hexToNumber(event.topics[3]);

// non-indexed 파라미터 (data에서)
const [premiumPaid, coverageAmount] = web3.eth.abi.decodeParameters(
  ['uint256', 'uint256'], 
  event.data
);
```

### 3. 에러 처리 및 전파

```javascript
parseContractError(error) {
  const errorMsg = error.message || error.toString();
  
  // 컨트랙트 에러를 사용자 친화적 메시지로 변환
  if (errorMsg.includes('ZeroAddress')) return '잘못된 주소입니다.';
  if (errorMsg.includes('InvalidAmount')) return '잘못된 금액입니다.';
  if (errorMsg.includes('NotAuthorized')) return '권한이 없습니다.';
  if (errorMsg.includes('AlreadyPaid')) return '이미 지급된 정책입니다.';
  if (errorMsg.includes('insufficient funds')) return 'Treasury 잔액이 부족합니다.';
  
  return '컨트랙트 실행 중 오류가 발생했습니다.';
}
```

## 📊 API 명세

### 요청 (Request)

```http
POST /api/claims
Content-Type: application/json

{
  "tx_hash": "0xabc1234fae5b0d9b0e9e3f1b9b5e8b9fce3a9d6c4f7c9a6b9a7a2b1c8d9e0f1",
  "wallet_addr": "0x742d35Cc6634C0532925a3b8D4C2C4e0C5C2C4e0",
  "nft_addr": "0xdef5678...",  // 선택사항
  "nft_id": 123               // 선택사항
}
```

### 응답 (Response)

#### 성공 (200 OK)
```json
{
  "status": "ok",
  "message": "청구 요청 완료",
  "response_time": "2025-10-18T15:42:10.123Z"
}
```

#### 검증 실패 (400 Bad Request)
```json
{
  "status": "error",
  "message": "트랜잭션을 찾을 수 없습니다.",
  "response_time": "2025-10-18T15:42:10.123Z"
}
```

#### 서버 오류 (500 Internal Server Error)
```json
{
  "status": "error",
  "message": "서버 오류가 발생했습니다.",
  "response_time": "2025-10-18T15:42:10.123Z"
}
```

## 🚨 중요 고려사항

### 1. 원자성 문제
현재 구조에서는 `Payout.approveAndPay()`만 호출하므로 ETH 지급은 완료되지만 `Insurance.finalizePaid()`는 별도 호출이 필요합니다. 이는 **원자성이 보장되지 않는 문제**가 있습니다.

**해결책**: Payout 컨트랙트에서 Insurance.finalizePaid()도 함께 호출하도록 수정 필요

### 2. 보안 고려사항
- **트랜잭션 검증**: PolicyCreated 이벤트 확인으로 유효한 보험 가입 증명
- **NFT 소유권**: 선택적으로 NFT 소유권 검증 추가
- **재진입 방지**: 컨트랙트 레벨에서 ReentrancyGuard 사용
- **권한 제어**: Payout 컨트랙트는 onlyOwner로 관리자만 실행 가능

### 3. 에러 처리
- **검증 실패**: 400 상태코드로 구체적 에러 메시지 반환
- **컨트랙트 오류**: 500 상태코드로 파싱된 에러 메시지 반환
- **서버 오류**: 500 상태코드로 일반적 에러 메시지 반환

## 🔮 향후 개선사항

1. **원자성 보장**: Payout에서 Insurance.finalizePaid() 함께 호출
2. **이벤트 모니터링**: 컨트랙트 이벤트 실시간 모니터링
3. **재시도 로직**: 네트워크 오류 시 자동 재시도
4. **배치 처리**: 다중 청구 요청 배치 처리
5. **알림 시스템**: 지급 완료 시 사용자 알림

---

**작성일**: 2025-10-25  
**작성자**: ShieldFi Team  
**버전**: 1.0.0
