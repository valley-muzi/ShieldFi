/**
 * @fileoverview 보험금 청구 관련 라우팅
 * @description 보험금 청구 요청 API의 라우팅을 정의합니다.
 * @author ShieldFi Team
 * @version 1.0.0
 */

import express from 'express';
import { submitClaimRequest } from '../controllers/claim.controller.js';

const router = express.Router();

/**
 * 보험금 청구 요청 라우트
 * 
 * @route POST /api/claims
 * @description 사용자가 보험금 청구를 요청하는 엔드포인트
 * @access Public (인증 불필요 - 트랜잭션 해시로 검증)
 * 
 * @body {string} tx_hash - 보험 가입 트랜잭션 해시 (필수)
 * @body {string} wallet_addr - 사용자 지갑 주소 (필수)
 * @body {string} nft_addr - NFT 컨트랙트 주소 (필수)
 * @body {number} nft_id - NFT ID (필수)
 * 
 * @example
 * POST /api/claims
 * Content-Type: application/json
 * 
 * {
 *   "tx_hash": "0xabc1234...",
 *   "wallet_addr": "0x742d35...",
 *   "nft_addr": "0xdef5678...",
 *   "nft_id": 123
 * }
 */
router.post('/', submitClaimRequest);

export default router;