# ShieldFi Backend API

Web3 보험 dApp의 백엔드 API 서버입니다.

## 기술 스택

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Testing**: Jest
- **Web3**: Web3.js

## 프로젝트 구조

```
src/
├── app.js                       # Express 앱 초기화 및 미들웨어 설정
├── server.js                    # HTTP 서버 구동 및 포트 리스닝
│
├── config/                      # 환경 변수, DB, Web3 등 설정 파일
│   ├── env.js                   # dotenv 설정 및 환경 변수 로드
│   ├── db.config.js             # PostgreSQL 연결 로직
│   └── web3.config.js           # RPC URL, 체인 ID 등 Web3 설정
│
├── controllers/                 # REST API 요청 제어 (입출력 처리)
│   ├── auth.controller.js       # 사용자 인증 관련 컨트롤러
│   ├── claim.controller.js      # 보험금 청구 API 처리
│   ├── policy.controller.js     # 보험 상품 발행/관리 API 처리
│   └── product.controller.js    # 보험 상품 조회 API 처리
│
├── middlewares/                 # 전역 미들웨어 관리
│   ├── auth.middleware.js       # JWT 인증 및 사용자 권한 검증
│   └── error.middleware.js      # 에러 핸들링 및 응답 포맷 통일
│
├── models/                      # DB 모델 (PostgreSQL)
│   ├── user.model.js            # 사용자 데이터 (email, wallet 등)
│   ├── policy.model.js          # 보험 상품 스키마
│   ├── claim.model.js           # 청구 이력 및 상태 관리
│   └── product.model.js         # 보험 상품 모델
│
├── routes/                      # API 엔드포인트 라우팅
│   ├── index.js                 # 전체 라우트 통합 및 등록
│   ├── auth.routes.js           # /api/auth 라우팅
│   ├── claim.routes.js          # /api/claim 라우팅
│   ├── policy.routes.js         # /api/policy 라우팅
│   └── product.routes.js        # /api/products 라우팅
│
├── services/                    # 핵심 비즈니스 로직 (DB + Web3 연동)
│   ├── auth.service.js          # 로그인/회원가입 로직
│   ├── claim.service.js         # 보험금 청구 처리 (DB ↔ 스마트컨트랙트)
│   ├── policy.service.js        # 보험 상품 발행 및 업데이트 로직
│   └── product.service.js       # 보험 상품 비즈니스 로직
│
├── utils/                       # 공용 유틸 함수
│   ├── asyncHandler.js          # 비동기 에러 래퍼 (try/catch 단축)
│   └── logger.js                # 콘솔/파일 로깅 유틸
│
├── web3/                        # 스마트컨트랙트 연동 관련 로직
│   ├── clients/
│   │   └── web3Client.js        # Web3 인스턴스 초기화 및 provider 설정
│   ├── contracts/
│   │   ├── policy.abi.json      # Policy 컨트랙트 ABI
│   │   ├── claim.abi.json       # Claim 컨트랙트 ABI
│   │   └── addresses.json       # 배포된 컨트랙트 주소 정보
│   ├── services/
│   │   ├── policy.contract.js   # Policy 관련 스마트컨트랙트 함수 호출
│   │   └── claim.contract.js    # Claim 관련 스마트컨트랙트 함수 호출
│   └── utils/
│       └── tx.js                # 트랜잭션 생성, 서명, 전송 유틸
│
└── tests/                       # 단위/통합 테스트 폴더
    ├── claim.test.js
    ├── policy.test.js
    └── product.test.js

migrations/                      # 데이터베이스 마이그레이션 파일
├── 001_create_products_table.sql
└── 002_create_insurance_policy_table.sql

scripts/                        # 유틸리티 스크립트
└── migrate.js                  # 데이터베이스 마이그레이션 실행
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. Docker로 데이터베이스 실행 (권장)

```bash
# 프로젝트 루트에서 실행
docker-compose up -d postgres

# 또는 npm 스크립트 사용
npm run docker:db
```

### 3. 환경 변수 설정

```bash
# Docker용 환경 변수 파일 복사
cp docker.env .env
```

또는 `.env` 파일을 직접 생성:

```env
# Server
PORT=4000

# PostgreSQL Database (Docker)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=shieldfi
DB_USER=postgres
DB_PASSWORD=shieldfi_password

# Web3 (나중에 설정)
RPC_URL=
CHAIN_ID=0
WALLET_PK=
POLICY_CONTRACT=
CLAIM_CONTRACT=
```

### 4. 데이터베이스 마이그레이션 실행
```bash
npm run migrate
```

### 5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 🐳 Docker 명령어

### 데이터베이스 관리
```bash
# PostgreSQL 컨테이너 시작
npm run docker:db

# PostgreSQL 컨테이너 중지
npm run docker:db:stop

# 데이터베이스 초기화 (데이터 삭제)
npm run docker:db:reset

# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs postgres
```

### pgAdmin 접속
- URL: http://localhost:5050
- 이메일: admin@shieldfi.com
- 비밀번호: admin123

## API 엔드포인트

### 보험 상품 API (`/api/products`)

- `GET /api/products` - 모든 보험 상품 조회

### 응답 형식

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Basic Shield",
      "tier": "BASIC",
      "description": "기본 보호 보험 상품",
      "coverage": {
        "min": "1000000000000000000",
        "max": "10000000000000000000"
      },
      "premiumRate": "100000000000000000",
      "createdAt": "2025-01-19T00:00:00.000Z",
      "updatedAt": "2025-01-19T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

## 테스트

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

## 데이터베이스 스키마

### PRODUCT 테이블
보험 상품 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| product_id | SERIAL | 상품 고유 ID (PK) |
| product_name | VARCHAR(100) | 상품명 (UNIQUE) |
| tier | VARCHAR(50) | 상품 등급 (UNIQUE) |
| product_description | TEXT | 상품 설명 |
| coverage_amount_min | DECIMAL(20,8) | 최소 보장 금액 (Wei) |
| coverage_amount_max | DECIMAL(20,8) | 최대 보장 금액 (Wei) |
| premium_rate | BIGINT | 보험료율 (Wei) |
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |

### INSURANCE_POLICY 테이블
온체인 인덱싱된 보험 정책 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| policy_id | SERIAL | 정책 고유 ID (PK) |
| user_wallet_addr | VARCHAR(42) | 사용자 지갑 주소 |
| product_id | INT | 가입한 상품 ID (FK) |
| nft_contract_addr | VARCHAR(42) | 발급된 NFT 컨트랙트 주소 |
| nft_token_id | VARCHAR(255) | 발급된 NFT 토큰 ID |
| policy_start_date | TIMESTAMP | 보험 시작일 |
| policy_end_date | TIMESTAMP | 보험 종료일 |
| join_tx_hash | VARCHAR(66) | 보험 상품 가입 트랜잭션 해시 |
| issue_tx_hash | VARCHAR(66) | NFT 발급 트랜잭션 해시 |
| premium_paid | DECIMAL(20,8) | 사용자가 납부한 실제 보험료 (Wei) |
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |
