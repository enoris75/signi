import type { ConceptForms, LanguageEngine, ResolvedPhrase } from '../../types.js';
import { COORD_WORDS } from './en.consts.js';
import { determiner } from './determiner.js';
import { renderClause } from './renderClause.js';

export const englishEngine: LanguageEngine = {
  language: 'en',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "if <protasis (past)>, <apodosis (would …)>".
    const sentence = phrase.condition ? `if ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    return `${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`;
  },
  // The determiner alone, for the menu that picks one: English chooses "a" vs "an" on the sound
  // of the word that follows, so the citation noun is passed as that word.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return determiner(f, word);
  },
};
