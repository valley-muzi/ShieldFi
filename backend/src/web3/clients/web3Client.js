/**
 * @fileoverview Web3 클라이언트
 * @description Web3 인스턴스 관리 및 트랜잭션 전송을 담당하는 클라이언트
 * @author ShieldFi Team
 * @version 1.0.0
 */

import Web3 from 'web3';
import { env } from '../../config/env.js';

/**
 * Web3 클라이언트 클래스
 * 
 * @description Web3 연결, 계정 관리, 트랜잭션 전송을 담당합니다.
 * 환경변수에서 RPC URL과 개인키를 읽어와 초기화합니다.
 */
class Web3Client {
  constructor() {
    /** @type {Web3|null} Web3 인스턴스 */
    this.web3 = null;
    /** @type {Object|null} 계정 객체 */
    this.account = null;
    this.init();
  }

  /**
   * Web3 클라이언트 초기화
   * @description RPC URL과 개인키를 사용하여 Web3 인스턴스와 계정을 설정합니다.
   * @private
   */
  init() {
    try {
      // RPC URL 확인
      if (!env.RPC_URL) {
        console.warn('RPC_URL 환경변수가 설정되지 않았습니다.');
        return;
      }

      // Web3 인스턴스 생성
      this.web3 = new Web3(env.RPC_URL);
      console.log('Web3 연결 완료:', env.RPC_URL);

      // 계정 설정 (개인키가 있는 경우)
      if (env.WALLET_PK) {
        this.account = this.web3.eth.accounts.privateKeyToAccount(env.WALLET_PK);
        this.web3.eth.accounts.wallet.add(this.account);
        console.log('계정 설정 완료:', this.account.address);
      } else {
        console.warn('WALLET_PK 환경변수가 설정되지 않았습니다.');
      }

    } catch (error) {
      console.error('Web3 클라이언트 초기화 실패:', error);
    }
  }

  /**
   * Web3 인스턴스 반환
   * @returns {Web3|null} Web3 인스턴스
   */
  getWeb3() {
    return this.web3;
  }

  /**
   * 계정 정보 반환
   * @returns {Object|null} 계정 객체
   */
  getAccount() {
    return this.account;
  }

  /**
   * 컨트랙트 인스턴스 생성
   * @param {Array} abi - 컨트랙트 ABI
   * @param {string} address - 컨트랙트 주소
   * @returns {Object} 컨트랙트 인스턴스
   */
  createContract(abi, address) {
    if (!this.web3) {
      throw new Error('Web3가 초기화되지 않았습니다.');
    }
    return new this.web3.eth.Contract(abi, address);
  }

  /**
   * 트랜잭션 전송
   * @param {Object} transaction - 트랜잭션 객체
   * @param {string} transaction.to - 수신자 주소
   * @param {string} transaction.data - 트랜잭션 데이터
   * @param {string} [transaction.value] - 전송할 ETH 양 (Wei)
   * @returns {Promise<Object>} 트랜잭션 결과
   */
  async sendTransaction(transaction) {
    if (!this.web3 || !this.account) {
      throw new Error('Web3 또는 계정이 초기화되지 않았습니다.');
    }

    try {
      // 가스 추정
      const gasEstimate = await this.web3.eth.estimateGas({
        from: this.account.address,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0'
      });

      // 가스 가격 조회
      const gasPrice = await this.web3.eth.getGasPrice();

      // 트랜잭션 객체 구성
      const txObject = {
        from: this.account.address,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0',
        gas: Math.floor(Number(gasEstimate) * 1.2), // 20% 여유분
        gasPrice: gasPrice
      };

      // 트랜잭션 전송
      const result = await this.web3.eth.sendTransaction(txObject);
      
      console.log('트랜잭션 전송 완료:', result.transactionHash);
      return result;

    } catch (error) {
      console.error('트랜잭션 전송 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
const web3Client = new Web3Client();

export default web3Client;
