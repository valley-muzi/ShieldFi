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

    // tier에 따른 설명 매핑
    const getDescriptionByTier = (tier: string) => {
      switch (tier) {
        case 'BASIC':
          return 'Basic protection insurance product that provides coverage for small-scale losses.';
        case 'PREMIUM':
          return 'Premium protection insurance product that provides coverage for medium-scale losses.';
        case 'ULTIMATE':
          return 'Ultimate protection insurance product that provides coverage for large-scale losses.';
        default:
          return 'Basic protection insurance product.';
      }
    };

    // tier에 따른 기능 목록
    const getFeaturesByTier = (tier: string) => {
      switch (tier) {
        case 'BASIC':
          return [
            'Basic Protection Features',
            'Small Loss Coverage',
            '24/7 Monitoring',
            'Basic Support'
          ];
        case 'PREMIUM':
          return [
            'Medium Scale Loss Coverage',
            'Advanced Protection Features',
            'Priority Support',
            'Real-time Alerts',
            'Expert Consultation'
          ];
        case 'ULTIMATE':
          return [
            'Large Scale Loss Coverage',
            'Premium Protection Features',
            'VIP Support',
            'Real-time Monitoring',
            'Dedicated Manager',
            'Priority Processing'
          ];
        default:
          return ['Basic Protection Features'];
      }
    };

    return {
      id: `product-${apiProduct.id}`,
      name: apiProduct.name,
      description: getDescriptionByTier(apiProduct.tier),
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
