import { CARDINALS, JEDEN } from './pl.consts.js';
import { pronominalForm } from './pronominalForm.js';
import type { Agr, Case } from './pl.types.js';

/**
 * A cardinal numeral and the case it puts its noun in (C31, only as far as the plan counts; P05 puts
 * numeral government out of scope beyond this). *jeden* agrees as an adjective. 2–4 stand over a
 * nominative plural (*dwa koty, dwie myszy*); 5 and up over a genitive plural (*pięć kotów*); a virile
 * noun takes the virile form over a genitive plural whatever the number (*dwóch chłopców*). In the
 * oblique cases the numeral declines and the noun keeps the slot's case (*z dwoma kotami*). A number
 * the table lacks is written in digits.
 */
export function cardinalPl(value: number, kase: Case, agr: Agr): { word: string; nounCase: Case } {
  if (value === 1) return { word: pronominalForm(JEDEN, kase, agr), nounCase: kase };
  const c = CARDINALS[value];
  const k = kase === 'voc' ? 'nom' : kase;
  if (!c) return { word: String(value), nounCase: k };
  const fem = agr.gender === 'fem';
  if (k === 'nom' || k === 'acc') {
    if (agr.virile) return { word: c.virile, nounCase: 'gen' };
    return { word: fem && c.fem ? c.fem : c.nom, nounCase: c.small ? k : 'gen' };
  }
  const word = k === 'dat' ? c.dat : k === 'ins' ? (fem && c.femIns ? c.femIns : c.ins) : c.oblique;
  return { word, nounCase: k };
}
