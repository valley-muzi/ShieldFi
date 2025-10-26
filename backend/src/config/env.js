import dotenv from 'dotenv';

// .env 파일에서 환경 변수 로드
dotenv.config();

/**
 * Environment Configuration
 * 
 * 애플리케이션의 모든 환경 변수를 중앙에서 관리하는 모듈입니다.
 * .env 파일과 시스템 환경 변수를 읽어와서 애플리케이션에서 사용할 수 있는
 * 형태로 제공합니다. 각 설정값은 기본값을 가지며, 환경 변수가 설정되지 않은
 * 경우 기본값을 사용합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 */

/**
 * 환경 변수 설정 객체
 * 
 * 애플리케이션에서 사용하는 모든 환경 변수를 포함합니다.
 * 각 설정값은 process.env에서 읽어오며, 값이 없는 경우 기본값을 사용합니다.
 * 
 * @type {Object}
 * @property {string} PORT - 서버 포트 번호 (기본값: '4000')
 * @property {string} DB_HOST - PostgreSQL 호스트 주소 (기본값: 'localhost')
 * @property {string} DB_PORT - PostgreSQL 포트 번호 (기본값: '5432')
 * @property {string} DB_NAME - 데이터베이스 이름 (기본값: 'shieldfi')
 * @property {string} DB_USER - 데이터베이스 사용자명 (기본값: 'postgres')
 * @property {string} DB_PASSWORD - 데이터베이스 비밀번호 (기본값: 'password')
 * @property {string} RPC_URL - Web3 RPC URL (기본값: '')
 * @property {number} CHAIN_ID - 블록체인 체인 ID (기본값: 0)
 * @property {string} WALLET_PK - 서버 지갑 개인키 (기본값: '')
 * @property {string} PAYOUT_CONTRACT_ADDRESS - Payout 컨트랙트 주소 (기본값: '')
 */
export const env = {
  // 서버 설정
  PORT: process.env.PORT ?? '4000',                    // HTTP 서버 포트 번호
  
  // PostgreSQL 데이터베이스 설정
  DB_HOST: process.env.DB_HOST ?? 'localhost',         // 데이터베이스 호스트 주소
  DB_PORT: process.env.DB_PORT ?? '5432',              // 데이터베이스 포트 번호
  DB_NAME: process.env.DB_NAME ?? 'shieldfi',          // 데이터베이스 이름
  DB_USER: process.env.DB_USER ?? 'postgres',          // 데이터베이스 사용자명
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'password',  // 데이터베이스 비밀번호
  
  // Web3 블록체인 설정
  RPC_URL: process.env.RPC_URL ?? '',                  // 이더리움 RPC 노드 URL
  CHAIN_ID: Number(process.env.CHAIN_ID ?? 0),         // 블록체인 네트워크 ID
  WALLET_PK: process.env.WALLET_PK ?? '',                        // 서버 지갑 개인키 (보험금 지급용)
  PAYOUT_CONTRACT_ADDRESS: process.env.PAYOUT_CONTRACT_ADDRESS ?? '',  // Payout 스마트 컨트랙트 주소
  
};
