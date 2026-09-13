import { elidesBefore } from './elidesBefore.js';

/**
 * The demonstrative: "ce" (masc), "cet" before a vowel sound ("cet ami", "cet autre homme" —
 * chosen on `lead`, the word that actually follows), "cette" (fem), "ces" (plural).
 *
 * French neutralises the proximal/distal contrast here — a single series covers both "this"
 * and "that" ("ce livre" is either — the contrast is only ever forced with the postposed
 * clitics "-ci"/"-là", which are marked and rarely used) — so `this` and `that` both render it.
 */
export function demArticle(forms: Record<string, string>, plural: boolean, lead: string): string {
  if (plural) return 'ces';
  if ((forms['gender'] ?? 'masc') === 'fem') return 'cette';
  return elidesBefore(forms, lead) ? 'cet' : 'ce';
}
