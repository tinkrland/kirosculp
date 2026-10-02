// Money formatting helper
// All API responses use cents, this converts at the display edge

/**
 * Format cents to currency string
 * @param {number} cents - Amount in cents
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted currency string
 */
export function formatMoney(cents, currency = 'USD', locale = 'en-US') {
  if (cents == null || isNaN(cents)) {
    return '—';
  }

  const dollars = cents / 100;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format cents to currency string without symbol
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted number string
 */
export function formatMoneyPlain(cents) {
  if (cents == null || isNaN(cents)) {
    return '—';
  }

  const dollars = cents / 100;
  return dollars.toFixed(2);
}
