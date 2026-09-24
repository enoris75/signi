import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinate } from './coordinate.js';
import { DE_DOMAIN_PRONOUN, DE_STANDARD } from './de.consts.js';
import type { Case } from './de.types.js';
import { nounPhrase } from './nounPhrase.js';
import { tonicPronounDe } from './tonicPronounDe.js';

/**
 * The standard of comparison after a compared adjective `adj` — "als der Hund", "wie der Hund" — or
 * '' where it has none (P09-E5). "als" and "wie" are conjunctions and govern no case: the standard
 * stands in `_case`, the case of what it is compared with. For a subject's predicate adjective that
 * is the nominative — "größer als der Hund", "größer als er", never the dative a preposition would
 * give; for an attributive one it is the case of the phrase the adjective stands in (P09-E18): "sieht
 * einen größeren Kater als **den** Hund", "gibt einem größeren Kater als **dem** Hund das Buch". A
 * pronoun takes the same case ("als ihn", "als ihm"). The word leads the whole group: "größer als der
 * Hund und der Mann".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the bare
 * **genitive** of a noun ("das größte der Tiere", "der Familie"), and "von" + the dative of a pronoun
 * ("der größte von uns"; `DE_DOMAIN_PRONOUN`), the genitive pronoun being archaic — whatever `_case`.
 * Per conjunct, so a coordinated set is "der Tiere und der Männer". A coordinated set with a pronoun
 * among its conjuncts takes "von" once, before the whole group, and every conjunct then stands in the
 * dative it governs: "von uns und den Hunden", "von den Hunden und uns" (A286).
 */
export function deStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined, _case: Case): string {
  if (!standard) return '';
  if (adj.forms['domain'] === '1') {
    if (standard.conjuncts.length > 1 && standard.conjuncts.some((s) => s.head.forms['person'])) {
      return `${DE_DOMAIN_PRONOUN} ${coordinate(standard, (s) =>
        s.head.forms['person'] ? tonicPronounDe(s.head.forms, 'dat') : nounPhrase(s, 'dat'))}`;
    }
    return coordinate(standard, (s) =>
      s.head.forms['person'] ? `${DE_DOMAIN_PRONOUN} ${tonicPronounDe(s.head.forms, 'dat')}` : nounPhrase(s, 'gen'));
  }
  const word = DE_STANDARD[adjDegree(adj)];
  if (!word) return '';
  return `${word} ${coordinate(standard, (s) => (s.head.forms['person'] ? tonicPronounDe(s.head.forms, _case) : nounPhrase(s, _case)))}`;
}
