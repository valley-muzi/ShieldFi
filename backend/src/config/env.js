import dotenv from 'dotenv';

// .env 파일에서 환경 변수 로드
dotenv.config();

// 디버깅: 환경변수 로드 확인 (필요시 주석 해제)
// console.log('🔍 dotenv 로드 후 LOCAL_RPC_URL:', process.env.LOCAL_RPC_URL);
// console.log('🔍 dotenv 로드 후 LOCAL_PRIVATE_KEY 존재:', !!process.env.LOCAL_PRIVATE_KEY);

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
 * 로컬(하드햇)과 Sepolia 환경을 자동으로 감지하여 적절한 설정을 사용합니다.
 * LOCAL_ 접두사가 있으면 로컬 환경, 없으면 Sepolia 환경으로 판단합니다.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 환경 감지: LOCAL_RPC_URL이 있으면 로컬 환경
const isLocal = !!process.env.LOCAL_RPC_URL;

// 로컬 환경에서 localhost.json 읽기
let localhostContracts = {};
if (isLocal) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const localhostPath = join(__dirname, '../../../contracts/hardhat/deployments/localhost.json');
    const localhostData = JSON.parse(readFileSync(localhostPath, 'utf8'));
    localhostContracts = localhostData.contracts || {};
    console.log('📋 localhost.json에서 컨트랙트 주소 로드:', Object.keys(localhostContracts));
  } catch (error) {
    console.warn('⚠️  localhost.json 파일을 읽을 수 없습니다:', error.message);
  }
}

console.log(`🌍 환경 감지: ${isLocal ? 'LOCAL (하드햇)' : 'SEPOLIA'}`);

export const env = {
  // 서버 설정
  PORT: process.env.PORT ?? '4000',
  
  // PostgreSQL 데이터베이스 설정
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: process.env.DB_PORT ?? '5432',
  DB_NAME: process.env.DB_NAME ?? 'shieldfi',
  DB_USER: process.env.DB_USER ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'password',
  
  // 🔄 환경별 Web3 블록체인 설정
  RPC_URL: isLocal 
    ? process.env.LOCAL_RPC_URL 
    : process.env.RPC_URL,
    
  CHAIN_ID: isLocal 
    ? Number(process.env.LOCAL_CHAIN_ID ?? 31337)
    : Number(process.env.CHAIN_ID ?? 11155111), // Sepolia 기본값
    
  WALLET_PK: isLocal 
    ? process.env.LOCAL_PRIVATE_KEY
    : process.env.SEPOLIA_PRIVATE_KEY,
    
  // 컨트랙트 주소 (로컬은 localhost.json에서, Sepolia은 .env에서)
  PAYOUT_CONTRACT_ADDRESS: isLocal
    ? (localhostContracts.Payout?.address || localhostContracts.Insurance?.address || '') // Payout이 없으면 Insurance 사용
    : process.env.SEPOLIA_PAYOUT_CONTRACT_ADDRESS ?? '',
    
  // localhost.json에서 읽어온 모든 컨트랙트 주소 (디버깅용)
  LOCALHOST_CONTRACTS: localhostContracts,
    
  // 기타 설정
  BLOCKSCOUT_API_KEY: process.env.BLOCKSCOUT_API_KEY ?? '',
  
  // 현재 환경 정보
  IS_LOCAL: isLocal,
  ENVIRONMENT: isLocal ? 'local' : 'sepolia'
};
