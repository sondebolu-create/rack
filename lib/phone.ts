/** Digits only: "+234 803 123 4567" -> "2348031234567". */
const digitsOf = (raw: string) => raw.replace(/\D/g, '');

/**
 * Nigerian numbers are usually typed as 0803..., sometimes +234803... Returns international digits without the
 * plus ("234803..."), or null when it doesn't look like a phone number.
 */
export function internationalDigits(raw: string): string | null {
  let d = digitsOf(raw);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('234') && d.length === 13) return d;
  if (d.startsWith('0') && d.length === 11) return `234${d.slice(1)}`;
  if (d.length === 10) return `234${d}`; // 803... without the leading zero
  // Some other country's number, already in international form.
  return d.length >= 11 && d.length <= 15 ? d : null;
}

/** A tel: link, or null if the number can't be read. */
export function telUrl(raw: string): string | null {
  const n = internationalDigits(raw);
  return n ? `tel:+${n}` : null;
}

/** A wa.me chat link, optionally with a starting message. Opens WhatsApp on a phone and WhatsApp Web on desktop. */
export function whatsappUrl(raw: string, text?: string): string | null {
  const n = internationalDigits(raw);
  if (!n) return null;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
