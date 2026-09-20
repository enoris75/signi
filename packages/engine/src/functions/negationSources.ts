import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase } from '../types.js';
import { groupHasNegativeAdverb } from './groupHasNegativeAdverb.js';
import { hasNegativeComplement } from './hasNegativeComplement.js';

/**
 * The places one clause carries a negation, counted once. In the languages with negative concord
 * (the four Romance, and Japanese) several of these surface together and only the preverbal negator
 * is at stake; English and German have no concord, so exactly one may surface and the rest give way
 * — English to the "any"-series NPI, German to the plain indefinite (A158, A160). Each engine
 * decides which one carries, because the precedence differs: a `no` object outranks German's
 * "nicht" ("frisst keine Maus") where English keeps its "not" and switches the object instead
 * ("does not eat any mouse").
 */
export interface NegationSources {
  /** A `no`-determined subject ("no cat", "kein Kater") — leftmost, so it outranks everything. */
  subject: boolean;
  /** A negative adverb (NEVER) on the main verb or any modal, which is itself the negator. */
  adverb: boolean;
  /** The verb phrase's own `negative` — the "not" / "nicht" the clause would otherwise take. */
  verb: boolean;
  /** A `no`-determined conjunct in the direct object. */
  object: boolean;
  /** A `no`-determined conjunct in any complement — the twin of `object` on the adjunct side. */
  complement: boolean;
}

/**
 * `subjectIsNegative` is the caller's, not read off the clause: in a RELATIVE clause the head noun
 * stands in for the subject, but its `kein`/`no` negates the **matrix** clause, not the relative one
 * ("no cat that does not eat runs" keeps both negators), so those call sites leave it unset.
 */
export function negationSources(clause: {
  subjectIsNegative?: boolean;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}): NegationSources {
  return {
    subject: clause.subjectIsNegative === true,
    adverb: groupHasNegativeAdverb(clause.verbPhrase),
    verb: clause.verbPhrase.negative === true,
    object: clause.directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false,
    complement: hasNegativeComplement(clause.complements),
  };
}
