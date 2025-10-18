src/
├── app.js                       # Express 앱 초기화 및 미들웨어 설정
├── server.js                    # HTTP 서버 구동 및 포트 리스닝
│
├── config/                      # 환경 변수, DB, Web3 등 설정 파일
│   ├── env.js                   # dotenv 설정 및 환경 변수 로드
│   ├── db.config.js             # MongoDB 연결 로직
│   └── web3.config.js           # RPC URL, 체인 ID 등 Web3 설정
│
├── controllers/                 # REST API 요청 제어 (입출력 처리)
│   ├── auth.controller.js       # 사용자 인증 관련 컨트롤러
│   ├── claim.controller.js      # 보험금 청구 API 처리
│   └── policy.controller.js     # 보험 상품 발행/관리 API 처리
│
├── middlewares/                 # 전역 미들웨어 관리
│   ├── auth.middleware.js       # JWT 인증 및 사용자 권한 검증
│   └── error.middleware.js      # 에러 핸들링 및 응답 포맷 통일
│
├── models/                      # DB 스키마 (Mongoose)
│   ├── user.model.js            # 사용자 데이터 (email, wallet 등)
│   ├── policy.model.js          # 보험 상품 스키마
│   └── claim.model.js           # 청구 이력 및 상태 관리
│
├── routes/                      # API 엔드포인트 라우팅
│   ├── index.js                 # 전체 라우트 통합 및 등록
│   ├── auth.routes.js           # /api/auth 라우팅
│   ├── claim.routes.js          # /api/claim 라우팅
│   └── policy.routes.js         # /api/policy 라우팅
│
├── services/                    # 핵심 비즈니스 로직 (DB + Web3 연동)
│   ├── auth.service.js          # 로그인/회원가입 로직
│   ├── claim.service.js         # 보험금 청구 처리 (DB ↔ 스마트컨트랙트)
│   └── policy.service.js        # 보험 상품 발행 및 업데이트 로직
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
└── tests/                       # 단위/통합 테스트 폴더 (선택)
    ├── claim.test.js
    └── policy.test.js
