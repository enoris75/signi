import type { ConceptForms, LanguageEngine, ResolvedPhrase } from '../../types.js';
import { COORD_INVERTS, COORD_WORDS } from './de.consts.js';
import { determiner } from './determiner.js';
import { punctuate } from './punctuate.js';
import { renderClause } from './renderClause.js';

export const germanEngine: LanguageEngine = {
  language: 'de',
  render(phrase: ResolvedPhrase): string {
    // Hypothetical conditional: "wenn <protasis>, <apodosis>", both realised with the
    // würde-periphrasis. The "wenn" clause is a verb-final subordinate ("wenn der Kater essen
    // würde"); the main clause that follows it is inverted, because the fronted subordinate clause
    // occupies the front field, pushing the finite verb ahead of the subject ("würde der Hund
    // laufen"). Without a condition the main clause takes ordinary V2 order.
    const main = renderClause(phrase, /*inverted*/ !!phrase.condition);
    const sentence = phrase.condition
      ? `wenn ${renderClause(phrase.condition, false, /*verbFinal*/ true)}, ${main}`
      : main;
    // Coordination: "<first clause>, <conjunction> <second clause>" — with the second clause
    // inverted when the conjunction is an adverb that claims the front field.
    if (!phrase.coordination) return punctuate(sentence);
    const { conjunction, clause } = phrase.coordination;
    return punctuate(
      `${sentence}, ${COORD_WORDS[conjunction]} ${renderClause(clause, COORD_INVERTS[conjunction])}`,
    );
  },
  // The determiner alone, for the menu that picks one. A German determiner is declined for case;
  // a menu names it in the nominative, the case the citation form is given in.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return determiner(f, 'nom', (f['number'] ?? f['count']) === 'plural');
  },
};
