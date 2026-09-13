import type { ConceptForms, LanguageEngine, ResolvedPhrase } from '../../types.js';
import { COORD_WORDS } from './es.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { artFor } from './artFor.js';
import { renderClause } from './renderClause.js';

export const spanishEngine: LanguageEngine = {
  language: 'es',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "si <protasis (subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `si ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    return `${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`;
  },
  // No apocope here: the word stands alone, with no masculine noun behind it to shorten before.
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdj(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return artFor(f, (f['number'] ?? f['count']) === 'plural');
  },
};
