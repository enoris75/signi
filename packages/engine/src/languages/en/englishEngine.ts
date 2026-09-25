import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveEn } from '../../possessive.js';
import { CAUSE_PREP, COORD_WORDS, EN_DEGREE, PARENTHETICAL_CONNECTORS, PATH_PREP } from './en.consts.js';
import { CORRELATIVE_PAIR } from './en.consts.js';
import { citeCorrelative } from '../../functions/correlate.js';
import { TEMPORAL_PREP } from './en.consts.js';
import { enAdj } from './enAdj.js';
import { determiner } from './determiner.js';
import { renderClause } from './renderClause.js';
import type { Subordinator } from '@signi/shared';
import { SUBORDINATORS } from './en.consts.js';

export const englishEngine: LanguageEngine = {
  language: 'en',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "if <protasis (past)>, <apodosis (would …)>".
    const sentence = phrase.condition ? `if ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    const { conjunction, clause } = phrase.coordination;
    const connector = `${COORD_WORDS[conjunction]}${PARENTHETICAL_CONNECTORS.has(conjunction) ? ',' : ''}`;
    // "however" is a connective adverb opening a clause of its own, so a semicolon comes before it
    // rather than a comma (P09-E29).
    return `${sentence}${conjunction === 'however' ? ';' : ','} ${connector} ${renderClause(clause)}`;
  },
  // The determiner alone, for the menu that picks one: English chooses "a" vs "an" on the sound
  // of the word that follows, so the citation noun is passed as that word.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return determiner(f, word);
  },
  // The possessive pronoun alone, for the label on a coreference link. English's is invariant of
  // the possessed head, so the noun it is cited on goes unread ("his", "their").
  renderPossessive(_noun: ConceptForms, possessor: PronominalPossessor): string {
    return possessiveEn(possessor);
  },
  // The word between two clauses. English alone punctuates some of them ("…, that is, …"), which
  // belongs to the sentence and not to the word, so the label is the bare connector.
  // The word that opens a subordinate clause, for the builder's subordinate-clause menu (P09-E12
  // D9): `that`, the object clause's complementizer, or a subordinating conjunction. English cites each word as it opens its clause ("after", "because").
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'whether') return 'whether'; // P09-E55, the indirect yes/no question's complementizer
    return sub === 'that' ? 'that' : SUBORDINATORS[sub];
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    // The correlative pair, its two places marked (P09-E46).
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
    return COORD_WORDS[conjunction];
  },
  // English prepositions neither fuse with an article nor decline, so the cited noun goes unread.
  renderSpecifier(_noun: ConceptForms, specifier: Specifier): string {
    return specifier.kind === 'sentiment' ? CAUSE_PREP[specifier.value]
      : specifier.kind === 'path' ? PATH_PREP[specifier.value]
      // The temporal's relation (P09-E12b): the word alone, "ago" included — it follows its noun
      // in a sentence, but a citation has no noun to follow.
      : specifier.kind === 'temporal' ? TEMPORAL_PREP[specifier.value]
      : '';
  },
  // English compares both ways, and which way is a fact about the adjective, not about the degree:
  // short adjectives inflect ("bigger", "the biggest") and long ones take the adverb ("more
  // beautiful"). So the label is whatever `enAdj` makes of the cited adjective — the inflected word
  // where it inflected, the adverb alone where it did not.
  renderDegree(adjective: ConceptForms, degree: Degree): string {
    if (degree === 'positive') return '';
    const marked = enAdj({ ...adjective, forms: { ...adjective.forms, degree } });
    const adverb = EN_DEGREE[degree];
    // Periphrastic: the adverb leads an unchanged base, and the adverb alone is what was added.
    return marked === `${adverb} ${adjective.forms['base'] ?? ''}` ? adverb : marked;
  },
};
