import express from 'express';
import { ProductController } from '../controllers/product.controller.js';

// Express 라우터 인스턴스 생성
const router = express.Router();

/**
 * Product Routes
 * 
 * 보험 상품 관련 API 엔드포인트를 정의하는 라우터입니다.
 * 모든 라우트는 '/api/products' 접두사를 가지며, Express 앱에서 이 라우터를
 * '/api/products' 경로에 마운트하여 사용합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * GET /api/products
 * 
 * 모든 보험 상품 목록을 조회하는 엔드포인트입니다.
 * 인증이 필요하지 않은 공개 API로, 누구나 접근할 수 있습니다.
 * 
 * @route GET /api/products
 * @access Public
 * @controller ProductController.getAllProducts
 */
router.get('/', ProductController.getAllProducts);

// 라우터 모듈 내보내기
export default router;
