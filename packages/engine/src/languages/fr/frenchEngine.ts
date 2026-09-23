import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveFr } from '../../possessive.js';
import { elidesBefore } from './elidesBefore.js';
import { estCeQue } from './estCeQue.js';
import { frontQuestion } from './frontQuestion.js';
import { questionWord } from './questionWord.js';
import { COORD_WORDS, FR_DEGREE } from './fr.consts.js';
import { agreeAdjFr } from './agreeAdjFr.js';
import { artFor } from './artFor.js';
import { punctuate } from './punctuate.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';
import { renderClause } from './renderClause.js';
import { aDet } from './aDet.js';
import { spatialHead } from './spatialHead.js';

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
    // A yes/no question asks about the whole statement, coordinated or not, from one "est-ce que". A
    // wh-question fronts its word ahead of it ("qu'est-ce que le chat mange ?"), except over the
    // subject, whose word already leads the statement and needs no "est-ce que" (P09-E6).
    const gap = phrase.question;
    if (!phrase.verbPhrase?.interrogative || gap?.role === 'subject') return punctuate(sentence);
    return punctuate(gap ? frontQuestion(questionWord(gap, phrase.verbPhrase.verb), sentence) : estCeQue(sentence));
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
  renderConjunction(conjunction: CoordConjunction): string {
    return COORD_WORDS[conjunction];
  },
  // The adposition alone: French contracts "de"/"à" with the definite article ("autour du chien"),
  // so the noun is cited bare and only the preposition is left. `over` is cited in its **locative**
  // reading, "au-dessus de" — the place above something; a route over it crosses, "par-dessus", and
  // the chip that shows this label names a relation rather than a complement.
  renderSpecifier(noun: ConceptForms, specifier: Specifier): string {
    const f = noun.forms;
    const word = f['base'] ?? '';
    if (specifier.kind === 'sentiment') {
      return specifier.value === 'positive' ? `grâce ${aDet(f, false, word)}`
        : specifier.value === 'negative' ? `par la faute ${deDet(f, false, word)}`
        : `à cause ${deDet(f, false, word)}`;
    }
    return specifier.kind === 'path' ? spatialHead(specifier.value, f, false, word, 'locative') : '';
  },
  // Periphrastic throughout ("plus", "le plus", "moins", "aussi"), so the cited adjective goes unread.
  renderDegree(_adjective: ConceptForms, degree: Degree): string {
    // The relative superlative is the comparative under the definite article — the article
    // belongs to the noun phrase, not to the degree, so a label that showed the adverb alone
    // would say "plus" for both degrees. Cited masculine singular, the
    // gender a citation form is given in (as `renderPossessive` defaults).
    const word = FR_DEGREE[degree];
    return word && (degree === 'most' || degree === 'least') ? `le ${word}` : word;
  },
};
