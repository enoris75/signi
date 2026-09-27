import { useCallback, useState } from 'react';
import type { LanguageCode } from '@signi/shared';
import { LANGUAGE_CODES } from '@signi/shared';

const STORAGE_KEY = 'signi:translationLanguageOrder';

/**
 * The saved order made whole again: unknown or repeated codes are dropped, and any language the
 * saved order lacks (one added since it was saved) keeps its place after the others, in row order.
 */
export function normalizeLanguageOrder(saved: unknown): LanguageCode[] {
  const known = Array.isArray(saved)
    ? saved.filter((code, i): code is LanguageCode =>
        (LANGUAGE_CODES as unknown[]).includes(code) && saved.indexOf(code) === i)
    : [];
  return [...known, ...LANGUAGE_CODES.filter((code) => !known.includes(code))];
}

function readStored(): LanguageCode[] {
  try {
    return normalizeLanguageOrder(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'));
  } catch {
    return [...LANGUAGE_CODES];
  }
}

/**
 * The order the translations panel lists its languages in, as the reader arranged it, remembered in
 * this browser. `move(language, delta)` shifts one row up (-1) or down (+1); a move past either end
 * does nothing.
 */
export function useLanguageOrder(): [LanguageCode[], (language: LanguageCode, delta: number) => void] {
  const [order, setOrder] = useState<LanguageCode[]>(readStored);

  const move = useCallback((language: LanguageCode, delta: number) => {
    setOrder((current) => {
      const from = current.indexOf(language);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      next.splice(from, 1);
      next.splice(to, 0, language);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable (private mode, quota) — the order lasts for this visit only
      }
      return next;
    });
  }, []);

  return [order, move];
}
