// display currency context.
//
// the value lives in localStorage so it persists across visits, but we
// expose it through context so subscribed components re-render the
// instant a visitor flips the switcher in the header.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getStoredCurrency, setStoredCurrency, formatPrice } from "./currency";

const CurrencyContext = createContext({ currency: "USD", setCurrency: () => {}, format: () => "" });

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => getStoredCurrency());

  useEffect(() => {
    const sync = () => setCurrencyState(getStoredCurrency());
    window.addEventListener("currency-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("currency-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setCurrency = useCallback((code) => {
    setStoredCurrency(code);
    setCurrencyState(code);
  }, []);

  const format = useCallback((amountUsd) => formatPrice(amountUsd, currency), [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
