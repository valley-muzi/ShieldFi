frontend/
├─ .next/                         # Next.js 빌드 산출물 (자동 생성)
├─ node_modules/                  # 프로젝트 의존성 패키지
├─ public/                        # 정적 파일 (이미지, 아이콘, 파비콘 등)
│   └─ favicon.ico
│
├─ src/                           # 실제 애플리케이션 소스코드
│   ├─ app/                       # Next.js App Router (페이지 엔트리)
│   │   ├─ globals.css            # 전역 스타일 (Tailwind + 커스텀 CSS 변수)
│   │   ├─ layout.tsx             # 전체 레이아웃 정의 (Header 포함)
│   │   ├─ page.tsx               # 메인 페이지 (Landing + ParticleBackground)
│   │   ├─ products/              # 보험 상품 페이지
│   │   │   └─ page.tsx           # ProductsPage 컴포넌트
│   │   ├─ history/               # 정책 히스토리 페이지
│   │   │   └─ page.tsx           # HistoryPage 컴포넌트
│   │   ├─ claim-complete/        # 청구 완료 페이지
│   │   └─ success/               # 성공 페이지
│   │
│   ├─ features/                  # 기능(도메인)별 폴더 구조
│   │   ├─ common/                # 공통 UI 및 유틸
│   │   │   ├─ components/        # 공통 컴포넌트
│   │   │   │   ├─ AnimatedCounter.tsx    # 숫자 카운팅 애니메이션
│   │   │   │   ├─ StatCard.tsx          # 통계 카드 (차트 포함)
│   │   │   │   ├─ Header.tsx            # 네비게이션 헤더
│   │   │   │   ├─ button.tsx            # 버튼 컴포넌트 (shadcn/ui)
│   │   │   │   ├─ card.tsx              # 카드 컴포넌트 (shadcn/ui)
│   │   │   │   ├─ dialog.tsx            # 모달 컴포넌트 (shadcn/ui)
│   │   │   │   └─ input.tsx             # 입력 필드 (shadcn/ui)
│   │   │   └─ effects/           # 시각적 효과 컴포넌트
│   │   │       └─ ParticleBackground.tsx # Canvas 기반 파티클 배경
│   │   │
│   │   ├─ wallet/                # 지갑 연결 관련 모듈
│   │   │   ├─ components/        # WalletButton 등 UI
│   │   │   ├─ hooks/             # useWallet 등 wagmi 훅 기반 로직
│   │   │   └─ api/               # 지갑 관련 유틸 혹은 API
│   │   │
│   │   ├─ insurance/             # 보험 상품 관련 모듈
│   │   │   ├─ components/        # 보험 관련 UI 컴포넌트
│   │   │   │   └─ products/      # 보험 상품 전용 컴포넌트
│   │   │   │       ├─ PolicyCard.tsx        # 보험 정책 카드
│   │   │   │       ├─ NFTCertificate.tsx    # NFT 인증서 (3D 플립)
│   │   │   │       ├─ ClaimModal.tsx        # 보험 청구 모달
│   │   │   │       ├─ PolicyDetailPage.tsx  # 정책 상세 페이지
│   │   │   │       └─ ProductsPage.tsx      # 상품 목록 페이지
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

## 🎨 디자인 시스템 & 라이브러리

### 애니메이션 & 시각화
- **Framer Motion** (v12.23.24): 고급 애니메이션 라이브러리
  - AnimatedCounter: 숫자 카운팅 애니메이션
  - 3D Transform: NFTCertificate 플립 효과
  - Spring 애니메이션: 부드러운 전환 효과
- **Recharts** (v3.3.0): 데이터 시각화 차트
  - StatCard: 통계 데이터 차트 표시
  - AreaChart: 영역 차트로 트렌드 표시
- **Canvas API**: ParticleBackground 파티클 효과
  - 물리 기반 파티클 시스템
  - 충돌 감지 및 반응
  - 그라디언트 및 글로우 효과

### UI 컴포넌트
- **shadcn/ui**: 기본 UI 컴포넌트 (Button, Card, Dialog, Input)
- **Radix UI**: 접근성 기반 컴포넌트
- **Lucide React**: 아이콘 라이브러리
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **tw-animate-css**: Tailwind 애니메이션 확장

### 데이터 관리
- **TanStack React Query** (v5.90.5): 서버 상태 관리
- **Wagmi** (v2.18.1): Web3 지갑 연결
- **Viem** (v2.38.3): 이더리움 클라이언트

### 디자인 특징
- **그라디언트 디자인**: blue-to-teal, purple-to-pink 등
- **3D 효과**: CSS Transform 기반 플립 애니메이션
- **파티클 배경**: Canvas 기반 인터랙티브 배경
- **반응형 차트**: Recharts 기반 데이터 시각화
- **부드러운 애니메이션**: Framer Motion 기반 전환 효과
