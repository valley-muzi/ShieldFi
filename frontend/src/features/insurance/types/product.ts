export interface ProductCoverage {
  min: string;
  max: string;
}

export interface Product {
  id: number;
  name: string;
  tier: "BASIC" | "PREMIUM" | "ULTIMATE";
  description: string;
  coverage: ProductCoverage;
  premiumRate: number;
  features?: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsApiResponse {
  status: string;
  message: string;
  data: Product[];
  responseTime: string;
}

export interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  coverage: string;
  premium: string;
  features: string[];
  color: string;
}
