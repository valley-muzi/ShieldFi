/**
 * @fileoverview 보험금 청구 요청 컨트롤러
 * @description 사용자의 보험금 청구 요청을 받아 검증 후 스마트 컨트랙트를 실행하는 컨트롤러
 * @author ShieldFi Team
 * @version 1.0.0
 */

import claimService from '../services/claim.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * 보험금 청구 요청 처리 API
 * 
 * @description 사용자가 보험금 청구를 요청하면 다음 단계를 거쳐 처리됩니다:
 * 1. 요청 데이터 검증 (트랜잭션 해시, 지갑 주소 등)
 * 2. 트랜잭션 유효성 검증 (PolicyCreated 이벤트 확인)
 * 3. NFT 소유권 검증 (선택사항)
 * 4. 정책 정보 추출 (이벤트 로그에서)
 * 5. Payout 컨트랙트 실행 (승인 및 지급)
 * 
 * @route POST /api/claims
 * @param {Object} req.body - 청구 요청 데이터
 * @param {string} req.body.tx_hash - 보험 가입 트랜잭션 해시 (필수)
 * @param {string} req.body.wallet_addr - 사용자 지갑 주소 (필수)
 * @param {string} req.body.nft_addr - NFT 컨트랙트 주소 (필수)
 * @param {number} req.body.nft_id - NFT ID (필수)
 * 
 * @returns {Object} 응답 객체
 * @returns {string} status - "ok" | "error"
 * @returns {string} message - 응답 메시지
 * @returns {string} response_time - 응답 시간 (ISO 8601)
 * 
 * @example
 * // 요청 예시
 * POST /api/claims
 * {
 *   "tx_hash": "0xabc1234fae5b0d9b0e9e3f1b9b5e8b9fce3a9d6c4f7c9a6b9a7a2b1c8d9e0f1",
 *   "wallet_addr": "0x742d35Cc6634C0532925a3b8D4C2C4e0C5C2C4e0",
 *   "nft_addr": "0xdef5678...",
 *   "nft_id": 123
 * }
 * 
 * // 성공 응답 (200)
 * {
 *   "status": "ok",
 *   "message": "청구 요청 완료",
 *   "response_time": "2025-10-18T15:42:10.123Z"
 * }
 * 
 * // 검증 실패 (400)
 * {
 *   "status": "error",
 *   "message": "트랜잭션을 찾을 수 없습니다.",
 *   "response_time": "2025-10-18T15:42:10.123Z"
 * }
 * 
 * // 서버 오류 (500)
 * {
 *   "status": "error",
 *   "message": "서버 오류가 발생했습니다.",
 *   "response_time": "2025-10-18T15:42:10.123Z"
 * }
 */
export const submitClaimRequest = asyncHandler(async (req, res) => {
  // 요청 본문에서 필요한 데이터 추출
  const { tx_hash, wallet_addr, nft_addr, nft_id } = req.body;

  // 요청 로깅 (디버깅 및 모니터링 용도)
  console.log('📋 청구 요청 접수:', { tx_hash, wallet_addr, nft_addr, nft_id });

  try {
    // 서비스 레이어에서 검증 및 컨트랙트 실행
    // processClaim()에서 모든 비즈니스 로직을 처리
    const result = await claimService.processClaim({
      tx_hash,
      wallet_addr, 
      nft_addr,
      nft_id
    });

    // 검증 실패 또는 비즈니스 로직 오류 (400 Bad Request)
    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: result.message,
        response_time: new Date().toISOString()
      });
    }

    // 성공 응답 (200 OK)
    res.status(200).json({
      status: "ok",
      message: "청구 요청 완료",
      response_time: new Date().toISOString()
    });

  } catch (error) {
    // 예상치 못한 서버 오류 (500 Internal Server Error)
    console.error('❌ 청구 요청 처리 실패:', error);
    res.status(500).json({
      status: "error", 
      message: "서버 오류가 발생했습니다.",
      response_time: new Date().toISOString()
    });
  }
});