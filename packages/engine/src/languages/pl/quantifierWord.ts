import { QUANTIFIERS, WIEKSZOSC } from './pl.consts.js';
import type { Agr, Case } from './pl.types.js';

/**
 * A quantifier that governs the genitive (P05 §0.4), and the case it puts its noun in. In the
 * nominative and accusative the word stands before a genitive (*kilka kotów*, virile *kilku
 * chłopców*, *trochę wody*); in the other cases it declines and the noun keeps the slot's case (*z
 * kilkoma kotami*, *do kilku domów*). *większość* (most) is a noun, declined, over a genitive in every
 * case. `undefined` for a determiner that is no such quantifier.
 */
export function quantifierWord(definiteness: string | undefined, kase: Case, agr: Agr, mass: boolean): { word: string; nounCase: Case } | undefined {
  const c = kase === 'voc' ? 'nom' : kase;
  if (definiteness === 'most') return { word: WIEKSZOSC[c], nounCase: 'gen' };
  const q = definiteness ? QUANTIFIERS[definiteness] : undefined;
  if (!q) return undefined;
  if (mass) return { word: q.mass, nounCase: 'gen' };
  if (c === 'nom' || c === 'acc') return { word: agr.virile ? q.virile : q.nom, nounCase: 'gen' };
  return { word: c === 'ins' ? q.ins : q.oblique, nounCase: c };
}
