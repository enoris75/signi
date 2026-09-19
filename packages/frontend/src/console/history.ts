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
