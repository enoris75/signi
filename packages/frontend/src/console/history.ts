/**
 * The lines run from the console, kept per browser so ↑ can bring one back on the next visit.
 * Newest first, the last hundred, a line run twice in a row kept once. Canvas echoes are not kept —
 * only what was typed.
 */

export const HISTORY_KEY = "signi:consoleHistory";
export const HISTORY_DEPTH = 100;

export function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Add a line to a history, newest first. */
export function pushHistory(history: readonly string[], line: string): string[] {
  const text = line.trim();
  if (!text) return [...history];
  const next = history[0] === text ? [...history] : [text, ...history];
  return next.slice(0, HISTORY_DEPTH);
}

export function writeHistory(history: readonly string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage full or blocked: the history lives for the session only.
  }
}

// ── Pinned lines ─────────────────────────────────────────────────────────────
// A line worth keeping: pinned from the transcript or with /pin, it is offered first when the prompt
// is empty and ⇥ asks for a line, and first in the ghost. Kept per browser, most recently pinned
// first; never pushed out by history.

export const PINS_KEY = "signi:consolePins";
export const PINS_DEPTH = 50;

export function readPins(): string[] {
  try {
    const raw = localStorage.getItem(PINS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writePins(pins: readonly string[]): void {
  try {
    localStorage.setItem(PINS_KEY, JSON.stringify(pins));
  } catch {
    // Storage full or blocked: the pins live for the session only.
  }
}

/** Pin a line (first), or unpin it. */
export function setPinned(pins: readonly string[], line: string, pinned: boolean): string[] {
  const text = line.trim();
  const rest = pins.filter((p) => p !== text);
  return pinned && text ? [text, ...rest].slice(0, PINS_DEPTH) : rest;
}
