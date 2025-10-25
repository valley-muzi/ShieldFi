import { pool } from '../config/db.config.js';

/**
 * Product Model
 * 
 * 보험 상품 관련 데이터베이스 작업을 처리하는 모델 클래스입니다.
 * PostgreSQL 데이터베이스와 직접 상호작용하여 상품 정보를 조회, 생성, 수정, 삭제하는
 * 기능을 제공합니다. 모든 메서드는 정적(static) 메서드로 구현되어 있습니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 */
export class ProductModel {
  /**
   * 데이터베이스에서 모든 보험 상품을 조회
   * 
   * PRODUCT 테이블에서 모든 상품 정보를 조회하여 반환합니다.
   * 상품은 등급(tier)과 상품명(product_name) 순으로 정렬되어 반환됩니다.
   * 
   * @returns {Promise<Array>} 상품 객체들의 배열
   * @returns {Array<Object>} 각 상품 객체는 다음 필드를 포함:
   * @returns {number} product_id - 상품 고유 ID
   * @returns {string} product_name - 상품명
   * @returns {string} tier - 상품 등급 (BASIC, PREMIUM, ULTIMATE)
   * @returns {string} product_description - 상품 설명
   * @returns {string} coverage_amount_min - 최소 보장 금액 (Wei 단위, 문자열)
   * @returns {string} coverage_amount_max - 최대 보장 금액 (Wei 단위, 문자열)
   * @returns {string} premium_rate - 보험료율 (Wei 단위, 문자열)
   * @returns {Date} created_at - 생성일시
   * @returns {Date} updated_at - 수정일시
   * 
   * @throws {Error} 데이터베이스 쿼리 실행 실패 시 에러 발생
   * 
   * @example
   * const products = await ProductModel.getAllProducts();
   * // products = [
   * //   {
   * //     product_id: 1,
   * //     product_name: "Basic Shield",
   * //     tier: "BASIC",
   * //     product_description: "기본 보호 보험 상품",
   * //     coverage_amount_min: "1000000000000000000",
   * //     coverage_amount_max: "10000000000000000000",
   * //     premium_rate: "100000000000000000",
   * //     created_at: "2025-01-19T00:00:00.000Z",
   * //     updated_at: "2025-01-19T00:00:00.000Z"
   * //   }
   * // ]
   */
  static async getAllProducts() {
    // 모든 상품 정보를 조회하는 SQL 쿼리
    // 등급별, 상품명별로 정렬하여 일관된 순서로 반환
    const query = `
      SELECT 
        product_id,              -- 상품 고유 ID
        product_name,            -- 상품명
        tier,                    -- 상품 등급
        product_description,     -- 상품 설명
        coverage_amount_min,     -- 최소 보장 금액 (Wei 단위)
        coverage_amount_max,     -- 최대 보장 금액 (Wei 단위)
        premium_rate,            -- 보험료율 (Wei 단위)
        created_at,              -- 생성일시
        updated_at               -- 수정일시
      FROM PRODUCT 
      ORDER BY tier, product_name  -- 등급별, 상품명별 정렬
    `;
    
    try {
      // PostgreSQL 연결 풀을 사용하여 쿼리 실행
      const result = await pool.query(query);
      
      // 쿼리 결과의 행들을 반환
      return result.rows;
    } catch (error) {
      // 에러 로깅 및 에러 재발생
      console.error('[ProductModel.getAllProducts] Error:', error);
      throw new Error('Failed to fetch products');
    }
  }
}
