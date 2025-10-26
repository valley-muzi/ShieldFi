/**
 * 로컬에서 실제 보험 가입 트랜잭션 생성
 */

import { ethers } from 'ethers';
import { env } from './src/config/env.js';

// Insurance 컨트랙트 ABI (필요한 함수만)
const insuranceABI = [
  {
    "inputs": [
      {"name": "productId", "type": "uint256"},
      {"name": "coverageAmount", "type": "uint256"}
    ],
    "name": "applyPolicy",
    "outputs": [{"name": "policyId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "policyId", "type": "uint256"}],
    "name": "getPolicy",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "holder", "type": "address"},
          {"name": "productId", "type": "uint256"},
          {"name": "premiumPaid", "type": "uint256"},
          {"name": "coverageAmount", "type": "uint256"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "activatedAt", "type": "uint256"},
          {"name": "tokenId", "type": "uint256"},
          {"name": "status", "type": "uint8"}
        ],
        "internalType": "struct Policy",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function createTestPolicy() {
  console.log('🏥 테스트 보험 가입 트랜잭션 생성');
  console.log('=====================================');
  
  try {
    // Provider와 Signer 설정
    const provider = new ethers.JsonRpcProvider(env.RPC_URL);
    const wallet = new ethers.Wallet(env.WALLET_PK, provider);
    
    console.log('👛 지갑 주소:', wallet.address);
    
    // Insurance 컨트랙트 연결
    const insuranceAddress = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"; // localhost.json에서
    const insuranceContract = new ethers.Contract(insuranceAddress, insuranceABI, wallet);
    
    console.log('🏗️  Insurance 컨트랙트 주소:', insuranceAddress);
    
    // 보험 가입 파라미터
    const productId = 1;
    const coverageAmount = ethers.parseEther("10.0"); // 10 ETH 보장
    const premium = ethers.parseEther("0.1"); // 0.1 ETH 보험료
    
    console.log('📋 보험 가입 정보:');
    console.log('상품 ID:', productId);
    console.log('보장 금액:', ethers.formatEther(coverageAmount), 'ETH');
    console.log('보험료:', ethers.formatEther(premium), 'ETH');
    console.log('');
    
    // 보험 가입 트랜잭션 전송
    console.log('📤 보험 가입 트랜잭션 전송 중...');
    const tx = await insuranceContract.applyPolicy(productId, coverageAmount, {
      value: premium
    });
    
    console.log('트랜잭션 해시:', tx.hash);
    console.log('⏳ 트랜잭션 확인 대기 중...');
    
    // 트랜잭션 확인
    const receipt = await tx.wait();
    console.log('✅ 트랜잭션 확인 완료!');
    console.log('블록 번호:', receipt.blockNumber);
    console.log('가스 사용량:', receipt.gasUsed.toString());
    
    // PolicyCreated 이벤트에서 policyId 추출
    const policyCreatedEvent = receipt.logs.find(log => {
      try {
        const iface = new ethers.Interface([
          'event PolicyCreated(uint256 indexed policyId, address indexed holder, uint256 indexed productId, uint256 premiumPaid, uint256 coverageAmount)'
        ]);
        const parsed = iface.parseLog(log);
        return parsed.name === 'PolicyCreated';
      } catch {
        return false;
      }
    });
    
    if (policyCreatedEvent) {
      const iface = new ethers.Interface([
        'event PolicyCreated(uint256 indexed policyId, address indexed holder, uint256 indexed productId, uint256 premiumPaid, uint256 coverageAmount)'
      ]);
      const parsed = iface.parseLog(policyCreatedEvent);
      
      console.log('');
      console.log('🎉 보험 가입 성공!');
      console.log('정책 ID:', parsed.args.policyId.toString());
      console.log('보유자:', parsed.args.holder);
      console.log('상품 ID:', parsed.args.productId.toString());
      console.log('납부 보험료:', ethers.formatEther(parsed.args.premiumPaid), 'ETH');
      console.log('보장 금액:', ethers.formatEther(parsed.args.coverageAmount), 'ETH');
    }
    
    console.log('');
    console.log('=====================================');
    console.log('🧪 이제 이 트랜잭션으로 ClaimService 테스트 가능:');
    console.log('트랜잭션 해시:', tx.hash);
    console.log('=====================================');
    
    return {
      txHash: tx.hash,
      policyId: policyCreatedEvent ? ethers.getBigInt(policyCreatedEvent.topics[1]).toString() : null,
      holder: wallet.address
    };
    
  } catch (error) {
    console.error('❌ 보험 가입 실패:', error);
    throw error;
  }
}

// 실행
createTestPolicy().catch(console.error);
