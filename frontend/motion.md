# Motion 라이브러리 충돌 문제 해결 과정

## 🔍 문제 상황

### **발생한 오류**
```
Error: It's currently unsupported to use "export *" in a client boundary. Please use named exports instead.
```

### **오류 원인**
- **Next.js 15**: `export *` 구문이 클라이언트 컴포넌트에서 지원되지 않음
- **nexus-widgets**: 내부적으로 `motion` 라이브러리 사용 (12.23.0)
- **우리 프로젝트**: `framer-motion` 라이브러리 사용 (12.23.24)
- **충돌**: 두 라이브러리가 동시에 존재하여 Webpack 번들링 시 문제 발생

## 🔧 시도한 해결 방법들

### **1. framer-motion 제거 후 motion 설치**
```bash
pnpm remove framer-motion
pnpm add motion
```

**결과**: ❌ 실패
- 모든 파일의 import 구문 수정 필요
- API 차이로 인한 호환성 문제 가능성

### **2. 모든 파일 import 수정**
```typescript
// 기존
import { motion } from "framer-motion";

// 변경
import { motion } from "motion";
```

**수정된 파일들:**
- `ClaimModal.tsx`
- `ProductsPage.tsx`
- `PolicyCard.tsx`
- `PolicyDetailPage.tsx`
- `NFTCertificate.tsx`
- `StatCard.tsx`
- `AnimatedCounter.tsx`

**결과**: ❌ 실패
- nexus-widgets 내부의 motion 라이브러리와 여전히 충돌

### **3. Webpack 설정으로 우회**
`next.config.ts` 생성:
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'motion': 'framer-motion'
    }
    return config
  }
}

export default nextConfig
```

**결과**: ❌ 실패
```
Module not found: Package path ./react is not exported from package framer-motion
```

## 🎯 현재 상황

### **문제점**
- **nexus-widgets**: `motion/react` 경로를 찾으려고 함
- **framer-motion**: `./react` 경로를 export하지 않음
- **Webpack alias**: 경로 매핑이 제대로 작동하지 않음

### **해결되지 않은 이유**
1. **nexus-widgets**: 내부적으로 motion 라이브러리 의존성
2. **framer-motion**: motion과 다른 패키지 구조
3. **Next.js 15**: 새로운 제약사항으로 인한 호환성 문제

## 🛠️ 남은 해결 방법들

### **방법 1: nexus-widgets 다운그레이드**
```bash
pnpm remove @avail-project/nexus-widgets
pnpm add @avail-project/nexus-widgets@0.0.4
```

### **방법 2: nexus-widgets 제거 후 직접 구현**
```bash
pnpm remove @avail-project/nexus-widgets
```

### **방법 3: Webpack 설정 수정**
```typescript
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'motion/react': 'framer-motion',
      'motion': 'framer-motion'
    }
    return config
  }
}
```

## 📊 의존성 분석

### **현재 설치된 라이브러리**
```
@avail-project/nexus-widgets 0.0.5
└── motion 12.23.0

framer-motion 12.23.24
```

### **충돌 지점**
- **nexus-widgets**: `motion` 라이브러리 사용
- **우리 프로젝트**: `framer-motion` 라이브러리 사용
- **Webpack**: 두 라이브러리를 함께 번들링할 때 충돌

## 🎯 권장 해결책

### **1순위: nexus-widgets 다운그레이드**
- **장점**: 기존 코드 수정 없음
- **단점**: 이전 버전 사용으로 인한 기능 제한 가능성

### **2순위: nexus-widgets 제거**
- **장점**: 완전한 제어 가능
- **단점**: BridgeButton, TransferButton 직접 구현 필요

### **3순위: Webpack 설정 수정**
- **장점**: 라이브러리 변경 없음
- **단점**: 복잡한 설정, 호환성 문제 가능성

## 📝 다음 단계

1. **nexus-widgets 다운그레이드 시도**
2. **빌드 테스트**
3. **기능 테스트**
4. **실패 시 다른 방법 시도**

---
*작성일: 2024-12-19*
*상태: 해결 중*
