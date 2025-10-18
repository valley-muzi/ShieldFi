import { ProductService } from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Product Controller
 * 
 * 보험 상품 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * 클라이언트의 API 요청을 받아서 서비스 레이어로 전달하고,
 * 서비스에서 처리된 결과를 적절한 HTTP 응답으로 변환하여 반환합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 */
export class ProductController {
  /**
   * GET /api/products
   * 
   * 모든 보험 상품 목록을 조회하는 엔드포인트입니다.
   * 데이터베이스에서 모든 상품 정보를 가져와서 클라이언트에게 반환합니다.
   * 
   * @route GET /api/products
   * @access Public
   * @returns {Object} JSON 응답 객체
   * @returns {boolean} success - 요청 성공 여부
   * @returns {string} message - 응답 메시지
   * @returns {Array} data - 상품 목록 배열
   * @returns {number} count - 상품 개수
   * 
   * @example
   * // 요청
   * GET /api/products
   * 
   * // 응답
   * {
   *   "success": true,
   *   "message": "Products retrieved successfully",
   *   "data": [
   *     {
   *       "id": 1,
   *       "name": "Basic Shield",
   *       "tier": "BASIC",
   *       "description": "기본 보호 보험 상품",
   *       "coverage": {
   *         "min": "1000000000000000000",
   *         "max": "10000000000000000000"
   *       },
   *       "premiumRate": "100000000000000000",
   *       "createdAt": "2025-01-19T00:00:00.000Z",
   *       "updatedAt": "2025-01-19T00:00:00.000Z"
   *     }
   *   ],
   *   "count": 1
   * }
   */
  static getAllProducts = asyncHandler(async (req, res) => {
    // 서비스 레이어에서 모든 상품 정보를 조회
    const result = await ProductService.getAllProducts();
    
    // 성공 응답 반환 (HTTP 200)
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      ...result // 서비스에서 반환된 데이터와 개수를 그대로 전달
    });
  });
}
