import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { VL_DOMAIN, VL_STANDARD } from './vallader.consts.js';
import { vlPossessedHeadForms } from './vlPossessedHeadForms.js';
import { npText } from './npText.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { withCha } from './withCha.js';

/**
 * The standard of comparison after a compared adjective `adj`, or '' where it has none (P09-E5, P04
 * §2.1). The comparatives take *co* ("plü grond co il chan", the author's draft, verify), the equative
 * *sco* ("uschè grond sco il chan"); neither contracts with the article, so each leads the whole
 * group: "plü grond co il chan e l'hom". A pronoun takes its tonic form: "plü grond co mai".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19), under *da*,
 * which contracts with each conjunct's article: "il plü grond dals animals", "da nus".
 */
export function vlStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  const domain = adj.forms['domain'] === '1';
  const word = domain ? VL_DOMAIN : VL_STANDARD[adjDegree(adj)];
  if (!standard || !word) return '';
  if (!domain) return withCha(word, coordinate(standard, (s) => tonicPronoun(s) ?? npText(s)));
  return coordinate(standard, (s) => {
    const tonic = tonicPronoun(s);
    if (tonic !== undefined) return `da ${tonic}`;
    const forms = vlPossessedHeadForms(s);
    return renderNP(s, (plural, lead) => prepDet('da', forms, plural, lead));
  });
}
