import type { AbstractionLevel } from '@signi/shared';
import { isActionLevel } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/**
 * The reification degree chosen for an `instrumental` complement; defaults to `object`. An
 * action level with no resolved `action` to render falls back to `object` — the noun phrase alone
 * — so a half-built plan renders "with a word" rather than nothing.
 */
export function abstractionLevel(c: ResolvedComplement): AbstractionLevel {
  const level = c.specifiers?.find((s) => s.kind === 'abstraction')?.value ?? 'object';
  return isActionLevel(level) && !c.action ? 'object' : level;
}
