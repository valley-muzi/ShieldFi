import { InsuranceHistoryService } from '../services/insurance-history.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Insurance History Controller
 * 
 * 보험 가입 이력 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * 클라이언트의 API 요청을 받아서 서비스 레이어로 전달하고,
 * 서비스에서 처리된 결과를 적절한 HTTP 응답으로 변환하여 반환합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 */
export class InsuranceHistoryController {
  /**
   * GET /api/insurance-history
   * 
   * 사용자의 보험 가입 이력을 조회하는 엔드포인트입니다.
   * Blockscout API를 통해 온체인에서 최초 가입 사실을 스캔하고,
   * 데이터베이스에서 상품 정보를 조회하여 통합된 보험 이력을 반환합니다.
   * 
   * @route GET /api/insurance-history
   * @access Public
   * @param {Object} req - Express 요청 객체
   * @param {Object} req.query - 쿼리 파라미터
   * @param {string} req.query.wallet_addr - 사용자 지갑 주소 (0x...)
   * @param {string} req.query.nft_addr - NFT 컨트랙트 주소 (0x...)
   * @param {Object} res - Express 응답 객체
   * @returns {Object} JSON 응답 객체
   * @returns {string} status - 응답 상태 ("ok")
   * @returns {string} message - 응답 메시지
   * @returns {Array} data - 보험 가입 이력 배열
   * @returns {string} responseTime - 응답 시간 (ISO8601)
   * 
   * @example
   * // 요청
   * GET /api/insurance-history?wallet_addr=0x4B0897b0513fdc7C541B6d9D7E929C4e5364D2dB&nft_addr=0xabc1234fae5b0d9b0e9e3f1b9b5e8b9fce3a9d6c4f7c9a6b9a7a2b1c8d9e0f1
   * 
   * // 응답
   * {
   *   "status": "ok",
   *   "message": "보험 가입 이력 조회 완료",
   *   "data": [
   *     {
   *       "product_id": 100,
   *       "product_name": "DeFi Protocol Hack Insurance",
   *       "product_tier": "Premium",
   *       "description": "DeFi 프로토콜 해킹 피해 발생 시 자산 손실의 최대 50%까지 보장하는 상품입니다.",
   *       "start_date": "2025-10-01T00:00:00Z",
   *       "insurance_status": "ACTIVE",
   *       "is_paid": false,
   *       "coverage_amount_min": 0.1,
   *       "coverage_amount_max": 1.0,
   *       "coverage_amount": 0.5,
   *       "premium_rate": 5,
   *       "premium_paid": 0.1
   *     }
   *   ],
   *   "responseTime": "2025-10-18T06:42:10.123Z"
   * }
   */
  static getInsuranceHistory = asyncHandler(async (req, res) => {
    const { wallet_addr, nft_addr } = req.query;

    // 필수 파라미터 검증
    if (!wallet_addr || !nft_addr) {
      return res.status(400).json({
        status: "error",
        message: "wallet_addr와 nft_addr는 필수 파라미터입니다.",
        data: null,
        responseTime: new Date().toISOString()
      });
    }

    try {
      // 보험 가입 이력 조회 (Blockscout + DB 통합)
      const insuranceHistory = await InsuranceHistoryService.getInsuranceHistory({
        walletAddr: wallet_addr,
        nftAddr: nft_addr
      });

      // 성공 응답 반환 (HTTP 200)
      res.status(200).json({
        status: "ok",
        message: "보험 가입 이력 조회 완료",
        data: insuranceHistory,
        responseTime: new Date().toISOString()
      });
    } catch (error) {
      // 서비스 레이어에서 발생한 에러를 500 에러로 변환
      res.status(500).json({
        status: "error",
        message: "보험 가입 이력 조회 실패",
        error: error.message,
        data: null,
        responseTime: new Date().toISOString()
      });
    }
  });
}
