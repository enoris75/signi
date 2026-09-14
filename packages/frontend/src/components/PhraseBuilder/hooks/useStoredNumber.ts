import { useState, type Dispatch, type SetStateAction } from "react";

// A number held in state that starts from the value saved under `key` in localStorage — raised to
// `min` — or `fallback` when nothing usable is saved (nothing at all, or a value that isn't a finite
// number, which would otherwise size the canvas NaN px). Only the first render reads it; saving is
// left to the caller, which usually saves once a drag ends rather than on every change.
export function useStoredNumber(
  key: string,
  fallback: number,
  min: number = -Infinity,
): [number, Dispatch<SetStateAction<number>>] {
  return useState<number>(() => {
    const saved = localStorage.getItem(key);
    const value = saved ? Number(saved) : NaN;
    return Number.isFinite(value) ? Math.max(min, value) : fallback;
  });
}
