import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement } from '../../types.js';

// The surfaces an indefinite pronoun swaps under negation, each keyed by the form its negative
// counterpart replaces. `negative` is the citation/subject form; the others fall back to it, because
// in six of the seven the negative pronoun is one invariant word (niente, rien, nichts, nada).
const SWAPPED: ReadonlySet<string> = new Set(['base', 'object', 'object_plural', 'disjunctive', 'disjunctive_plural', 'reading']);

/**
 * Put an **indefinite pronoun** into its negative form where the clause is negative: *something*
 * becomes *anything* / *niente* / *rien* / *nichts* / *nada* / 何(も) — one word in the positive and
 * another in the negative, which is what makes it a pronoun the seeded persons are not
 * (localization C32).
 *
 * The lexeme names the negative surface (`negative`, and `negative_<key>` where a slot's form
 * differs); the phrase is also marked `definiteness: 'no'`, which is not a determiner on a pronoun
 * but the flag every engine already reads for **negative concord** — so French drops its "pas" from
 * "ne mange rien", German its "nicht" from "frisst nichts", and Japanese writes the も…ない circumfix
 * (何も食べません), each by the machinery the `no` determiner built.
 *
 * A slot with no negative form, and a clause that is not negative, come back untouched.
 */
export function negativePolarity(
  el: ResolvedNounElement | undefined,
  negative: boolean,
  // Whether this is the clause's subject. English is the one language with a third form there:
  // *nothing* absorbs the negation ("nothing eats"), where the object leaves it on the verb ("does
  // not eat anything"). The other six write one negative word in both slots.
  subject = false,
): ResolvedNounElement | undefined {
  if (!el || !negative) return el;
  if (!el.conjuncts.some((np) => np.head.forms['negative'])) return el;
  return {
    ...el,
    conjuncts: el.conjuncts.map((np) => {
      const negativeBase = (subject ? np.head.forms['negative_subject'] : undefined) ?? np.head.forms['negative'];
      if (!np.head.forms['negative']) return np;
      const forms: Record<string, string> = { ...np.head.forms, definiteness: 'no' };
      for (const key of SWAPPED) {
        const swapped = np.head.forms[`negative_${key}`] ?? (key === 'reading' ? undefined : negativeBase);
        if (swapped !== undefined) forms[key] = swapped;
        else if (key === 'reading') delete forms[key];
      }
      return { ...np, head: { ...np.head, forms } };
    }),
    // The concord flag has to reach the agreement too: every engine reads the clause's negativity
    // off it, not off the conjuncts (A160's "no" subject is the clause's own negator).
    agreement: { ...el.agreement, definiteness: 'no' },
  };
}

/**
 * `negativePolarity` over every complement's phrase: an indefinite pronoun a complement holds is as
 * much under the clause's negation as the object is — "does not run with anyone", "ne court avec
 * personne", 誰とも走りません (A308). The swap marks the phrase `definiteness: 'no'`, the flag each
 * engine's concord already reads off a `no` complement.
 */
export function negativeComplements(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  negative: boolean,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  if (!complements || !negative) return complements;
  return Object.fromEntries(Object.entries(complements).map(([type, c]) =>
    [type, c && { ...c, phrase: negativePolarity(c.phrase, true)! }])) as Partial<Record<ComplementType, ResolvedComplement>>;
}
