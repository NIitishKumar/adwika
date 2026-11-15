import { Product } from '@/types';

// Deprecated mock collection — application uses live backend database API
export const PRODUCTS: Product[] = [];

export const REGIONS = [
  { country: 'India', currency: 'INR' as const, symbol: '₹', label: 'India · INR (₹)' },
  { country: 'United States', currency: 'USD' as const, symbol: '$', label: 'United States · USD ($)' },
  { country: 'United Kingdom', currency: 'GBP' as const, symbol: '£', label: 'United Kingdom · GBP (£)' },
  { country: 'Europe', currency: 'EUR' as const, symbol: '€', label: 'European Union · EUR (€)' },
  { country: 'UAE', currency: 'AED' as const, symbol: 'AED', label: 'United Arab Emirates · AED (د.إ)' },
];

export const CURRENCY_RATES = {
  INR: { code: 'INR' as const, symbol: '₹', rateFromINR: 1, label: 'INR' },
  USD: { code: 'USD' as const, symbol: '$', rateFromINR: 0.012, label: 'USD' },
  GBP: { code: 'GBP' as const, symbol: '£', rateFromINR: 0.0095, label: 'GBP' },
  EUR: { code: 'EUR' as const, symbol: '€', rateFromINR: 0.011, label: 'EUR' },
  AED: { code: 'AED' as const, symbol: 'AED ', rateFromINR: 0.044, label: 'AED' },
};
