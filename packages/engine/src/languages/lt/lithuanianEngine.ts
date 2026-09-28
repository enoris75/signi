import type { CoordConjunction, Degree, Specifier, Subordinator } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { citeCorrelative } from '../../functions/correlate.js';
import {
  CAUSE, COMMA_CONJUNCTIONS, COORD_WORDS, CORRELATIVE_PAIR, IF_WORD, LT_DEGREE, LT_EXAMPLES, PLACE, SUBORDINATORS, TEMPORAL, THAT, WHETHER,
} from './lt.consts.js';
import { adjForm } from './adjForm.js';
import { determinerWord } from './determinerWord.js';
import { nounAgr } from './nounAgr.js';
import { possessiveLt } from './possessiveLt.js';
import { punctuate } from './punctuate.js';
import { quantifierWord } from './quantifierWord.js';
import { renderClause } from './renderClause.js';

/**
 * Lithuanian (P18-E8–E10): the engine, forked from Polish (P18 D9). Every form it builds is (verify)
 * until the native review (P18-E12).
 */
export const lithuanianEngine: LanguageEngine = {
  language: 'lt',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // "jei šuo bėgtų, katė suvalgytų pelę": the condition leads, in the conditional, set off by a comma.
    const sentence = phrase.condition ? `${IF_WORD} ${renderClause(phrase.condition)}, ${main}` : main;
    if (!phrase.coordination) return punctuate(sentence);
    const { conjunction, clause } = phrase.coordination;
    // *ir* and *arba* join two clauses bare; *bet, tačiau, todėl, tai yra, o paskui* take a comma.
    const comma = COMMA_CONJUNCTIONS.has(conjunction) ? ',' : '';
    return punctuate(`${sentence}${comma} ${COORD_WORDS[conjunction]} ${renderClause(clause)}`);
  },
  // An adjective standing alone agrees with the noun its label names, in the nominative.
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    if (f['role'] !== 'adjective') return f['base'] ?? '';
    return adjForm(word, 'nom', nounAgr(f));
  },
  // No articles: the determiner menu shows the word a noun takes in the nominative, or nothing.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const agr = nounAgr(f);
    const q = quantifierWord(f['definiteness'], 'nom', f['uncountable'] === '1' && !agr.plural);
    return q?.word ?? determinerWord(f['definiteness'], 'nom', agr);
  },
  // Indeclinable: *mano, tavo, jo, jos, mūsų, jūsų, jų*.
  renderPossessive(_noun: ConceptForms, possessor: PronominalPossessor): string {
    return possessiveLt(possessor);
  },
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'that') return THAT;
    if (sub === 'whether') return WHETHER;
    return SUBORDINATORS[sub];
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
    return COORD_WORDS[conjunction];
  },
  // The adposition alone; its case is not shown. *dėka* follows its noun and is cited after a 〜; the
  // bare locative of plain "in" has no word.
  renderSpecifier(_noun: ConceptForms, specifier: Specifier): string {
    const gov = specifier.kind === 'sentiment' ? CAUSE[specifier.value]
      : specifier.kind === 'temporal' ? TEMPORAL[specifier.value]
      : specifier.kind === 'path' ? PLACE[specifier.value]
      : undefined;
    if (!gov) return '';
    return gov.post ? `〜 ${gov.prep}` : gov.prep;
  },
  // The synthetic comparative and superlative where the adjective has them (*didesnis, didžiausias*),
  // else the adverb.
  renderDegree(adjective: ConceptForms, degree: Degree): string {
    const { comparative, superlative } = adjective.forms;
    if (comparative && degree === 'more') return comparative;
    if (superlative && degree === 'most') return superlative;
    return LT_DEGREE[degree];
  },
  renderExamples(relation: 'example' | 'inclusion'): string {
    return LT_EXAMPLES[relation].prep;
  },
};
