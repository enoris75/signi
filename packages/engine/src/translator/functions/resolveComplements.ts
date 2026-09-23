import type { ComplementType, NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import { defaultDefiniteness, isNounGroup, nounConjuncts } from '@signi/shared';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { objectPredicativeLink } from '../../functions/objectPredicativeLink.js';
import { topicLink } from '../../functions/topicLink.js';
import type { ResolvedComplement } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounElement } from './resolveNounElement.js';
import { resolveVerbPhrase } from './resolveVerbPhrase.js';

/** The head roles a `role` complement cannot take (see below). */
const ROLE_EXCLUDED_HEADS = new Set(['adjective', 'pronoun']);

/**
 * Resolve the complement map (locative / direction / source / route). Each value is a
 * noun phrase with any specifiers carried straight through as plain data. Shared by the
 * top-level plan and by every relative clause.
 *
 * `verbForms` are the governing verb's, the one thing a complement needs of the clause around it:
 * the factitive `objectPredicative` is linked by a word the verb names (see
 * `ResolvedComplement.link`), and the verb is out of scope by the time a complement renders.
 */
export function resolveComplements(
  complements: PhrasePlan['complements'],
  language: string,
  lookup: LexiconLookup,
  verbForms?: Record<string, string>,
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
    // A role names a class the subject acts as, so its head is a noun (P09-E13 D4). An adjective
    // there is the depictive ("arrives happy"), which would agree with nothing in the essive's
    // shape ("*agit comme heureux"), and a pronoun is no role at all ("*as him"); either drops the
    // whole complement rather than render one of them.
    if (type === 'role' && resolvedPhrase.conjuncts.some((np) => ROLE_EXCLUDED_HEADS.has(np.head.forms['role'] ?? ''))) continue;
    // The object predicative renders no standard in six of the seven (P09-E5), so its head keeps no
    // `standard` flag either: that flag turns the equative's adverb into the first half of a
    // circumfix whose second half never comes ("makes the house *as* big.", A269). The resolved
    // standard itself stays, for Japanese, which does render it (家を犬と同じくらい大きく作ります) and
    // reads the element, never the flag.
    if (type === 'objectPredicative') {
      for (const conjunct of resolvedPhrase.conjuncts) delete conjunct.head.forms['standard'];
    }
    // An *adjective-modified* measure manner adverbial names a generic rate ("at high speed"),
    // not an identifiable one, so a definite article reads oddly ("at *the* high speed"). Force
    // the definite — chosen, or the slot's default — bare. Two cases keep their article, as they
    // are genuinely specific: a bare measure noun is anaphoric ("at *the* speed" — a known speed),
    // and a possessor makes it specific ("at *the* speed of light"). Applied after resolution
    // because the manner relation and adjectives are only known once the head is looked up. The
    // builder fixes this slot's determiner, but a gloss or the console can choose any, and every
    // other determiner means what it says: "at another time", "at all other times", "at no other
    // time" (A226).
    //
    // Only a rate goes bare. A `temporal` measure (TIME) names a point in time, an occasion, and
    // one under an adjective is a count noun like any other, so it keeps the definite a rate
    // drops: "at the other time", beside "at high speed" (A235).
    if (type === 'manner') {
      for (const conjunct of resolvedPhrase.conjuncts) {
        if (
          mannerRelation(conjunct.head.forms) === 'measure' &&
          conjunct.head.forms['temporal'] !== '1' &&
          conjunct.adjectives.length > 0 &&
          !conjunct.possessor &&
          (conjunct.head.forms['definiteness'] ?? 'definite') === 'definite'
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
      // Only the object predicative is linked by a word of the verb's own ("transform it INTO a
      // command"), and the topic of a verb that governs its own ("pensa A qualcosa", P09-E2); every
      // other complement's adposition belongs to the complement type.
      ...(type === 'objectPredicative' && objectPredicativeLink(verbForms)
        ? { link: objectPredicativeLink(verbForms) }
        : {}),
      ...(type === 'topic' && topicLink(verbForms) ? { link: topicLink(verbForms) } : {}),
      specifiers: value.specifiers,
      // The complement's own negation ("not because of the dog"), which is not the clause's and so
      // is carried straight through, like the specifiers (see `Complement.negative`).
      ...(value.negative ? { negative: true } : {}),
    };
  }
  return out;
}
