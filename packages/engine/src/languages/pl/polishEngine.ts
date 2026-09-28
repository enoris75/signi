import type { CoordConjunction, Degree, Specifier, Subordinator } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { citeCorrelative } from '../../functions/correlate.js';
import {
  CAUSE, COMMA_CONJUNCTIONS, COORD_WORDS, CORRELATIVE_PAIR, IF_WORD, PAST_ENDINGS, PLACE, PL_DEGREE, PL_EXAMPLES, SUBORDINATORS,
  TEMPORAL, THAT, WHETHER,
} from './pl.consts.js';
import { adjForm } from './adjForm.js';
import { determinerWord } from './determinerWord.js';
import { nounAgr } from './nounAgr.js';
import { pnOf } from './pnOf.js';
import { possessivePl } from './possessivePl.js';
import { punctuate } from './punctuate.js';
import { quantifierWord } from './quantifierWord.js';
import { renderClause } from './renderClause.js';
import { verbAgr } from './verbAgr.js';

/** A hypothetical condition: *gdyby* with the protasis's person ending on it (*gdybym jadł*, P05 §2.4). */
function protasis(condition: ResolvedPhrase): string {
  const agr = verbAgr(condition.subject.agreement, condition.subject.conjuncts);
  return `${IF_WORD}${PAST_ENDINGS[pnOf(agr)] ?? ''} ${renderClause(condition)}`;
}

/** Polish (P05-E7–E9): the engine. Every form it builds is (verify) until the native review (P05-E11). */
export const polishEngine: LanguageEngine = {
  language: 'pl',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // "gdyby pies biegł, kot zjadłby mysz": the condition leads, set off by a comma.
    const sentence = phrase.condition ? `${protasis(phrase.condition)}, ${main}` : main;
    if (!phrase.coordination) return punctuate(sentence);
    const { conjunction, clause } = phrase.coordination;
    // *i* and *lub* join two clauses bare; *ale, więc, jednak, to znaczy, a potem* take a comma.
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
    const q = quantifierWord(f['definiteness'], 'nom', agr, f['uncountable'] === '1' && !agr.plural);
    return q?.word ?? determinerWord(f['definiteness'], 'nom', agr);
  },
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    return possessivePl(possessor, 'nom', nounAgr(noun.forms));
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
  // The preposition alone; its case is not shown. *temu* follows its noun and is cited after a 〜.
  renderSpecifier(_noun: ConceptForms, specifier: Specifier): string {
    if (specifier.kind === 'sentiment') return CAUSE[specifier.value].prep;
    if (specifier.kind === 'temporal') {
      const t = TEMPORAL[specifier.value];
      return t.post ? `〜 ${t.prep}` : t.prep;
    }
    return specifier.kind === 'path' ? PLACE[specifier.value].prep : '';
  },
  // The synthetic comparative where the adjective has one (*większy, największy*), else the adverb.
  renderDegree(adjective: ConceptForms, degree: Degree): string {
    const comparative = adjective.forms['comparative'];
    if (comparative && degree === 'more') return comparative;
    if (comparative && degree === 'most') return `naj${comparative}`;
    return PL_DEGREE[degree];
  },
  renderExamples(relation: 'example' | 'inclusion'): string {
    return PL_EXAMPLES[relation];
  },
};
