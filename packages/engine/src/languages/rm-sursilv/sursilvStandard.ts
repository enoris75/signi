import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { SURSILV_DOMAIN, SURSILV_STANDARD } from './sursilv.consts.js';
import { sursilvPossessedHeadForms } from './sursilvPossessedHeadForms.js';
import { npText } from './npText.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { withChe } from './withChe.js';

/**
 * The standard of comparison after a compared adjective `adj`, or '' where it has none (P09-E5, P04
 * §2.1). The comparatives take *che* ("pli grond ch'il tgaun", eliding before a vowel), the equative
 * *sco* ("aschi grond sco il tgaun"); neither contracts with the article, so each leads the whole
 * group: "pli grond ch'il tgaun e l'um". A pronoun takes its tonic form: "pli grond che mai".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19), under *da*,
 * which contracts with each conjunct's article: "il pli grond dils animals", "da nus".
 */
export function sursilvStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  const domain = adj.forms['domain'] === '1';
  const word = domain ? SURSILV_DOMAIN : SURSILV_STANDARD[adjDegree(adj)];
  if (!standard || !word) return '';
  if (!domain) return withChe(word, coordinate(standard, (s) => tonicPronoun(s) ?? npText(s)));
  return coordinate(standard, (s) => {
    const tonic = tonicPronoun(s);
    if (tonic !== undefined) return `da ${tonic}`;
    const forms = sursilvPossessedHeadForms(s);
    return renderNP(s, (plural, lead) => prepDet('da', forms, plural, lead));
  });
}
