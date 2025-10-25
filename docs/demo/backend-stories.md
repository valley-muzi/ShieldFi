# Web3 보험 dApp 백엔드 개발 백로그 (v6)

이 문서는 `docs/architecture.md` (v6)를 기반으로 도출된 백엔드 개발 스토리 목록입니다.

## Epic 1: 보험 상품 API 개발

* **Story 1.1 (DB)**: `PRODUCT` 테이블 스키마 생성 및 초기 데이터 마이그레이션 스크립트 작성.
* **Story 1.2 (API)**: `GET /api/products` 엔드포인트 구현.
    * **Task**: PostgreSQL `PRODUCT` 테이블에서 모든 상품 정보를 조회하여 API 사양에 맞게 반환.

## Epic 2: 보험 가입 이력 조회 및 인덱싱

* **Story 2.1 (DB)**: `INSURANCE_POLICY` 테이블 스키마 생성 (온체인 인덱스 저장용).
* **Story 2.2 (Integration)**: Blockscout API 연동 모듈 개발.
    * **Task 2.2.1 (느린 검색)**: `wallet_addr`와 `nft_addr`로 최초 가입 사실(`nft_token_id` 등)을 온체인에서 스캔하는 함수 구현.
    * **Task 2.2.2 (빠른 조회)**: `nft_token_id`로 `insurance_status`와 `is_paid` 동적 상태를 온체인에서 확인하는 함수 구현.
* **Story 2.3 (API)**: `GET /api/insurance-history` 엔드포인트 구현 (Index-on-Read 패턴).
    * **Task 2.3.1 (Cache Hit)**: `INSURANCE_POLICY` DB에서 인덱스 조회.
    * **Task 2.3.2 (Cache Miss)**: `Task 2.2.1` 호출 및 결과 `INSERT` (인덱스 생성).
    * **Task 2.3.3 (융합)**: `Task 2.2.2`를 호출하여 DB(정적)와 Blockscout(동적) 데이터를 융합하여 반환.

## Epic 3: 보험금 청구 및 즉시 지급

* **Story 3.1 (Backend Logic)**: 서버 Hot Wallet 및 지급 컨트랙트 연동.
    * **Task 3.1.1 (보안)**: 서버 Private Key를 안전하게 로드하여 Ethers.js `Signer` 생성.
    * **Task 3.1.2 (연동)**: '보험금 지급 컨트랙트' ABI와 `Signer`를 연결.
* **Story 3.2 (API)**: `POST /api/claims` 엔드포인트 구현 (검증 및 지급 **전송**).
    * **Task 3.2.1 (검증)**: `Epic 2` 로직을 재사용하여 보험 `ACTIVE` 상태 온체인 검증 및 내부 기준 검증 수행.
    * **Task 3.2.2 (거절)**: 검증 실패 시 `400 Bad Request` 반환.
    * **Task 3.2.3 (전송)**: 검증 성공 시 `Task 3.1.2`의 컨트랙트 함수를 **전송(Submit)**.
    * **Task 3.2.4 (응답)**: 전송 성공 시 `200 OK` (payment_tx_hash 포함), 전송 실패 시 `500 Internal Server Error` 반환.