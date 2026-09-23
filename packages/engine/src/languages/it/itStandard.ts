import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { IT_DOMAIN, IT_STANDARD } from './it.consts.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { npText } from './npText.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * The standard of comparison after a compared adjective `adj`, or '' where it has none (P09-E5).
 *
 * The comparatives take "di", which fuses with each conjunct's article the way a complement's
 * preposition does — "più grande del cane", "dello zio", "dell'uomo", "dei cani" — and is therefore
 * repeated per conjunct: "più grande del cane e dell'uomo" (D4). The equative's "quanto" is a
 * conjunction and fuses with nothing, so it leads the whole group: "tanto grande quanto il cane e
 * l'uomo". A pronoun takes its tonic form after either: "di lui", "quanto me".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19), which takes
 * the same fused "di" (`IT_DOMAIN`): "il più grande degli animali", "della famiglia", "di noi".
 *
 * `adj` is the predicate adjective or an attributive one (P09-E18): "un gatto più grande del cane".
 */
export function itStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  const word = adj.forms['domain'] === '1' ? IT_DOMAIN : IT_STANDARD[adjDegree(adj)];
  if (!standard || !word) return '';
  if (word === 'quanto') return `quanto ${coordinate(standard, (s) => tonicPronoun(s) ?? npText(s))}`;
  return coordinate(standard, (s) => {
    const tonic = tonicPronoun(s);
    if (tonic !== undefined) return `di ${tonic}`;
    const forms = itPossessedHeadForms(s);
    return renderNP(s, (plural, lead) => prepDet('di', forms, plural, lead));
  });
}
