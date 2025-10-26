--

## 📝 **백엔드 사용법**

이 문서는 **NFT 검증 API** 및 관련 백엔드 시스템의 사용법을 설명합니다. 이 API는 사용자의 트랜잭션을 검증하고, 해당 트랜잭션이 블록에 포함되었는지, NFT가 전송되었는지 여부를 확인하는 기능을 제공합니다.

---

### 1. **시작하기**

#### **1.1. 필요한 도구 설치**

백엔드 서버는 **Node.js**와 **Docker**를 사용하여 실행됩니다. 필요한 도구가 없다면, 먼저 설치해야 합니다.

* **Node.js 설치**:

  * [Node.js 다운로드](https://nodejs.org/) 후 설치
  * 설치가 완료되면, `node -v`와 `npm -v`를 통해 설치된 버전을 확인할 수 있습니다. (v22.19.0 권장)
* **Docker 설치**:

  * [Docker 다운로드](https://www.docker.com/products/docker-desktop) 후 설치
  * 설치가 완료되면, `docker --version`과 `docker-compose --version`을 통해 설치된 버전을 확인할 수 있습니다.

#### **1.2. 프로젝트 클론**

먼저 프로젝트를 클론합니다. 터미널에서 아래 명령어를 입력하세요:

```bash
git clone <프로젝트 URL>
cd <프로젝트 폴더>
```

#### **1.3. 의존성 설치**

프로젝트 디렉토리에서 아래 명령어로 의존성 패키지를 설치합니다: (backend 폴더 내에서)

```bash
npm install
```

---

### 2. **도커 설정**

이 프로젝트는 **Docker**와 **Docker Compose**를 사용하여 환경을 설정합니다.

#### **2.1. Docker Compose로 환경 실행**

Docker Compose를 통해 여러 컨테이너를 한 번에 실행할 수 있습니다. 아래 명령어로 Docker Compose를 실행하세요:

```bash
docker-compose up -d
```

`-d` 옵션은 백그라운드에서 실행되도록 합니다.

#### **2.2. 컨테이너 확인**

실행 중인 컨테이너를 확인하려면 아래 명령어를 입력합니다:

```bash
docker ps
```

---

### 3. **서버 실행**

#### **3.1. 서버 실행 확인**

도커와 npm 설정이 완료되면, 아래 명령어로 서버가 정상적으로 실행되는지 확인할 수 있습니다:

```bash
docker-compose up -d
```

도커 Compose가 잘 작동하면 서버가 백그라운드에서 실행됩니다.

#### **3.2. 서버 로그 확인**

서버의 로그를 확인하려면, 아래 명령어를 사용하세요:

```bash
docker-compose logs
```

또는 특정 서비스를 확인하려면:

```bash
docker-compose logs <서비스 이름>
```

---

### 4. **API 요청 및 테스트**

#### **4.1. Postman을 통한 API 테스트**

Postman을 사용하여 API를 테스트할 수 있습니다. `POST /verify-tx` 엔드포인트를 사용하여 트랜잭션을 검증할 수 있습니다.

* **URL**: `http://localhost:4000/api/verify-tx`
* **HTTP 메소드**: `POST`
* **Body**:

  ```json
  {
    "txHash": "0xfc63cac02b6988f3b35bcfb0d0df1ec201b7d15b33d7148f41e7db70d7da5d06"
  }
  ```

#### **4.2. 응답 예시**

* **성공적인 트랜잭션**:

  ```json
  {
    "ok": true,
    "state": "CONFIRMED_SUCCESS",
    "blockNumber": 9492127
  }
  ```

* **실패한 트랜잭션**:

  ```json
  {
    "ok": false,
    "state": "CONFIRMED_FAILED",
    "blockNumber": 9492127
  }
  ```

* **영수증을 찾을 수 없는 경우**:

  ```json
  {
    "ok": false,
    "state": "NO_RECEIPT"
  }
  ```

* **트랜잭션을 찾을 수 없는 경우**:

  ```json
  {
    "ok": false,
    "state": "TX_NOT_FOUND"
  }
  ```

---

### 5. **문제 해결**

#### **5.1. 트랜잭션 검증 실패**

트랜잭션 검증이 실패하거나 "NO_RECEIPT" 상태가 반환될 경우, 트랜잭션 해시가 잘못되었거나 네트워크에 포함되지 않은 트랜잭션일 수 있습니다. 다시 한 번 트랜잭션 해시를 확인해 보세요.

#### **5.2. 서버 에러**

서버가 예상한 대로 작동하지 않는 경우, 도커 로그를 확인하여 오류 메시지를 점검하십시오.

```bash
docker-compose logs
```

#### **5.3. API 응답 상태 코드**

* `200 OK`: 요청이 성공적으로 처리됨.
* `400 Bad Request`: 잘못된 요청, 예를 들어 트랜잭션 해시 누락.
* `500 Internal Server Error`: 서버 내부 오류. 서버 로그를 확인하세요.

---


---

## 🧩 NFT(ERC-1155) 보유 검증 API

### 1. **요청**

#### **1.1. URL**

* **Endpoint**: `POST /api/verify-1155`
* **설명**: 특정 지갑 주소가 지정된 ERC-1155 NFT를 보유하고 있는지 검증합니다.

#### **1.2. 요청 형식 (Request Body)**

```json
{
  "wallet_addr": "0x128a63c8279bc447c7a5574ff478b28d59c22b50",
  "nft_addr": "0x7428A5Eec110bE1631e2FefAB424D7a2b71D8ed2",
  "nft_id": 1
}
```

#### **1.3. 필드 설명**

| 필드명           | 타입                   |  필수 | 설명                        |
| :------------ | :------------------- | :-: | :------------------------ |
| `wallet_addr` | `string`             |  ✅  | 보유 여부를 확인할 지갑 주소          |
| `nft_addr`    | `string`             |  ✅  | NFT(ERC-1155) 스마트 컨트랙트 주소 |
| `nft_id`      | `number` or `string` |  ✅  | NFT의 고유 Token ID          |

---

### 2. **응답**

#### **2.1. 성공적으로 NFT를 보유한 경우**

```json
{
  "ok": true,
  "reason": "OK",
  "owned": true,
  "standard": "ERC1155",
  "blockTag": "latest"
}
```

> 💡 해당 지갑이 해당 NFT(`nft_id`)를 **1개 이상 보유 중**임을 의미합니다.

---

#### **2.2. NFT를 보유하지 않은 경우**

```json
{
  "ok": false,
  "reason": "ZERO_BALANCE",
  "owned": false,
  "standard": "ERC1155",
  "blockTag": "latest"
}
```

> ⚠️ 해당 지갑 주소가 NFT를 보유하지 않은 경우입니다.

---

#### **2.3. 잘못된 네트워크 체인에 연결된 경우**

```json
{
  "ok": false,
  "reason": "WRONG_CHAIN(0xaa36a7)"
}
```

> ⚠️ `.env` 파일에 설정된 `EXPECTED_CHAIN_ID`와 현재 RPC 네트워크의 체인 ID가 다를 때 발생합니다.
> 예: `EXPECTED_CHAIN_ID=0xaa36a7` (Sepolia)

---

#### **2.4. 컨트랙트가 존재하지 않는 경우**

```json
{
  "ok": false,
  "reason": "NOT_A_CONTRACT"
}
```

> ⚠️ `nft_addr`가 실제 스마트 컨트랙트 주소가 아닐 때 발생합니다.

---

#### **2.5. ERC-1155 표준이 아닌 경우**

```json
{
  "ok": false,
  "reason": "NOT_ERC1155"
}
```

> ⚠️ 해당 주소가 ERC-1155 인터페이스(`0xd9b67a26`)를 지원하지 않는 경우 발생합니다.

---

#### **2.6. 서버 오류**

```json
{
  "ok": false,
  "error": "Internal Server Error"
}
```

> ❌ 서버 내부 오류 발생 시 반환됩니다.
> 로그를 통해 RPC 연결 또는 ABI 호출 오류를 확인해야 합니다.

---

### 3. **서버 환경 변수 (.env)**

`.env` 파일에 다음 변수를 설정해야 합니다.

```bash
# RPC 연결용 (예: Infura, Alchemy, 또는 BlockPi)
RPC_URL=https://sepolia.infura.io/v3/<YOUR_API_KEY>

# 검증 대상 체인 ID (예: Sepolia)
EXPECTED_CHAIN_ID=0xaa36a7
```

---
### 4. **응답 상태 코드 요약**

| 상태 코드   | 의미                                              |
| ------- | ----------------------------------------------- |
| **200** | 요청 성공, 검증 결과 반환                                 |
| **400** | 필수 입력값 누락 (`wallet_addr`, `nft_addr`, `nft_id`) |
| **500** | 서버 내부 오류 또는 RPC 호출 실패                           |

---

### ✅ **정리**

| 검증 단계       | 성공 시 | 실패 시             |
| ----------- | ---- | ---------------- |
| RPC 체인 연결   | `OK` | `WRONG_CHAIN`    |
| 컨트랙트 확인     | `OK` | `NOT_A_CONTRACT` |
| ERC-1155 지원 | `OK` | `NOT_ERC1155`    |
| NFT 보유      | `OK` | `ZERO_BALANCE`   |

---