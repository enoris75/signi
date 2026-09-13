import type { ComplementType } from '@signi/shared';
import { firstConjunct, type ResolvedComplement } from '../../types.js';

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
 */
export function splitDative(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): { dative?: Partial<Record<ComplementType, ResolvedComplement>>; rest?: Partial<Record<ComplementType, ResolvedComplement>> } {
  const terminus = complements?.['terminus'];
  if (!terminus || firstConjunct(terminus.phrase).head.forms['animate'] !== '1') return { rest: complements };
  const { terminus: _t, ...rest } = complements;
  return { dative: { terminus }, rest };
}
