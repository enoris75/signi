import { DAUGUMA, GENITIVE_QUANTIFIERS, SOME_MASS } from './lt.consts.js';
import type { Case } from './lt.types.js';

/**
 * A quantity word that puts its noun in the genitive (P18 §2.1), and that case: *daug kačių*, *mažai
 * kačių*, *pakankamai kačių*, over a mass noun the genitive singular (*daug vandens*, *šiek tiek
 * vandens*). They do not decline, so the noun stays genitive in every slot (*su daug kačių*) (verify:
 * the oblique cases prefer *daugeliu kačių*). *dauguma* (most) is a noun, declined, over a genitive in
 * every case. `undefined` for a determiner that is no such word — `some` over a count noun is the
 * agreeing *keli* (`determinerWord`).
 */
export function quantifierWord(definiteness: string | undefined, kase: Case, mass: boolean): { word: string; nounCase: Case } | undefined {
  const c = kase === 'voc' ? 'nom' : kase;
  if (definiteness === 'most') return { word: DAUGUMA[c], nounCase: 'gen' };
  if (mass && (definiteness === 'some' || definiteness === 'several')) return { word: SOME_MASS, nounCase: 'gen' };
  const word = definiteness ? GENITIVE_QUANTIFIERS[definiteness] : undefined;
  return word ? { word, nounCase: 'gen' } : undefined;
}
