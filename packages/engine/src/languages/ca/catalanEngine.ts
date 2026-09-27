import type { CoordConjunction, Degree, Specifier, Subordinator } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveCa } from '../../possessive.js';
import { citeCorrelative } from '../../functions/correlate.js';
import { CA_DEGREE, CA_EXAMPLES, CA_SUPPLETIVE, CA_TEMPORAL, COORD_WORDS, CORRELATIVE_PAIR, PARENTHETICAL_CONNECTORS, SUBORDINATORS } from './ca.consts.js';
import { aDet } from './aDet.js';
import { agreeAdj } from './agreeAdj.js';
import { artFor } from './artFor.js';
import { caSurface } from './caSurface.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';
import { renderClause } from './renderClause.js';
import { spatialHead } from './spatialHead.js';

/**
 * Catalan (P03): Central Catalan in the IEC standard, a fork of the Spanish engine whose every word is
 * re-sourced from the `ca` lexemes or `ca.consts.ts`. A preview language until the native review
 * (P03-E11).
 */
export const catalanEngine: LanguageEngine = {
  language: 'ca',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "si <protasis (imperfect subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `si ${renderClause(phrase.condition)}, ${main}` : main;
    if (!phrase.coordination) return sentence;
    const { conjunction, clause } = phrase.coordination;
    const connector = `${COORD_WORDS[conjunction]}${PARENTHETICAL_CONNECTORS.has(conjunction) ? ',' : ''}`;
    // "however" is a connective adverb opening a clause of its own, after a semicolon (P09-E29).
    return `${sentence}${conjunction === 'however' ? ';' : ','} ${connector} ${renderClause(clause)}`;
  },
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    if (f['role'] !== 'adjective') return f['base'] ?? '';
    return agreeAdj(f, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return artFor(f, (f['number'] ?? f['count']) === 'plural');
  },
  // The possessive alone, for the label on a coreference link. It agrees with the possessed head, so it
  // is cited on a noun, without the article the phrase puts before it ("el meu gat" cites "meu"), as
  // Italian and Portuguese cite theirs.
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    return possessiveCa(possessor, {
      gender: (f['gender'] ?? 'masc') as 'masc' | 'fem',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
  // The word that opens a subordinate clause (P09-E12 D9).
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'whether') return 'si'; // P09-E55, the indirect yes/no question's complementizer
    return sub === 'that' ? 'que' : SUBORDINATORS[sub];
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
    return COORD_WORDS[conjunction];
  },
  // The adposition alone, cited on a bare noun: "sota", "darrere de", "a causa de".
  renderSpecifier(noun: ConceptForms, specifier: Specifier): string {
    const f = noun.forms;
    if (specifier.kind === 'sentiment') {
      return specifier.value === 'positive' ? `gràcies ${aDet(f, false)}`
        : specifier.value === 'negative' ? `per culpa ${deDet(f, false)}`
        : `a causa ${deDet(f, false)}`;
    }
    if (specifier.kind === 'temporal') {
      if (specifier.value === 'at') return prepDet('en', f, false);
      const { word, de, a } = CA_TEMPORAL[specifier.value];
      return de ? `${word} ${deDet(f, false)}` : a ? `${word} ${aDet(f, false)}` : prepDet(word, f, false);
    }
    return specifier.kind === 'path' ? caSurface(spatialHead(specifier.value, false, f)) : '';
  },
  // "més", "el més", "menys", "igual de"; *bo* and *dolent* are suppletive, "millor", "el millor".
  renderDegree(adjective: ConceptForms, degree: Degree): string {
    const suppletive = CA_SUPPLETIVE[adjective.forms['base'] ?? ''];
    const word = suppletive && (degree === 'more' || degree === 'most') ? suppletive : CA_DEGREE[degree];
    return word && (degree === 'most' || degree === 'least') ? `el ${word}` : word;
  },
  renderExamples(relation: 'example' | 'inclusion'): string {
    return CA_EXAMPLES[relation];
  },
};
