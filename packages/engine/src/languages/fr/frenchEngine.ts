import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveFr } from '../../possessive.js';
import { elidesBefore } from './elidesBefore.js';
import { estCeQue } from './estCeQue.js';
import { COORD_WORDS } from './fr.consts.js';
import { agreeAdjFr } from './agreeAdjFr.js';
import { artFor } from './artFor.js';
import { punctuate } from './punctuate.js';
import { renderClause } from './renderClause.js';

export const frenchEngine: LanguageEngine = {
  language: 'fr',
  // French typography sets a question mark off from its sentence with a space, a no-break one so the
  // mark never wraps to a line of its own.
  questionMark: ' ?',
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
    if (phrase.coordination) {
      sentence = `${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`;
    }
    // A yes/no question asks about the whole statement, coordinated or not, from one "est-ce que".
    return punctuate(phrase.verbPhrase?.interrogative ? estCeQue(sentence) : sentence);
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
  // The possessive alone, for the label on a coreference link. French agrees it with the possessed
  // head, and mon/ton/son stand in for ma/ta/sa before a vowel sound, so it is cited on a noun the
  // way a determiner is — the same elision test the article makes.
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return possessiveFr(
      possessor,
      { gender: (f['gender'] ?? 'masc') as 'masc' | 'fem', number: plural ? 'plural' : 'singular' },
      elidesBefore(f, word),
    );
  },
};
