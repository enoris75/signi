import type { Tense } from '@signi/shared';

/** Conjugate from a person-number key ("3sg") — the shape this engine's callers carry. */
export function conjPn(forms: Record<string, string>, pn: string, tense: Tense): string {
  return forms[`${pn}_${tense}`] ?? forms[tense] ?? forms[`${pn}_present`] ?? forms['base'] ?? '';
}
