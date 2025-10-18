import { ProductModel } from '../models/product.model.js';

/**
 * Product Service
 * 
 * 보험 상품 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 데이터베이스에서 조회한 원시 데이터를 클라이언트가 사용하기 편한 형태로
 * 변환하고, 비즈니스 규칙에 따른 검증 및 처리 로직을 담당합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 */
export class ProductService {
  /**
   * 모든 보험 상품을 조회하고 API 응답 형식으로 변환
   * 
   * 데이터베이스에서 모든 상품 정보를 조회한 후, 클라이언트가 사용하기 편한
   * 형태로 데이터를 변환하여 반환합니다. 각 상품의 보장 금액은 Wei 단위로
   * 저장되어 있지만, 문자열 형태로 반환하여 JavaScript의 정밀도 문제를 방지합니다.
   * 
   * @returns {Promise<Object>} 포맷된 응답 객체
   * @returns {boolean} success - 처리 성공 여부
   * @returns {Array} data - 변환된 상품 목록
   * @returns {number} count - 상품 개수
   * 
   * @throws {Error} 데이터베이스 조회 실패 시 에러 발생
   * 
   * @example
   * const result = await ProductService.getAllProducts();
   * // result = {
   * //   success: true,
   * //   data: [
   * //     {
   * //       id: 1,
   * //       name: "Basic Shield",
   * //       tier: "BASIC",
   * //       description: "기본 보호 보험 상품",
   * //       coverage: { min: "1000000000000000000", max: "10000000000000000000" },
   * //       premiumRate: "100000000000000000",
   * //       createdAt: "2025-01-19T00:00:00.000Z",
   * //       updatedAt: "2025-01-19T00:00:00.000Z"
   * //     }
   * //   ],
   * //   count: 1
   * // }
   */
  static async getAllProducts() {
    try {
      // 데이터베이스에서 모든 상품 정보 조회
      const products = await ProductModel.getAllProducts();
      
      // API 응답을 위한 데이터 포맷팅
      // - 데이터베이스 컬럼명을 클라이언트 친화적인 필드명으로 변환
      // - 보장 금액을 객체 형태로 구조화
      // - Wei 단위의 숫자를 문자열로 변환하여 정밀도 문제 방지
      const formattedProducts = products.map(product => ({
        id: product.product_id,                    // 상품 고유 ID
        name: product.product_name,                // 상품명
        tier: product.tier,                        // 상품 등급 (BASIC, PREMIUM, ULTIMATE)
        description: product.product_description,  // 상품 설명
        coverage: {                                // 보장 금액 정보
          min: product.coverage_amount_min,        // 최소 보장 금액 (Wei 단위, 문자열)
          max: product.coverage_amount_max         // 최대 보장 금액 (Wei 단위, 문자열)
        },
        premiumRate: product.premium_rate,         // 보험료율 (Wei 단위, 문자열)
        createdAt: product.created_at,             // 생성일시
        updatedAt: product.updated_at              // 수정일시
      }));

      // 성공 응답 반환
      return {
        success: true,
        data: formattedProducts,                   // 변환된 상품 목록
        count: formattedProducts.length            // 상품 개수
      };
    } catch (error) {
      // 에러 로깅 및 에러 재발생
      console.error('[ProductService.getAllProducts] Error:', error);
      throw new Error('Failed to retrieve products');
    }
  }
}
