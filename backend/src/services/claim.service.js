/**
 * @fileoverview 보험금 청구 서비스
 * @description 보험금 청구 요청의 검증 및 스마트 컨트랙트 실행을 담당하는 서비스 클래스
 * @author ShieldFi Team
 * @version 1.0.0
 */

import web3Client from '../web3/clients/web3Client.js';
import payoutABI from '../web3/contracts/payout.abi.json' with { type: 'json' };
import { env } from '../config/env.js';

/**
 * 보험금 청구 처리 서비스 클래스
 * 
 * @description 이 클래스는 보험금 청구 요청을 처리하는 모든 비즈니스 로직을 포함합니다:
 * - 트랜잭션 검증 (PolicyCreated 이벤트 확인)
 * - NFT 소유권 검증 (선택사항)
 * - 정책 정보 추출 (이벤트 로그 파싱)
 * - Payout 컨트랙트 실행 (승인 및 지급)
 * - 컨트랙트 에러 메시지 파싱
 * 
 * @example
 * const claimService = new ClaimService();
 * const result = await claimService.processClaim({
 *   tx_hash: "0xabc...",
 *   wallet_addr: "0x742d35...",
 *   nft_addr: "0xdef...",
 *   nft_id: 123
 * });
 */
class ClaimService {
  /**
   * ClaimService 생성자
   * @description Payout 컨트랙트 인스턴스를 초기화합니다.
   */
  constructor() {
    /** @type {Contract|null} Payout 컨트랙트 인스턴스 */
    this.payoutContract = null;
    this.init();
  }

