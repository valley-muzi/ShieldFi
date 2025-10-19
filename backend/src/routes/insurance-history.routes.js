import express from 'express';
import { InsuranceHistoryController } from '../controllers/insurance-history.controller.js';

// Express 라우터 인스턴스 생성
const router = express.Router();

/**
 * Insurance History Routes
 * 
 * 보험 가입 이력 관련 API 엔드포인트를 정의하는 라우터입니다.
 * 모든 라우트는 '/api/insurance-history' 접두사를 가지며, Express 앱에서 이 라우터를
 * '/api/insurance-history' 경로에 마운트하여 사용합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * GET /api/insurance-history
 * 
 * 사용자의 보험 가입 이력을 조회하는 엔드포인트입니다.
 * Blockscout API를 통해 온체인에서 최초 가입 사실을 스캔하고,
 * 데이터베이스에서 상품 정보를 조회하여 통합된 보험 이력을 반환합니다.
 * 
 * @route GET /api/insurance-history
 * @access Public
 * @param {string} wallet_addr - 사용자 지갑 주소 (쿼리 파라미터)
 * @param {string} nft_addr - NFT 컨트랙트 주소 (쿼리 파라미터)
 * @controller InsuranceHistoryController.getInsuranceHistory
 */
router.get('/', InsuranceHistoryController.getInsuranceHistory);

// 라우터 모듈 내보내기
export default router;
