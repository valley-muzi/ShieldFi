import { Product, ProductDisplay } from '../types/product';

export class ProductMapper {
  static mapApiProductToDisplay(apiProduct: Product): ProductDisplay {
    // coverage 값을 포맷팅
    const formatCoverage = (min: string, max: string) => {
      const minValue = parseFloat(min);
      const maxValue = parseFloat(max);
      
      if (maxValue >= 1000000000000000000000) {
        return `Up to $${(maxValue / 1000000000000000000000).toFixed(0)}M`;
      } else if (maxValue >= 1000000000000000000) {
        return `Up to $${(maxValue / 1000000000000000000).toFixed(0)}M`;
      } else {
        return `Up to $${(maxValue / 1000000000000000000).toFixed(1)}M`;
      }
    };

    // premium 계산 (coverage max의 premiumRate%)
    const calculatePremium = (max: string, rate: number) => {
      const maxValue = parseFloat(max);
      const premiumAmount = (maxValue * rate) / 100;
      return `${(premiumAmount / 1000000000000000000).toFixed(1)} ETH/year`;
    };

    // tier에 따른 색상 매핑
    const getColorByTier = (tier: string) => {
      switch (tier) {
        case 'BASIC':
          return 'from-teal-500 to-teal-600';
        case 'PREMIUM':
          return 'from-blue-500 to-blue-600';
        case 'ULTIMATE':
          return 'from-cyan-500 to-cyan-600';
        default:
          return 'from-gray-500 to-gray-600';
      }
    };

    // tier에 따른 기능 목록
    const getFeaturesByTier = (tier: string) => {
      switch (tier) {
        case 'BASIC':
          return [
            '기본 보호 기능',
            '소액 손실 보장',
            '24/7 모니터링',
            '기본 지원'
          ];
        case 'PREMIUM':
          return [
            '중간 규모 손실 보장',
            '고급 보호 기능',
            '우선 지원',
            '실시간 알림',
            '전문가 상담'
          ];
        case 'ULTIMATE':
          return [
            '대규모 손실 보장',
            '최고급 보호 기능',
            'VIP 지원',
            '실시간 모니터링',
            '전담 매니저',
            '우선 처리'
          ];
        default:
          return ['기본 보호 기능'];
      }
    };

    return {
      id: `product-${apiProduct.id}`,
      name: apiProduct.name,
      description: apiProduct.description,
      coverage: formatCoverage(apiProduct.coverage.min, apiProduct.coverage.max),
      premium: calculatePremium(apiProduct.coverage.max, apiProduct.premiumRate),
      features: getFeaturesByTier(apiProduct.tier),
      color: getColorByTier(apiProduct.tier)
    };
  }

  static mapApiProductsToDisplay(apiProducts: Product[]): ProductDisplay[] {
    return apiProducts.map(product => this.mapApiProductToDisplay(product));
  }
}
