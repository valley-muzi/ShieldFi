# 데이터베이스 설정 가이드

## 📋 개요

ShieldFi 백엔드 API는 PostgreSQL 데이터베이스를 사용합니다. 이 가이드는 Docker를 사용한 PostgreSQL 설정 방법을 안내합니다.

## 🐳 Docker를 사용한 설정 (권장)

### 1. Docker 및 Docker Compose 설치

#### Windows
1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
2. 설치 후 Docker Desktop 실행

#### macOS
1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
2. 또는 Homebrew 사용:
   ```bash
   brew install --cask docker
   ```

#### Linux (Ubuntu/Debian)
```bash
# Docker 설치
sudo apt update
sudo apt install docker.io docker-compose

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
# 로그아웃 후 다시 로그인 필요
```

### 2. Docker Compose로 데이터베이스 실행

```bash
# 프로젝트 루트에서 실행
docker-compose up -d postgres

# 실행 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs postgres
```

### 3. 환경 변수 설정

```bash
# Docker용 환경 변수 파일 복사
cp docker.env .env

# 또는 직접 .env 파일 생성
```

`.env` 파일 내용:
```env
# Server Configuration
PORT=4000

# PostgreSQL Database Configuration (Docker)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=shieldfi
DB_USER=postgres
DB_PASSWORD=shieldfi_password

# Web3 Configuration (나중에 설정)
RPC_URL=
CHAIN_ID=0
WALLET_PK=
POLICY_CONTRACT=
CLAIM_CONTRACT=
```

### 4. 데이터베이스 마이그레이션 실행

```bash
cd backend
npm install
npm run migrate
```

### 5. pgAdmin 접속 (선택사항)

- URL: http://localhost:5050
- 이메일: admin@shieldfi.com
- 비밀번호: admin123

### 6. Docker 컨테이너 관리

```bash
# 컨테이너 중지
docker-compose down

# 컨테이너 중지 및 볼륨 삭제 (데이터 삭제)
docker-compose down -v

# 컨테이너 재시작
docker-compose restart postgres

# 로그 실시간 확인
docker-compose logs -f postgres
```

## 🛠️ 수동 설치 방법 (Docker 사용 불가 시)

## 🛠️ PostgreSQL 설치

### Windows

1. **PostgreSQL 공식 사이트에서 다운로드**
   - https://www.postgresql.org/download/windows/
   - 최신 버전 다운로드 (권장: PostgreSQL 15+)

2. **설치 과정**
   - 다운로드한 설치 파일 실행
   - 설치 경로 선택 (기본값 권장)
   - 포트 번호 설정 (기본값: 5432)
   - postgres 사용자 비밀번호 설정 (기억해두세요!)
   - 설치 완료

3. **설치 확인**
   ```cmd
   psql --version
   ```

### macOS

1. **Homebrew를 사용한 설치**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **설치 확인**
   ```bash
   psql --version
   ```

### Linux (Ubuntu/Debian)

1. **패키지 업데이트 및 PostgreSQL 설치**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **PostgreSQL 서비스 시작**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **설치 확인**
   ```bash
   psql --version
   ```

## 🗄️ 데이터베이스 생성

### 1. PostgreSQL에 접속

```bash
# Windows (명령 프롬프트)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

### 2. ShieldFi 데이터베이스 생성

```sql
-- 데이터베이스 생성
CREATE DATABASE shieldfi;

-- 데이터베이스 확인
\l

-- shieldfi 데이터베이스로 전환
\c shieldfi
```

### 3. 사용자 생성 (선택사항)

```sql
-- 새 사용자 생성
CREATE USER shieldfi_user WITH PASSWORD 'your_secure_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE shieldfi TO shieldfi_user;

