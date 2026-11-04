export type Currency = 'NGN' | 'USD';

const SYMBOLS: Record<Currency, string> = { NGN: '₦', USD: '$' };
const DECIMALS: Record<Currency, number> = { NGN: 0, USD: 2 };

/**
 * Formats an integer amount in minor units (kobo for NGN, cents for USD).
 * NGN is shown without decimals, USD with two.
 */
export function formatPrice(minor: number, currency: Currency = 'NGN'): string {
  const value = minor / 100;
  const sign = value < 0 ? '-' : '';
  const [whole, fraction] = Math.abs(value).toFixed(DECIMALS[currency]).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${SYMBOLS[currency]}${grouped}${fraction ? `.${fraction}` : ''}`;
}

/** "Nov 7, 2026". */
export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "May 10, 9:30 AM". */
export function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
