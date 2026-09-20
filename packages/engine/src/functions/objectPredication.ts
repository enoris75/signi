import type { ObjectPredication } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/**
 * What an `objectPredicative` says of the direct object — the object *becomes* it (`factitive`,
 * the default) or is merely taken *as* it (`essive`). See ObjectPredication.
 */
export function objectPredication(c: ResolvedComplement): ObjectPredication {
  return c.specifiers?.find((s) => s.kind === 'predication')?.value ?? 'factitive';
}
