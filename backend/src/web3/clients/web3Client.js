/**
 * @fileoverview Ethers.js 클라이언트
 * @description Ethers.js 인스턴스 관리 및 트랜잭션 전송을 담당하는 클라이언트
 * @author ShieldFi Team
 * @version 2.0.0
 */

import { ethers } from 'ethers';
import { env } from '../../config/env.js';

/**
 * Ethers.js 클라이언트 클래스
 * 
 * @description Ethers.js를 사용한 블록체인 연결, 지갑 관리, 트랜잭션 전송을 담당합니다.
 * 환경변수에서 RPC URL과 개인키를 읽어와 초기화합니다.
 * 
 * @example
 * // 컨트랙트 인스턴스 생성
 * const contract = web3Client.createContract(abi, address);
 * 
 * // 읽기 전용 함수 호출
 * const result = await contract.getPolicy(policyId);
 * 
 * // 트랜잭션 전송 (상태 변경)
 * const tx = await contract.applyPolicy(productId, coverageAmount, { value: premium });
 */
class EthersClient {
  constructor() {
    /** @type {ethers.Provider|null} Provider 인스턴스 */
    this.provider = null;
    /** @type {ethers.Wallet|null} 지갑 인스턴스 */
    this.wallet = null;
    /** @type {ethers.Signer|null} Signer 인스턴스 */
    this.signer = null;
    this.init();
  }

  /**
   * Ethers.js 클라이언트 초기화
   * @description RPC URL과 개인키를 사용하여 Provider, Wallet, Signer를 설정합니다.
   * @private
   */
  init() {
    try {
      // RPC URL 확인
      if (!env.RPC_URL) {
        console.warn('RPC_URL 환경변수가 설정되지 않았습니다.');
        return;
      }

      // Provider 인스턴스 생성 (블록체인 네트워크 연결)
      this.provider = new ethers.JsonRpcProvider(env.RPC_URL);
      console.log('🌐 Ethers.js Provider 연결 완료:', env.RPC_URL);

      // 지갑 설정 (개인키가 있는 경우)
      if (env.WALLET_PK) {
        // 개인키로 지갑 생성
        this.wallet = new ethers.Wallet(env.WALLET_PK);
        // Provider와 연결하여 Signer 생성 (트랜잭션 서명 가능)
        this.signer = this.wallet.connect(this.provider);
        console.log('🔑 지갑 설정 완료:', this.wallet.address);
      } else {
        console.warn('⚠️  WALLET_PK 환경변수가 설정되지 않았습니다.');
      }

    } catch (error) {
      console.error('❌ Ethers.js 클라이언트 초기화 실패:', error);
    }
  }

  /**
   * Provider 인스턴스 반환
   * @description 블록체인 네트워크 연결을 위한 Provider 반환
   * @returns {ethers.Provider|null} Provider 인스턴스
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Signer 인스턴스 반환
   * @description 트랜잭션 서명을 위한 Signer 반환
   * @returns {ethers.Signer|null} Signer 인스턴스
   */
  getSigner() {
    return this.signer;
  }

  /**
   * 지갑 주소 반환
   * @description 현재 설정된 지갑의 주소 반환
   * @returns {string|null} 지갑 주소
   */
  getAddress() {
    return this.wallet ? this.wallet.address : null;
  }

  /**
   * 컨트랙트 인스턴스 생성
   * @description ABI와 주소를 사용하여 ethers.js Contract 인스턴스를 생성합니다.
   * 
   * @param {Array} abi - 컨트랙트 ABI 배열
   * @param {string} address - 컨트랙트 주소
   * @param {boolean} [needsSigner=false] - Signer가 필요한지 여부 (쓰기 작업용)
   * @returns {ethers.Contract} 컨트랙트 인스턴스
   * 
   * @example
   * // 읽기 전용 컨트랙트 (Provider 사용)
   * const readOnlyContract = createContract(abi, address, false);
   * const policy = await readOnlyContract.getPolicy(policyId);
   * 
   * // 쓰기 가능 컨트랙트 (Signer 사용)
   * const writableContract = createContract(abi, address, true);
   * const tx = await writableContract.applyPolicy(productId, coverage, { value: premium });
   */
  createContract(abi, address, needsSigner = false) {
    if (!this.provider) {
      throw new Error('Provider가 초기화되지 않았습니다.');
    }

    if (needsSigner && !this.signer) {
      throw new Error('Signer가 초기화되지 않았습니다. 트랜잭션 전송을 위해서는 WALLET_PK가 필요합니다.');
    }

    // Signer가 필요한 경우 Signer와 연결, 아니면 Provider와 연결
    const providerOrSigner = needsSigner ? this.signer : this.provider;
    return new ethers.Contract(address, abi, providerOrSigner);
  }

  /**
   * 직접 트랜잭션 전송 (저수준 API)
   * @description 컨트랙트 메서드 호출 대신 직접 트랜잭션을 구성하여 전송합니다.
   * 일반적으로는 컨트랙트 인스턴스의 메서드를 사용하는 것이 권장됩니다.
   * 
   * @param {Object} transaction - 트랜잭션 객체
   * @param {string} transaction.to - 수신자 주소
   * @param {string} [transaction.data] - 트랜잭션 데이터 (컨트랙트 호출 시)
   * @param {string} [transaction.value] - 전송할 ETH 양 (Wei 단위)
   * @returns {Promise<ethers.TransactionResponse>} 트랜잭션 응답 객체
   * 
   * @example
   * // ETH 전송
   * const tx = await sendTransaction({
   *   to: "0x742d35...",
   *   value: ethers.parseEther("1.0")
   * });
   * 
   * // 컨트랙트 호출 (권장하지 않음 - 컨트랙트 인스턴스 사용 권장)
   * const tx = await sendTransaction({
   *   to: contractAddress,
   *   data: encodedFunctionCall
   * });
   */
  async sendTransaction(transaction) {
    if (!this.signer) {
      throw new Error('Signer가 초기화되지 않았습니다. 트랜잭션 전송을 위해서는 WALLET_PK가 필요합니다.');
    }

    try {
      console.log('📤 트랜잭션 전송 시작:', transaction);

      // ethers.js는 자동으로 가스 추정 및 가스 가격을 설정합니다
      const txResponse = await this.signer.sendTransaction(transaction);
      
      console.log('✅ 트랜잭션 전송 완료:', txResponse.hash);
      console.log('⏳ 트랜잭션 확인 대기 중...');

      // 트랜잭션이 블록에 포함될 때까지 대기
      const receipt = await txResponse.wait();
      console.log('🎉 트랜잭션 확인 완료:', receipt.hash);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      };

    } catch (error) {
      console.error('❌ 트랜잭션 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 트랜잭션 대기 및 영수증 반환
   * @description 트랜잭션 해시로 트랜잭션 완료를 대기하고 영수증을 반환합니다.
   * 
   * @param {string} txHash - 트랜잭션 해시
   * @param {number} [confirmations=1] - 필요한 확인 블록 수
   * @returns {Promise<ethers.TransactionReceipt>} 트랜잭션 영수증
   */
  async waitForTransaction(txHash, confirmations = 1) {
    if (!this.provider) {
      throw new Error('Provider가 초기화되지 않았습니다.');
    }

    console.log(`⏳ 트랜잭션 대기 중: ${txHash} (${confirmations} 확인 필요)`);
    const receipt = await this.provider.waitForTransaction(txHash, confirmations);
    console.log('✅ 트랜잭션 확인 완료:', receipt.hash);
    
    return receipt;
  }
}

// 싱글톤 인스턴스
const ethersClient = new EthersClient();

export default ethersClient;

