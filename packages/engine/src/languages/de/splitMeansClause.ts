import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { abstractionLevel } from '../../resolved/abstractionLevel.js';

/**
 * A `process` instrumental is not a phrase but a subordinate means clause ("indem man ein Wort
 * wählt"), and a subordinate clause is clause-final in German: it sits in the Nachfeld, *after*
 * the verb material the other complements come before ("hat begonnen, indem man ein Wort wählt",
 * "Ein Wort wählen" → "Beginnen, indem man ein Wort wählt"). Split it out so the joiner can put
 * it last instead of burying it among the objects.
 */
export function splitMeansClause(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): { means?: Partial<Record<ComplementType, ResolvedComplement>>; rest?: Partial<Record<ComplementType, ResolvedComplement>> } {
  const instrument = complements?.['instrumental'];
  if (!instrument?.action || abstractionLevel(instrument) !== 'process') return { rest: complements };
  const { instrumental, ...rest } = complements!;
  return { means: { instrumental }, rest };
}
