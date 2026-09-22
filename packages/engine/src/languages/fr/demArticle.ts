import { elidesBefore } from './elidesBefore.js';

/**
 * The demonstrative: "ce" (masc), "cet" before a vowel sound ("cet ami", "cet autre homme" —
 * chosen on `lead`, the word that actually follows), "cette" (fem), "ces" (plural).
 *
 * French neutralises the proximal/distal contrast here — a single series covers both "this"
 * and "that" ("ce livre" is either) — so `this` and `that` both render it. The contrast is forced
 * with the postposed clitics "-ci"/"-là", which are marked and written only where the distance is
 * meant: `deicticClitic` writes them, on a phrase that says so (NounPhrase.contrastive, C40).
 */
export function demArticle(forms: Record<string, string>, plural: boolean, lead: string): string {
  if (plural) return 'ces';
  if ((forms['gender'] ?? 'masc') === 'fem') return 'cette';
  return elidesBefore(forms, lead) ? 'cet' : 'ce';
}
