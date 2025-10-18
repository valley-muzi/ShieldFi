frontend/
├─ .next/                         # Next.js 빌드 산출물 (자동 생성)
├─ node_modules/                  # 프로젝트 의존성 패키지
├─ public/                        # 정적 파일 (이미지, 아이콘, 파비콘 등)
│   └─ favicon.ico
│
├─ src/                           # 실제 애플리케이션 소스코드
│   ├─ app/                       # Next.js App Router (페이지 엔트리)
│   │   ├─ globals.css            # 전역 스타일 (Tailwind 포함)
│   │   ├─ layout.tsx             # 전체 레이아웃 정의 (Provider, Navbar 등)
│   │   └─ page.tsx               # 메인 페이지 (Landing)
│   │
│   ├─ components/                # 공용 UI 컴포넌트 (shadcn/ui)
│   │   └─ ui/                    # shadcn-ui 자동생성 컴포넌트
│   │       ├─ button.tsx         # 버튼 컴포넌트
│   │       ├─ card.tsx           # 카드형 레이아웃
│   │       ├─ dialog.tsx         # 모달형 UI
│   │       └─ input.tsx          # 입력 필드
│   │
│   ├─ features/                  # 기능(도메인)별 폴더 구조
│   │   ├─ common/                # 공통 UI 및 유틸
│   │   │   └─ components/        # Navbar, Footer 등
│   │   │
│   │   ├─ wallet/                # 지갑 연결 관련 모듈
│   │   │   ├─ components/        # WalletButton 등 UI
│   │   │   ├─ hooks/             # useWallet 등 wagmi 훅 기반 로직
│   │   │   └─ api/               # 지갑 관련 유틸 혹은 API
│   │   │
│   │   ├─ insurance/             # 보험 상품 관련 모듈
│   │   │   ├─ components/        # InsuranceCard, TierBadge 등
│   │   │   ├─ hooks/             # useInsurance, useSubscribe
│   │   │   └─ api/               # 보험 상품 조회, 가입 API
│   │   │
│   │   ├─ nft/                   # NFT 발급 및 조회 관련
│   │   │   ├─ components/        # NFTCard 등
│   │   │   ├─ hooks/
│   │   │   └─ api/
│   │
│   ├─ lib/                       # 라이브러리 설정 및 헬퍼
│   │   ├─ wagmi.ts               # wagmi 설정 (chain, connector 등)
│   │   ├─ utils.ts               # 공용 유틸 함수
│   │   └─ viem.ts                # viem 클라이언트 설정 (필요 시)
│   │
│   ├─ styles/                    # 추가 전역 스타일 (Tailwind 확장)
│   │
│   └─ types/                     # 전역 타입 정의 (d.ts)
│       └─ insurance.d.ts
│
├─ components.json                # shadcn 설정파일
├─ eslint.config.mjs              # ESLint 설정
├─ next.config.ts                 # Next.js 설정
├─ postcss.config.mjs             # Tailwind + PostCSS 설정
├─ tsconfig.json                  # TypeScript 설정
├─ package.json                   # 프로젝트 의존성 관리
└─ README.md                      # 프로젝트 문서
