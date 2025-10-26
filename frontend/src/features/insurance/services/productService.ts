import { Product, ProductsApiResponse } from '../types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API 엔드포인트를 찾을 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        } else if (response.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`HTTP 오류: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data: ProductsApiResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.message || '상품 데이터를 가져오는데 실패했습니다.');
      }
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('상품 데이터 형식이 올바르지 않습니다.');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // 네트워크 오류 처리
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요. API 서버가 실행 중인지 확인해주세요.');
      }
      
      throw error;
    }
  }
}
