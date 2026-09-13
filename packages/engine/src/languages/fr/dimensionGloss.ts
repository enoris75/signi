import { dimensionRelation, type ResolvedNounElement, type ResolvedNounPhrase } from '../../types.js';
import { FR_DIM_PREP } from './fr.consts.js';
import { elidesBefore } from './elidesBefore.js';
import { joinArt } from './joinArt.js';
import { subjectText } from './subjectText.js';

/**
 * An adjective-definition gloss fragment ("de grande taille"): the dimension noun phrase (its
 * degree adjective already agreed and placed by the ordinary NP path — "grande taille") wrapped in
 * the adposition its `dimensionRelation` selects. The one place a verbless period is a
 * prepositional fragment rather than a bare subject noun phrase — see `renderClause`.
 */
export function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = FR_DIM_PREP[dimensionRelation(np.head.forms)];
  const text = subjectText(el);
  // "de" elides against whatever word leads the phrase ("d'âge bas", but "de grand âge"); "à" never does.
  const head = prep === 'de' && elidesBefore(np.head.forms, text.split(' ')[0] ?? '') ? "d'" : prep;
  return joinArt(head, text).trim();
}
