import { joinConjuncts, type ResolvedNounElement, type ResolvedNounPhrase } from '../../types.js';
import { COORD_WORDS } from './en.consts.js';

/**
 * Render every conjunct of a noun slot and join them the way English coordinates: commas between
 * all but the last pair, the conjunction word on the last ("Peter, Paul and Mary"). A slot holding
 * one phrase is just that phrase.
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  return joinConjuncts(el.conjuncts.map(render), ', ', () => ` ${COORD_WORDS[el.conjunction ?? 'and']} `);
}
