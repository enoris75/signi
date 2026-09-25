import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import { prepObjectText } from './prepObjectText.js';
import { possessedPrepObject } from '../../functions/questionPossessor.js';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveFr } from '../../possessive.js';
import { elidesBefore } from './elidesBefore.js';
import { estCeQue } from './estCeQue.js';
import { frontQuestion } from './frontQuestion.js';
import { questionWord } from './questionWord.js';
import { COORD_WORDS, FR_DEGREE, FR_EXAMPLES, CORRELATIVE_PAIR } from './fr.consts.js';
import { citeCorrelative } from '../../functions/correlate.js';
import { FR_TEMPORAL } from './fr.consts.js';
import { agreeAdjFr } from './agreeAdjFr.js';
import { artFor } from './artFor.js';
import { punctuate } from './punctuate.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';
import { renderClause } from './renderClause.js';
import { aDet } from './aDet.js';
import { spatialHead } from './spatialHead.js';
import type { Subordinator } from '@signi/shared';
import { SUBORDINATORS } from './fr.consts.js';

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
      // "cependant" is a connective adverb opening a clause of its own: a semicolon before it — set
      // off by a no-break space, as French typography sets off its question mark — and a comma
      // after it (P09-E29), "le chat court ; cependant, le chien mange".
      const { conjunction, clause } = phrase.coordination;
      sentence = conjunction === 'however'
        ? `${sentence}\u00a0; ${COORD_WORDS[conjunction]}, ${renderClause(clause)}`
        : `${sentence}, ${COORD_WORDS[conjunction]} ${renderClause(clause)}`;
    }
    // A yes/no question asks about the whole statement, coordinated or not, from one "est-ce que". A
    // wh-question fronts its word ahead of it ("qu'est-ce que le chat mange ?"), except over the
    // subject, whose word already leads the statement and needs no "est-ce que" (P09-E6).
    // A possessor question inside the subject is the subject's question too, standing alone: "le chat
    // de qui mange la nourriture ?" (P09-E14) — pied-piped, the colloquial register; extraction from a
    // preverbal subject would read as the object's question.
    const gap = phrase.question;
    const subjectAsked = gap?.role === 'subject' || (gap?.role === 'possessor' && gap.possessed !== 'directObject');
    if (!phrase.verbPhrase?.interrogative || subjectAsked) return punctuate(sentence);
    // A verb that takes its object with a preposition fronts the possessed object whole: "de la maison
    // de qui est-ce que le chat dépend ?" (P09-E14, `possessedPrepObject`).
    const prepFront = possessedPrepObject(phrase);
    const word = prepFront ? prepObjectText(prepFront.np, prepFront.prep) : gap ? questionWord(gap, phrase.verbPhrase.verb) : '';
    return punctuate(gap ? frontQuestion(word, sentence) : estCeQue(sentence));
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
  // The word that opens a subordinate clause, for the builder's subordinate-clause menu (P09-E12
  // D9): `that`, the object clause's complementizer, or a subordinating conjunction. French cites each as it opens its clause, before any elision ("que", "parce que").
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'whether') return 'si'; // P09-E55, the indirect yes/no question's complementizer
    return sub === 'that' ? 'que' : SUBORDINATORS[sub];
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    // The correlative pair, its two places marked (P09-E46).
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
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
    // The temporal's relation (P09-E12b), headed as `complementsPhrase` heads it: "à", "jusqu'à",
    // "il y a", "après", "avant", "pendant".
    if (specifier.kind === 'temporal') {
      const relation = specifier.value;
      return relation === 'at' ? aDet(f, false, word)
        : relation === 'until' ? `jusqu'${aDet(f, false, word)}`
        : prepDet(FR_TEMPORAL[relation], f, false, word);
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
  // The examples relation alone, for the chip on the line to a noun's examples ring (P09-E48).
  renderExamples(relation: 'example' | 'inclusion'): string {
    return FR_EXAMPLES[relation];
  },
};
