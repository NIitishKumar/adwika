export type CategoryType = 
  | 'ALL'
  | 'KURTIS'
  | 'SUITS'
  | 'CO-ORDS'
  | 'SHIRTS'
  | 'SAREES'
  | 'WOMEN'
  | 'OCCASIONWEAR'
  | 'CRAFT & DETAIL'
  | 'MEN';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: CategoryType;
  priceINR: number;
  priceUSD: number;
  image: string;
  secondaryImage?: string;
  description: string;
  craftDetails: string[];
  fabric: string;
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL')[];
  isNew?: boolean;
  featured?: boolean;
  comingSoon?: boolean;
}

export interface CartItem {
  product: Product;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
}

export interface CurrencyConfig {
  code: 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED';
  symbol: string;
  label: string;
  rateFromINR: number; // multiplier from INR
}

export interface RegionOption {
  country: string;
  currency: CurrencyConfig['code'];
  symbol: string;
  label: string;
}
