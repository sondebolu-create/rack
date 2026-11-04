export type CardSummary = { brand: string; last4: string };

export type CardFields = { name: string; number: string; expiry: string; cvv: string };
export type CardErrors = Partial<Record<keyof CardFields, string>>;

export const digitsOnly = (s: string) => s.replace(/\D/g, '');

/** "5061234567891234" -> "5061 2345 6789 1234". */
export function formatCardNumber(raw: string): string {
  return digitsOnly(raw).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}

/** "0924" -> "09/24". */
export function formatExpiry(raw: string): string {
  const d = digitsOnly(raw).slice(0, 6);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function cardBrand(number: string): string {
  const d = digitsOnly(number);
  if (/^4/.test(d)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
  if (/^(506|650)/.test(d)) return 'Verve';
  return 'Card';
}

/** Accepts MM/YY or MM/YYYY and says whether it is still in date. */
function expiryProblem(expiry: string, now = new Date()): string | null {
  const m = /^(\d{2})\/(\d{2}|\d{4})$/.exec(expiry);
  if (!m) return 'Enter the expiry as MM/YY';
  const month = Number(m[1]);
  const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  if (month < 1 || month > 12) return 'Enter a valid month';
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return 'This card has expired';
  }
  return null;
}

/** Format checks only. Paystack does the real validation later. */
export function validateCard(f: CardFields): CardErrors {
  const errors: CardErrors = {};
  if (f.name.trim().length < 2) errors.name = 'Enter the name on the card';
  const n = digitsOnly(f.number);
  if (n.length < 16 || n.length > 19) errors.number = 'Enter the 16-digit card number';
  const e = expiryProblem(f.expiry);
  if (e) errors.expiry = e;
  if (!/^\d{3,4}$/.test(f.cvv)) errors.cvv = 'Enter the 3 or 4 digit CVV';
  return errors;
}

export function summariseCard(f: CardFields): CardSummary {
  return { brand: cardBrand(f.number), last4: digitsOnly(f.number).slice(-4) };
}
