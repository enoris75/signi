import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';
import { firstConjunct } from './firstConjunct.js';
import { isPronounElement } from './isPronounElement.js';
import { slotFocus } from './slotFocus.js';

type Complements = Partial<Record<ComplementType, ResolvedComplement>>;

/**
 * The forms of a **personal-pronoun recipient** — the `terminus` of GIVE, or TELL's addressee that
 * A317 routes there — which Italian, French and Spanish write as the dative clitic before the verb
 * ("le dà il libro", "lui donne le livre", "te da el libro"), not as the tonic pronoun after the
 * dative preposition ("dà il libro a lei", "*donne le livre à elle"). It rides the clitic path A240
 * opened for a verb's dative object (see `dativePronounForm`), so it climbs, encliticizes on a command
 * and sits inside the negation (A351).
 *
 * Only one lone personal pronoun: a coordination keeps its tonic conjuncts ("a lei e al cane"), an
 * indefinite pronoun is no clitic (`isPronounElement`), and a focused one stands in the post-verbal
 * slot its particle needs ("solo a lei"). A negated or specified terminus keeps its phrase too, and so
 * does the generic dative, which has no clitic of its own ("da el libro a uno", A316).
 *
 * A verb whose terminus is a goal rather than a recipient marks it `terminus_tonic` in its lexeme
 * (ADD, LINK, CONNECT: "relie le livre à elle", not "lui relie le livre"), as German marks the same
 * verbs with their own `terminus_prep`; that terminus keeps its phrase.
 */
export function recipientPronoun(
  complements: Complements | undefined, verbForms: Record<string, string> = {},
): Record<string, string> | undefined {
  const terminus = complements?.terminus;
  if (verbForms['terminus_tonic'] === '1') return undefined;
  if (!terminus || terminus.negative || terminus.specifiers?.length || !isPronounElement(terminus.phrase)) return undefined;
  const forms = firstConjunct(terminus.phrase).head.forms;
  if (slotFocus(terminus.phrase) || forms['generic'] === '1') return undefined;
  return forms;
}

/** The complements with the terminus taken out, once its pronoun has become the dative clitic. */
export function withoutTerminus(complements: Complements | undefined): Complements | undefined {
  if (!complements?.terminus) return complements;
  const { terminus: _clitic, ...rest } = complements;
  return rest;
}