-- 사용자 확인
\du
```

## ⚙️ 환경 변수 설정

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성합니다:

```env
# Server Configuration
PORT=4000

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shieldfi
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Web3 Configuration (나중에 설정)
RPC_URL=
CHAIN_ID=0
WALLET_PK=
POLICY_CONTRACT=
CLAIM_CONTRACT=
```

### 2. 환경 변수 설명

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `DB_HOST` | 데이터베이스 호스트 주소 | localhost | localhost |
| `DB_PORT` | 데이터베이스 포트 번호 | 5432 | 5432 |
| `DB_NAME` | 데이터베이스 이름 | shieldfi | shieldfi |
| `DB_USER` | 데이터베이스 사용자명 | postgres | postgres |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | password | your_password |

## 🚀 데이터베이스 마이그레이션 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 마이그레이션 실행

```bash
# 마이그레이션 실행
npm run migrate
```

### 3. 실행 결과 확인

성공적인 실행 시 다음과 같은 로그가 출력됩니다:

```
[Migration] Starting database migrations...
[Migration] Executing: 001_create_products_table.sql
[Migration] ✅ Success: 001_create_products_table.sql
[Migration] Executing: 002_create_insurance_policy_table.sql
[Migration] ✅ Success: 002_create_insurance_policy_table.sql
[Migration] ✅ All migrations completed successfully
```

## 🔍 데이터베이스 확인

### 1. 테이블 생성 확인

```sql
-- PostgreSQL에 접속
psql -U postgres -d shieldfi

-- 테이블 목록 확인
\dt

-- PRODUCT 테이블 구조 확인
\d product

-- INSURANCE_POLICY 테이블 구조 확인
\d insurance_policy
```

### 2. 초기 데이터 확인

```sql
-- PRODUCT 테이블 데이터 확인
SELECT * FROM product;

-- 예상 결과
-- product_id | product_name | tier  | product_description | ...
-- 1         | Basic Shield | BASIC | 기본 보호 보험 상품  | ...
-- 2         | Premium Shield | PREMIUM | 프리미엄 보호 보험 상품 | ...
-- 3         | Ultimate Shield | ULTIMATE | 최고급 보호 보험 상품 | ...
```

## 🧪 연결 테스트

### 1. 서버 실행

```bash
cd backend
npm run dev
```

### 2. API 테스트

```bash
# 헬스 체크
curl http://localhost:4000/health

# 상품 목록 조회
curl http://localhost:4000/api/products
```

### 3. 예상 응답

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Basic Shield",
      "tier": "BASIC",
      "description": "기본 보호 보험 상품으로 소액 손실에 대한 보장을 제공합니다.",
      "coverage": {
        "min": "1000000000000000000",
        "max": "10000000000000000000"
      },
      "premiumRate": "100000000000000000",
      "createdAt": "2025-01-19T00:00:00.000Z",
      "updatedAt": "2025-01-19T00:00:00.000Z"
    }
  ],
  "count": 3
}
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 연결 실패
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**해결 방법:**
- PostgreSQL 서비스가 실행 중인지 확인
- 포트 번호가 올바른지 확인 (기본값: 5432)
- 방화벽 설정 확인

#### 2. 인증 실패
```
Error: password authentication failed for user "postgres"
```

**해결 방법:**
- .env 파일의 DB_PASSWORD가 올바른지 확인
- PostgreSQL 사용자 비밀번호 재설정

#### 3. 데이터베이스 없음
```
Error: database "shieldfi" does not exist
```

**해결 방법:**
- 데이터베이스 생성: `CREATE DATABASE shieldfi;`
- .env 파일의 DB_NAME 확인

#### 4. 권한 부족
```
Error: permission denied for table product
```

**해결 방법:**
- 사용자 권한 확인: `\du`
- 권한 부여: `GRANT ALL PRIVILEGES ON DATABASE shieldfi TO your_user;`

### 로그 확인

```bash
# PostgreSQL 로그 확인 (Linux/macOS)
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Windows
# PostgreSQL 설치 경로의 data/log 폴더에서 로그 확인
```

## 📚 추가 리소스

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL 가이드](https://node-postgres.com/)
- [데이터베이스 마이그레이션 모범 사례](https://www.prisma.io/dataguide/types/relational/what-are-database-migrations)

## ✅ 체크리스트

- [ ] PostgreSQL 설치 완료
- [ ] shieldfi 데이터베이스 생성 완료
- [ ] .env 파일 설정 완료
- [ ] 마이그레이션 실행 완료
- [ ] 테이블 생성 확인 완료
- [ ] 초기 데이터 확인 완료
- [ ] API 테스트 완료
- [ ] 연결 테스트 완료
