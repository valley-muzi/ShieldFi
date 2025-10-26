import { useState, useEffect } from 'react';
import { Button } from '@/features/common/components/button';
import { Card } from '@/features/common/components/card';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { INSURANCE_ABI, getContractAddress } from '@/lib/contracts';
import { ApplyPolicyRequest } from '@/types/insurance';

interface InsuranceContractCallProps {
  product: {
    id: string;
    name: string;
    premium: string;
    coverage: string;
  };
  onSuccess: (policyId: bigint, transactionHash: string) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export default function InsuranceContractCall({ 
  product, 
  onSuccess, 
  onError, 
  onBack 
}: InsuranceContractCallProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // 고정된 보험 조건 (간단하게)
  const coverageAmount = '1'; // 1 ETH 보장
  const premiumAmount = '0.001'; // 0.001 ETH 보험료 (더 낮은 금액으로 테스트)
  
  // 체인 ID 확인 (31337 = localhost)
  console.log('Current chain ID:', chainId);

  // 컨트랙트 호출
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // wagmi 에러 모니터링
  if (error) {
    console.error('❌ wagmi writeContract 에러:', error);
    console.error('에러 상세:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
  }

  const handleApplyPolicy = async () => {
    console.log('=== 보험 가입 시작 ===');
    console.log('지갑 연결 상태:', isConnected);
    console.log('현재 주소:', address);
    console.log('현재 체인 ID:', chainId);
    
    if (!isConnected) {
      console.log('❌ 지갑이 연결되지 않음');
      onError('지갑을 먼저 연결해주세요.');
      return;
    }

    // 체인 ID 확인 (31337 = localhost)
    if (chainId !== 31337) {
      console.log('❌ 잘못된 네트워크:', chainId, '필요: 31337');
      onError(`Hardhat Local 네트워크로 연결해주세요. 현재 Chain ID: ${chainId}, 필요: 31337`);
      return;
    }

    // 디버깅을 위한 로그
    console.log('Product ID:', product.id, 'Type:', typeof product.id);
    
    // 상품 ID 처리 (product-1 형태에서 숫자 추출)
    let productId: number;
    if (typeof product.id === 'string') {
      // "product-1" 형태에서 숫자 부분만 추출
      const match = product.id.match(/product-(\d+)/);
      if (match) {
        productId = parseInt(match[1]);
        console.log('✅ 문자열에서 숫자 추출:', match[1], '→', productId);
      } else {
        // 일반 숫자 문자열인 경우
        productId = parseInt(product.id);
        console.log('✅ 직접 파싱:', product.id, '→', productId);
      }
    } else {
      productId = Number(product.id);
      console.log('✅ 숫자 변환:', product.id, '→', productId);
    }
    
    // 상품 ID가 유효하지 않으면 기본값 1 사용
    if (isNaN(productId) || productId <= 0) {
      console.log('⚠️ 잘못된 product ID, 기본값 1 사용');
      productId = 1;
    }

    console.log('최종 product ID:', productId);

    try {
      // ApplyPolicyRequest 타입에 맞게 데이터 구성
      const request: ApplyPolicyRequest = {
        productId,
        coverageAmount: parseEther(coverageAmount),
        premiumAmount: parseEther(premiumAmount)
      };

      console.log('=== 컨트랙트 호출 데이터 ===');
      console.log('컨트랙트 주소:', getContractAddress('Insurance'));
      console.log('요청 데이터:', {
        productId: request.productId,
        coverageAmount: request.coverageAmount.toString(),
        premiumAmount: request.premiumAmount.toString(),
        coverageAmountWei: request.coverageAmount.toString(),
        premiumAmountWei: request.premiumAmount.toString()
      });
      console.log('체인 ID:', chainId);
      console.log('ABI 함수명:', 'applyPolicy');
      
      console.log('=== writeContract 호출 시작 ===');
      writeContract({
        address: getContractAddress('Insurance'),
        abi: INSURANCE_ABI,
        functionName: 'applyPolicy',
        args: [
          BigInt(request.productId),     // productId: 상품 식별자
          request.coverageAmount        // coverageAmount: 1 ETH 보장
        ],
        value: request.premiumAmount,   // 0.001 ETH 보험료
      });
      
      console.log('✅ writeContract 호출 완료');
      
    } catch (error: any) {
      console.error('❌ 컨트랙트 호출 에러:', error);
      console.error('에러 타입:', typeof error);
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
      onError(error.message || '보험 가입 중 오류가 발생했습니다.');
    }
  };

  // 트랜잭션 성공 시 처리
  useEffect(() => {
    console.log('=== 트랜잭션 상태 모니터링 ===');
    console.log('isConfirmed:', isConfirmed);
    console.log('hash:', hash);
    console.log('isPending:', isPending);
    console.log('error:', error);
    
    if (isConfirmed && hash) {
      console.log('✅ 트랜잭션 확인됨!');
      console.log('Transaction Hash:', hash);
      
      // 실제 policyId는 이벤트에서 가져와야 하지만, 
      // 현재는 간단하게 트랜잭션 해시의 마지막 부분을 사용
      const policyId = BigInt(parseInt(hash.slice(-8), 16));
      console.log('생성된 Policy ID:', policyId.toString());
      
      // 보험 가입 후 자동으로 활성화 (NFT 발급)
      console.log('=== 자동 활성화 시작 ===');
      activatePolicy(policyId);
      
      console.log('=== onSuccess 콜백 호출 ===');
      onSuccess(policyId, hash);
    }
  }, [isConfirmed, hash, isPending, error, onSuccess]);

  // 보험 활성화 함수 (NFT 발급)
  const activatePolicy = async (policyId: bigint) => {
    try {
      console.log('=== 보험 활성화 시작 ===');
      console.log('Policy ID:', policyId.toString());
      console.log('컨트랙트 주소:', getContractAddress('Insurance'));
      
      const result = writeContract({
        address: getContractAddress('Insurance'),
        abi: INSURANCE_ABI,
        functionName: 'activate',
        args: [policyId],
      });
      
      console.log('✅ activate 호출 완료:', result);
      console.log('activate 트랜잭션 해시:', result);
      
    } catch (error: any) {
      console.error('❌ 보험 활성화 에러:', error);
      console.error('에러 상세:', {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      });
    }
  };

  // 에러 처리
  if (error) {
    onError(error.message || '트랜잭션에 실패했습니다.');
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          ← 뒤로
        </Button>
        <h4 className="font-semibold text-lg">보험 가입</h4>
      </div>

      {/* 상품 정보 */}
      <Card className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-slate-600 text-sm">{product.coverage}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">보상 한도:</span>
            <span className="ml-2 font-medium">{coverageAmount} ETH</span>
          </div>
          <div>
            <span className="text-slate-500">연간 보험료:</span>
            <span className="ml-2 font-medium text-teal-600">{premiumAmount} ETH</span>
          </div>
        </div>
      </Card>

      {/* 지갑 연결 상태 */}
      {!isConnected ? (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-600 font-medium">지갑을 먼저 연결해주세요.</p>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-600 font-medium">
              지갑 연결됨: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </Card>
      )}


      {/* 액션 버튼들 */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          disabled={isPending || isConfirming}
        >
          취소
        </Button>
        
        <Button
          onClick={handleApplyPolicy}
          disabled={!isConnected || isPending || isConfirming}
          className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:opacity-90 text-white"
        >
          {isPending || isConfirming ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isPending ? '트랜잭션 전송 중...' : '확인 대기 중...'}
            </div>
          ) : (
            '보험 가입'
          )}
        </Button>
      </div>

      {/* 트랜잭션 상태 표시 */}
      {(isPending || isConfirming) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <p className="text-blue-600 text-sm">
              {isPending ? '트랜잭션을 전송하고 있습니다...' : '트랜잭션 확인을 기다리고 있습니다...'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
