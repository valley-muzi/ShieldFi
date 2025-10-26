/**
 * 로컬 하드햇 네트워크 테스트 스크립트
 */

import claimService from './src/services/claim.service.js';
import { env } from './src/config/env.js';

async function testLocalSetup() {
  console.log('🧪 로컬 하드햇 네트워크 테스트 시작');
  console.log('=====================================');
  
  // 1. 환경변수 확인
  console.log('📋 환경변수 확인:');
  console.log('환경:', env.ENVIRONMENT);
  console.log('로컬 환경:', env.IS_LOCAL ? 'YES' : 'NO');
  console.log('RPC_URL:', env.RPC_URL);
  console.log('CHAIN_ID:', env.CHAIN_ID);
  console.log('WALLET_PK:', env.WALLET_PK ? '설정됨 ✅' : '미설정 ❌');
  console.log('PAYOUT_CONTRACT_ADDRESS:', env.PAYOUT_CONTRACT_ADDRESS);
  
  if (env.IS_LOCAL) {
    console.log('📋 localhost.json 컨트랙트들:');
    Object.entries(env.LOCALHOST_CONTRACTS).forEach(([name, contract]) => {
      console.log(`  ${name}: ${contract.address}`);
    });
  }
  console.log('');
  
  // 2. 컨트랙트 초기화 확인
  console.log('🏗️  컨트랙트 초기화 확인:');
  console.log('Payout 컨트랙트:', claimService.payoutContract ? '초기화됨 ✅' : '초기화 안됨 ❌');
  console.log('');
  
  // 3. 네트워크 연결 테스트
  try {
    console.log('🌐 네트워크 연결 테스트:');
    const provider = claimService.payoutContract?.runner?.provider;
    if (provider) {
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      console.log('네트워크 체인 ID:', network.chainId.toString());
      console.log('현재 블록 번호:', blockNumber);
      console.log('네트워크 연결 ✅');
    } else {
      console.log('Provider 없음 ❌');
    }
  } catch (error) {
    console.log('네트워크 연결 실패 ❌:', error.message);
  }
  console.log('');
  
  // 4. 지갑 주소 확인
  try {
    console.log('👛 지갑 정보:');
    const address = claimService.payoutContract?.runner?.address;
    const provider = claimService.payoutContract?.runner?.provider;
    
    if (address && provider) {
      console.log('지갑 주소:', address);
      const balance = await provider.getBalance(address);
      console.log('지갑 잔액:', balance.toString(), 'wei');
      console.log('지갑 잔액:', (Number(balance) / 1e18).toFixed(4), 'ETH');
    } else {
      console.log('지갑 정보 없음 ❌');
    }
  } catch (error) {
    console.log('지갑 정보 조회 실패:', error.message);
  }
  console.log('');
  
  // 5. 컨트랙트 함수 호출 테스트 (읽기 전용)
  try {
    console.log('📜 컨트랙트 함수 테스트:');
    // Payout 컨트랙트에 읽기 전용 함수가 있다면 여기서 테스트
    console.log('컨트랙트 주소:', claimService.payoutContract?.target || claimService.payoutContract?.address);
  } catch (error) {
    console.log('컨트랙트 함수 호출 실패:', error.message);
  }
  
  console.log('=====================================');
  console.log('✅ 로컬 테스트 완료');
}

// 테스트 실행
testLocalSetup().catch(error => {
  console.error('❌ 테스트 실패:', error);
  process.exit(1);
});
