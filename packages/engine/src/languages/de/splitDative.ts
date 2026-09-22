import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';

/**
 * Split the complements into the bare-dative recipient (`terminus`) and the rest. German puts a
 * dative object before the accusative one ("gibt dem Mann das Buch" — the neutral order for two
 * full noun phrases), so its clause builders render the terminus in that slot and let the other
 * complements trail the direct object, where the shared render order puts them.
 *
 * Only an *animate* recipient is a bare dative that leads the object. An inanimate goal ("save the
 * book into the container") is not a recipient but a prepositional destination ("in den Behälter"),
 * so it stays in `rest` and trails the object like any other adjunct — see the terminus branch of
 * `complementsPhrase`.
 *
 * The animacy is read off the forms that branch chooses the adposition from: a noun's own, or a
 * tonic pronoun's (`tonicHeadForms`), which count a personal pronoun as a person. So a dative pronoun
 * leads the object as a dative noun does — "gibt ihm das Buch", not "gibt das Buch ihm" (A229) — and a
 * neuter one keeps the inanimate branch.
 */
export function splitDative(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): { dative?: Partial<Record<ComplementType, ResolvedComplement>>; rest?: Partial<Record<ComplementType, ResolvedComplement>> } {
  const terminus = complements?.['terminus'];
  if (!terminus || recipientForms(terminus)['animate'] !== '1') return { rest: complements };
  const { terminus: _t, ...rest } = complements;
  return { dative: { terminus }, rest };
}

function recipientForms(terminus: ResolvedComplement): Record<string, string> {
  const np = firstConjunct(terminus.phrase);
  return tonicPronoun(np) !== undefined ? tonicHeadForms(np) : np.head.forms;
}
