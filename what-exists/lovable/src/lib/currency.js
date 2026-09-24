// display-only currency conversion.
//
// every price in the database is stored in usd. this module converts
// numbers to whatever display currency the visitor has picked (kept in
// localStorage under "display_currency"). there is no checkout-side
// conversion - payments still settle in usd. the goal is to give
// international collectors a familiar number on the page, not to act
// as a real fx engine.
//
// rates are static so the page never needs a network call. they are
// rough (updated by hand, see roadmap.md "currency rates") and will
// drift over time. that tradeoff is acceptable for a demo experience.

export const CURRENCIES = [
  { code: "USD", symbol: "$",  label: "us dollar" },
  { code: "EUR", symbol: "€",  label: "euro" },
  { code: "GBP", symbol: "£",  label: "british pound" },
  { code: "CAD", symbol: "C$", label: "canadian dollar" },
  { code: "AUD", symbol: "A$", label: "australian dollar" },
  { code: "JPY", symbol: "¥",  label: "japanese yen" },
  { code: "CHF", symbol: "Fr", label: "swiss franc" },
  { code: "SEK", symbol: "kr", label: "swedish krona" },
  { code: "NOK", symbol: "kr", label: "norwegian krone" },
  { code: "DKK", symbol: "kr", label: "danish krone" },
];

// 1 usd = X foreign units (rough static rates).
export const USD_RATES = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 156,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.7,
  DKK: 6.9,
};

export const STORAGE_KEY = "display_currency";

export function getStoredCurrency() {
  if (typeof window === "undefined") return "USD";
  return localStorage.getItem(STORAGE_KEY) || "USD";
}

export function setStoredCurrency(code) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, code);
  window.dispatchEvent(new Event("currency-changed"));
}

export function convertFromUsd(amountUsd, code) {
  const rate = USD_RATES[code] ?? 1;
  return Number(amountUsd) * rate;
}

export function formatPrice(amountUsd, code = "USD") {
  if (amountUsd == null || isNaN(amountUsd)) return "";
  const meta = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  const value = convertFromUsd(amountUsd, code);
  // jpy is whole-number; everything else gets two decimals
  const fractionDigits = code === "JPY" ? 0 : 2;
  const rounded = value.toFixed(fractionDigits);
  return `${meta.symbol}${Number(rounded).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}
