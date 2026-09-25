import type { EsAdjectives } from './es.types.js';

/**
 * The forms an article is chosen from, once the noun's adjectives are known. Two things change:
 *
 * - A place name that goes bare on its own ("Europa", "Asia") takes the definite article once an
 *   adjective modifies it: "la Europa afilada", "en la Europa afilada", "la primera Europa" (A172).
 *   The forms then mark the name inherently articled (`takes_article`), so `artFor`, `dePrep`,
 *   `datPrep` and `prepDet` give it the article and fuse it as they do for "la Antártida". A
 *   pronominal possessive needs no guard: `possessedHeadForms` has already dropped `proper`, so the
 *   possessive keeps the slot ("tu Europa afilada"). German's `articledNameForms` is the counterpart.
 * - The stressed-a exception ("el agua", "el Asia grande") exists only to break the a-a hiatus
 *   between article and noun, so it lapses as soon as a prenominal adjective comes between them:
 *   "la primera agua", not "*el primera agua".
 */
export function artForms(forms: Record<string, string>, adj?: EsAdjectives): Record<string, string> {
  const bareName = forms['proper'] === '1' && forms['takes_article'] !== '1';
  const articled = bareName && !!(adj?.pre || adj?.post || adj?.trail);
  if (!articled && !adj?.pre) return forms;
  const out = { ...forms };
  if (articled) out['takes_article'] = '1';
  if (adj?.pre) out['stressed_a'] = '';
  return out;
}
