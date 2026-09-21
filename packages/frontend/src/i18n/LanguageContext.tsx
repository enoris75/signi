import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LanguageCode } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';

const STORAGE_KEY = 'signi:uiLanguage';
const DEFAULT_LANGUAGE: LanguageCode = 'en';

function readStored(): LanguageCode {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && saved in LANGUAGES ? (saved as LanguageCode) : DEFAULT_LANGUAGE;
}

interface LanguageContextValue {
  uiLanguage: LanguageCode;
  setUiLanguage: (next: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Holds the chosen UI language (persisted). For now it drives only the engine-generated
// payoff in the header; other UI strings can read it as they get localized.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [uiLanguage, setLanguage] = useState<LanguageCode>(readStored);

  const setUiLanguage = useCallback((next: LanguageCode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLanguage(next);
  }, []);

  // The page says which language it is in, so a screen reader reads it with that language's voice, and
  // the browser picks that language's glyph forms where no font names them (else a Japanese kanji can
  // come out in its Chinese form). index.html's `en` is only the default until this first runs.
  useEffect(() => {
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);

  const value = useMemo(() => ({ uiLanguage, setUiLanguage }), [uiLanguage, setUiLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useUiLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useUiLanguage must be used within a LanguageProvider');
  return ctx;
}
