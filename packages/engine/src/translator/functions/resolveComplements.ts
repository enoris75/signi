import type { ComplementType, NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import { defaultDefiniteness, isNounGroup, nounConjuncts } from '@signi/shared';
import { mannerRelation } from '../../functions/mannerRelation.js';
import type { ResolvedComplement } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounElement } from './resolveNounElement.js';
import { resolveVerbPhrase } from './resolveVerbPhrase.js';

/**
 * Resolve the complement map (locative / direction / source / route). Each value is a
 * noun phrase with any specifiers carried straight through as plain data. Shared by the
 * top-level plan and by every relative clause.
 */
export function resolveComplements(
  complements: PhrasePlan['complements'],
  language: string,
  lookup: LexiconLookup,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  if (!complements) return undefined;
  const out: Partial<Record<ComplementType, ResolvedComplement>> = {};
  for (const [type, value] of Object.entries(complements)) {
    if (!value?.phrase || !nounConjuncts(value.phrase).every((np) => np.concept)) continue;
    // The unchosen determiner depends on the slot: `predicative` defaults to indefinite,
    // every other complement to definite. See `defaultDefiniteness`. Each conjunct of a
    // coordinated complement chooses its own, so the default is applied per conjunct.
    const withDeterminer = (np: NounPhrase): NounPhrase =>
      np.definiteness === undefined ? { ...np, definiteness: defaultDefiniteness(type) } : np;
    const phrase: NounElement = isNounGroup(value.phrase)
      ? { ...value.phrase, conjuncts: value.phrase.conjuncts.map(withDeterminer) }
      : withDeterminer(value.phrase);
    const resolvedPhrase = resolveNounElement(phrase, language, lookup);
    // An *adjective-modified* measure manner adverbial names a generic rate ("at high speed"),
    // not an identifiable one, so a definite article reads oddly ("at *the* high speed"). Force
    // it bare. Two cases keep their article, as they are genuinely specific: a bare measure noun
    // is anaphoric ("at *the* speed" — a known speed), and a possessor makes it specific ("at
    // *the* speed of light"). Applied after resolution because the manner relation and adjectives
    // are only known once the head is looked up; the determiner is fixed for this slot in the UI.
    if (type === 'manner') {
      for (const conjunct of resolvedPhrase.conjuncts) {
        if (
          mannerRelation(conjunct.head.forms) === 'measure' &&
          conjunct.adjectives.length > 0 &&
          !conjunct.possessor
        ) {
          conjunct.head.forms['definiteness'] = 'bare';
        }
      }
    }
    out[type as ComplementType] = {
      phrase: resolvedPhrase,
      // The action an instrument *is* at the process/concept levels ("by **choosing** a word").
      // It is non-finite — it takes no tense, mood or agreement of its own — so it resolves with
      // none, and each engine reads the lexical forms (gerund / infinitive / te-form) it needs.
      action: value.action ? resolveVerbPhrase(value.action, language, lookup) : undefined,
      specifiers: value.specifiers,
    };
  }
  return out;
}
