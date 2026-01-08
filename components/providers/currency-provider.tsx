'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { setDefaultCurrency } from '@/lib/utils';

interface CurrencyContextType {
  currency: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'GHS',
});

interface CurrencyProviderProps {
  children: ReactNode;
  currency:  string;
}

export function CurrencyProvider({ children, currency }: CurrencyProviderProps) {
  useEffect(() => {
    setDefaultCurrency(currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}