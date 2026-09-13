import type { ConceptForms, LanguageEngine, ResolvedPhrase } from '../../types.js';
import { COORD_WORDS } from './fr.consts.js';
import { agreeAdjFr } from './agreeAdjFr.js';
import { artFor } from './artFor.js';
import { punctuate } from './punctuate.js';
import { renderClause } from './renderClause.js';

export const frenchEngine: LanguageEngine = {
  language: 'fr',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    let sentence = main;
    if (phrase.condition) {
      // "si" + protasis (imparfait), elided to "s'" only before "il"/"ils"; apodosis in the
      // conditionnel.
      const cond = renderClause(phrase.condition);
      const ifw = /^ils?\b/.test(cond) ? "s'" : 'si ';
      sentence = `${ifw}${cond}, ${main}`;
    }
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return punctuate(sentence);
    return punctuate(`${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`);
  },
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdjFr(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one. French elides against the word that
  // follows ("l'", "cet", "beaucoup d'"), so the citation noun is passed as that word.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return artFor(f, plural, word);
  },
};
