import { CurrencyConfig } from '@/types';

/**
 * Format price according to selected currency configuration
 */
export const formatPrice = (priceINR: number, currency: CurrencyConfig): string => {
  if (currency.code === 'INR') {
    return `₹${priceINR.toLocaleString('en-IN')}`;
  }
  const converted = Math.round(priceINR * currency.rateFromINR);
  return `${currency.symbol}${converted.toLocaleString()}`;
};
