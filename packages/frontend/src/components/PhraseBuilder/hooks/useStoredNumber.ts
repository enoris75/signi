import { useState, type Dispatch, type SetStateAction } from "react";

// A number held in state that starts from the value saved under `key` in localStorage — raised to
// `min` — or `fallback` when nothing is saved. Only the first render reads it; saving is left to the
// caller, which usually saves once a drag ends rather than on every change.
export function useStoredNumber(
  key: string,
  fallback: number,
  min: number = -Infinity,
): [number, Dispatch<SetStateAction<number>>] {
  return useState<number>(() => {
    const saved = localStorage.getItem(key);
    return saved ? Math.max(min, Number(saved)) : fallback;
  });
}