  /**
   * Payout 컨트랙트 초기화
   * @description 환경변수에서 Payout 컨트랙트 주소를 로드하고 인스턴스를 생성합니다.
   * @private
   */
  init() {
    try {
      // 환경변수에서 Payout 컨트랙트 주소 가져오기
      const contractAddress = env.PAYOUT_CONTRACT_ADDRESS;
      
      // 컨트랙트 주소 유효성 검사
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('PAYOUT_CONTRACT_ADDRESS 환경변수가 설정되지 않았습니다.');
        return;
      }

      // Web3 컨트랙트 인스턴스 생성 (ABI + 주소)
      this.payoutContract = web3Client.createContract(payoutABI, contractAddress);
      console.log('Payout 컨트랙트 초기화 완료:', contractAddress);
    } catch (error) {
      console.error('Payout 컨트랙트 초기화 실패:', error);
    }
  }

  /**
   * 보험금 청구 요청 처리 (메인 함수)
   * 
   * @description 청구 요청을 받아 다음 단계를 순차적으로 실행합니다:
   * 1. 트랜잭션 검증 - PolicyCreated 이벤트가 포함된 성공한 트랜잭션인지 확인
   * 2. NFT 소유권 검증 - 제공된 경우 NFT 소유권 확인
   * 3. 정책 정보 추출 - 트랜잭션 로그에서 정책 데이터 파싱
   * 4. 컨트랙트 실행 - Payout.approveAndPay() 호출하여 실제 지급 실행
   * 
   * @param {Object} params - 청구 요청 파라미터
   * @param {string} params.tx_hash - 보험 가입 트랜잭션 해시
   * @param {string} params.wallet_addr - 사용자 지갑 주소 (수혜자)
   * @param {string} [params.nft_addr] - NFT 컨트랙트 주소 (필수)
   * @param {number} [params.nft_id] - NFT ID (필수)
   * 
   * @returns {Promise<Object>} 처리 결과
   * @returns {boolean} success - 성공 여부
   * @returns {string} message - 결과 메시지
   * @returns {string} [transactionHash] - 성공 시 컨트랙트 실행 트랜잭션 해시
   * @returns {number} [policyId] - 성공 시 정책 ID
   * 
   * @example
   * const result = await processClaim({
   *   tx_hash: "0xabc1234...",
   *   wallet_addr: "0x742d35...",
   *   nft_addr: "0xdef5678...",
   *   nft_id: 123
   * });
   */
  async processClaim({ tx_hash, wallet_addr, nft_addr, nft_id }) {
    try {
      console.log('🔍 청구 요청 검증 시작:', { tx_hash, wallet_addr, nft_addr, nft_id });

      // 1. 트랜잭션 검증
      const txValidation = await this.validateTransaction(tx_hash);
      if (!txValidation.valid) throw new Error(`Transaction invalid: ${txValidation.reason}`);
      

      // 2. NFT 소유권 검증 (예정)
      if (nft_addr && nft_id) {
        const nftValidation = await this.validateNFTOwnership(wallet_addr, nft_addr, nft_id);
        if (!nftValidation.valid) {
          return {
            success: false,
            message: nftValidation.message
          };
        }
      }

      // 3. 정책 정보 추출
      const policyInfo = await this.extractPolicyFromTx(tx_hash);
      if (!policyInfo) {
        return {
          success: false,
          message: '트랜잭션에서 정책 정보를 찾을 수 없습니다.'
        };
      }

      // 4. 컨트랙트 실행 - 승인 및 지급
      const contractResult = await this.executeApproveAndPay(
        policyInfo.policyId,
        wallet_addr,
        policyInfo.coverageAmount
      );

      if (!contractResult.success) {
        return {
          success: false,
          message: contractResult.message
        };
      }

      console.log('✅ 청구 처리 완료:', contractResult);
      return {
        success: true,
        transactionHash: contractResult.transactionHash,
        policyId: policyInfo.policyId
      };

    } catch (error) {
      console.error('❌ 청구 처리 실패:', error);
      return {
        success: false,
        message: '청구 처리 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 트랜잭션 유효성 검증
   * 
   * @description 주어진 트랜잭션 해시가 다음 조건을 만족하는지 검증합니다:
   * 1. 트랜잭션이 존재하는가?
   * 2. 트랜잭션이 성공했는가?
   * 3. PolicyCreated 이벤트가 포함되어 있는가?
   * 
   * @param {string} txHash - 검증할 트랜잭션 해시
   * @returns {Promise<Object>} 검증 결과
   * @returns {boolean} isValid - 유효성 여부
   * @returns {string} [message] - 실패 시 에러 메시지
   * 
   * @example
   * const result = await validateTransaction("0xabc123...");
   * if (!result.isValid) {
   *   console.log(result.message); // "트랜잭션을 찾을 수 없습니다."
   * }
   */

  
  async validateTransaction(txHash) {
    const BASE_URL = "https://eth-sepolia.blockscout.com/api"
    //Blockscout API를 사용하여 트랜잭션 정보 조회
    const tx = await fetch(`${BASE_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`)
    .then(r=>r.json());
    //1. 트랜잭션 존재 여부
    if(!tx.result) return { valid: false, reason: "트랜잭션을 찾을 수 없습니다."};

    //2. 트랜잭션이 블록에 포함되었는 지 여부
    if(!tx.result.blockNumber) return ({ valid: false, reason: "처리중인 트랜잭션입니다. 잠시 후 다시 시도해주세요."});

    // 3. 성공 여부
    const receipt = await fetch(`${BASE_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`)
      .then(r => r.json());

    if (!receipt.result) return { valid: false, reason: '트랜잭션을 찾지 못함' };
    if (receipt.result.status !== '0x1') return { valid: false, reason: '실패한 트랜잭션' };

    return { valid: true, blockNumber: parseInt(receipt.result.blockNumber, 16) };
  }
    // try {
    //   const web3 = web3Client.getWeb3();
    //   const receipt = await web3.eth.getTransactionReceipt(txHash);
      
    //   if (!receipt) {
    //     return {
    //       isValid: false,
    //       message: '트랜잭션을 찾을 수 없습니다.'
    //     };
    //   }

    //   if (!receipt.status) {
    //     return {
    //       isValid: false,
    //       message: '실패한 트랜잭션입니다.'
    //     };
    //   }

      // PolicyCreated 이벤트가 있는지 확인
      // 이벤트 시그니처: PolicyCreated(uint256 indexed policyId, address indexed holder, uint256 indexed productId, uint256 premiumPaid, uint256 coverageAmount)
    //   const policyCreatedEvent = receipt.logs.find(log => 
    //     log.topics[0] === web3.utils.keccak256('PolicyCreated(uint256,address,uint256,uint256,uint256)')
    //   );

    //   if (!policyCreatedEvent) {
    //     return {
    //       isValid: false,
    //       message: '보험 가입 트랜잭션이 아닙니다.'
    //     };
    //   }

    //   return { isValid: true };
    // } catch (error) {
    //   console.error('트랜잭션 검증 실패:', error);
    //   return {
    //     isValid: false,
    //     message: '트랜잭션 검증 중 오류가 발생했습니다.'
    //   };
    // }
  

  /**
   * NFT 소유권 검증 (선택사항)
   * 
   * @description ERC721 표준의 ownerOf 함수를 호출하여 NFT 소유권을 확인합니다.
   * 이 검증은 선택사항으로, nft_addr과 nft_id가 제공된 경우에만 실행됩니다.
   * 
   * @param {string} walletAddr - 확인할 지갑 주소
   * @param {string} nftAddr - NFT 컨트랙트 주소
   * @param {number} nftId - NFT 토큰 ID
   * @returns {Promise<Object>} 검증 결과
   * @returns {boolean} isValid - 소유권 유효성 여부
   * @returns {string} [message] - 실패 시 에러 메시지
   * 
   * @example
   * const result = await validateNFTOwnership(
   *   "0x742d35...", "0xdef5678...", 123
   * );
   */
  async validateNFTOwnership(walletAddr, nftAddr, nftId) {
    try {
      const web3 = web3Client.getWeb3();
      
      // ERC721 표준 ownerOf 함수 ABI 정의
      const erc721ABI = [
        {
          "inputs": [{"name": "tokenId", "type": "uint256"}],
          "name": "ownerOf",
          "outputs": [{"name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      // NFT 컨트랙트 인스턴스 생성 및 소유자 조회
      const nftContract = new web3.eth.Contract(erc721ABI, nftAddr);
      const owner = await nftContract.methods.ownerOf(nftId).call();

      // 대소문자 구분 없이 주소 비교
      if (owner.toLowerCase() !== walletAddr.toLowerCase()) {
        return {
          isValid: false,
          message: 'NFT 소유권이 확인되지 않습니다.'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('NFT 소유권 검증 실패:', error);
      return {
        isValid: false,
        message: 'NFT 소유권 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 트랜잭션에서 정책 정보 추출
   * 
   * @description 트랜잭션 로그에서 PolicyCreated 이벤트를 찾아 정책 정보를 파싱합니다.
   * Solidity 이벤트의 indexed/non-indexed 파라미터를 구분하여 처리합니다.
   * 
   * @param {string} txHash - 정책 정보를 추출할 트랜잭션 해시
   * @returns {Promise<Object|null>} 정책 정보 또는 null
   * @returns {number} policyId - 정책 ID
   * @returns {string} holder - 정책 보유자 주소
   * @returns {number} productId - 상품 ID
   * @returns {string} premiumPaid - 지불된 보험료 (Wei 단위)
   * @returns {string} coverageAmount - 보장 금액 (Wei 단위)
   * 
   * @example
   * const policyInfo = await extractPolicyFromTx("0xabc123...");
   * if (policyInfo) {
   *   console.log(`정책 ID: ${policyInfo.policyId}`);
   *   console.log(`보장 금액: ${policyInfo.coverageAmount} Wei`);
   * }
   */
  async extractPolicyFromTx(txHash) {
    try {
      const web3 = web3Client.getWeb3();
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      
      // PolicyCreated 이벤트 시그니처 생성 및 로그에서 이벤트 찾기
      // 이벤트 구조: PolicyCreated(uint256 indexed policyId, address indexed holder, uint256 indexed productId, uint256 premiumPaid, uint256 coverageAmount)
      const eventSignature = web3.utils.keccak256('PolicyCreated(uint256,address,uint256,uint256,uint256)');
      const policyCreatedEvent = receipt.logs.find(log => log.topics[0] === eventSignature);

      if (policyCreatedEvent) {
        // indexed 파라미터들 (topics 배열에서 추출)
        // topics[0]: 이벤트 시그니처, topics[1~3]: indexed 파라미터들
        const policyId = web3.utils.hexToNumber(policyCreatedEvent.topics[1]);
        const holder = '0x' + policyCreatedEvent.topics[2].slice(26); // address는 32바이트에서 뒤 20바이트만 사용
        const productId = web3.utils.hexToNumber(policyCreatedEvent.topics[3]);
        
        // non-indexed 파라미터들 (data 필드에서 ABI 디코딩)
        // premiumPaid, coverageAmount는 indexed가 아니므로 data에서 추출
        const decodedData = web3.eth.abi.decodeParameters(
          ['uint256', 'uint256'], // [premiumPaid, coverageAmount]
          policyCreatedEvent.data
        );

        return {
          policyId: policyId,
          holder: holder,
          productId: productId,
          premiumPaid: decodedData[0],    // Wei 단위 (BigNumber 문자열)
          coverageAmount: decodedData[1]  // Wei 단위 (BigNumber 문자열)
        };
      }

      return null;
    } catch (error) {
      console.error('정책 정보 추출 실패:', error);
      return null;
    }
  }

  /**
   * Payout 컨트랙트 실행 - 승인 및 지급
   * 
   * @description Payout.approveAndPay() 함수를 호출하여 보험금 승인 및 지급을 실행합니다.
   * 이 함수는 내부적으로 Treasury.payOut()을 호출하여 실제 ETH 전송을 수행합니다.
   * 
   * @param {number} policyId - 정책 ID
   * @param {string} beneficiary - 수혜자 주소
   * @param {string|number} amount - 지급 금액 (Wei 단위)
   * @returns {Promise<Object>} 실행 결과
   * @returns {boolean} success - 성공 여부
   * @returns {string} [transactionHash] - 성공 시 트랜잭션 해시
   * @returns {string} message - 결과 메시지
   * @returns {string} [originalError] - 실패 시 원본 에러 메시지
   * 
   * @example
   * const result = await executeApproveAndPay(123, "0x742d35...", "1000000000000000000");
   * if (result.success) {
   *   console.log(`지급 완료: ${result.transactionHash}`);
   * }
   */
  async executeApproveAndPay(policyId, beneficiary, amount) {
    try {
      // Payout 컨트랙트 인스턴스 확인
      if (!this.payoutContract) {
        throw new Error('Payout 컨트랙트가 초기화되지 않았습니다.');
      }

      const web3 = web3Client.getWeb3();

      // Payout.approveAndPay() 함수 호출을 위한 트랜잭션 데이터 생성
      const transaction = {
        to: this.payoutContract.options.address,
        data: this.payoutContract.methods.approveAndPay(
          policyId,
          beneficiary,
          amount  // Wei 단위 (문자열 또는 숫자)
        ).encodeABI()
      };

      console.log('💰 Payout.approveAndPay() 실행 중...', { policyId, beneficiary, amount });
      const result = await web3Client.sendTransaction(transaction);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: '청구 승인 및 지급 완료'
      };

    } catch (error) {
      console.error('컨트랙트 실행 실패:', error);
      
      // 컨트랙트 에러 메시지를 사용자 친화적 메시지로 파싱
      const errorMessage = this.parseContractError(error);
      
      return {
        success: false,
        message: errorMessage,
        originalError: error.message
      };
    }
  }

  /**
   * 컨트랙트 에러 메시지 파싱
   * 
   * @description Web3.js에서 발생하는 컨트랙트 에러를 분석하여
   * 사용자가 이해하기 쉬운 한국어 메시지로 변환합니다.
   * 
   * @param {Error} error - Web3.js에서 발생한 에러 객체
   * @returns {string} 파싱된 사용자 친화적 에러 메시지
   * 
   * @example
   * try {
   *   await contract.methods.someFunction().send();
   * } catch (error) {
   *   const message = parseContractError(error);
   *   console.log(message); // "잘못된 주소입니다."
   * }
   */
  parseContractError(error) {
    const errorMsg = error.message || error.toString();
    
    // Solidity revert 메시지 및 Web3.js 에러 패턴 매칭
    if (errorMsg.includes('ZeroAddress')) {
      return '잘못된 주소입니다.';
    }
    if (errorMsg.includes('InvalidAmount')) {
      return '잘못된 금액입니다.';
    }
    if (errorMsg.includes('NotAuthorized')) {
      return '권한이 없습니다.';
    }
    if (errorMsg.includes('NotActive')) {
      return '활성 상태가 아닌 정책입니다.';
    }
    if (errorMsg.includes('AlreadyPaid')) {
      return '이미 지급된 정책입니다.';
    }
    if (errorMsg.includes('EnforcedPause')) {
      return '컨트랙트가 일시정지 상태입니다.';
    }
    if (errorMsg.includes('insufficient funds')) {
      return 'Treasury 잔액이 부족합니다.';
    }
    if (errorMsg.includes('gas')) {
      return '가스 한도를 초과했습니다.';
    }
    if (errorMsg.includes('revert')) {
      return '트랜잭션이 되돌려졌습니다.';
    }
    
    // 매칭되는 패턴이 없는 경우 기본 에러 메시지 반환
    return '컨트랙트 실행 중 오류가 발생했습니다.';
  }
}


/**
 * ClaimService 싱글톤 인스턴스
 * @description 애플리케이션 전체에서 하나의 ClaimService 인스턴스를 공유합니다.
 * 이를 통해 Payout 컨트랙트 연결을 재사용하고 메모리를 절약합니다.
 */
const claimService = new ClaimService();

export default claimService;
