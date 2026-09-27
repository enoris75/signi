import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { RG_DOMAIN, RG_STANDARD } from './rumgr.consts.js';
import { rgPossessedHeadForms } from './rgPossessedHeadForms.js';
import { npText } from './npText.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { withChe } from './withChe.js';

/**
 * The standard of comparison after a compared adjective `adj`, or '' where it has none (P09-E5, P04
 * §2.1). The comparatives take *che* ("pli grond ch'il chaun", eliding before a vowel), the equative
 * *sco* ("uschè grond sco il chaun"); neither contracts with the article, so each leads the whole
 * group: "pli grond ch'il chaun e l'um". A pronoun takes its tonic form: "pli grond che mai".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19), under *da*,
 * which contracts with each conjunct's article: "il pli grond dals animals", "da nus".
 */
export function rgStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  const domain = adj.forms['domain'] === '1';
  const word = domain ? RG_DOMAIN : RG_STANDARD[adjDegree(adj)];
  if (!standard || !word) return '';
  if (!domain) return withChe(word, coordinate(standard, (s) => tonicPronoun(s) ?? npText(s)));
  return coordinate(standard, (s) => {
    const tonic = tonicPronoun(s);
    if (tonic !== undefined) return `da ${tonic}`;
    const forms = rgPossessedHeadForms(s);
    return renderNP(s, (plural, lead) => prepDet('da', forms, plural, lead));
  });
}
