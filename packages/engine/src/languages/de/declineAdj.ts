import type { Case, Slot } from './de.types.js';
import { endingsFor } from './endingsFor.js';

export function declineAdj(base: string, _case: Case, gender: string, plural: boolean, definiteness: string): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  let ending = endingsFor(_case, definiteness, plural)[slot];
  // Stems already ending in -e (e.g. "müde") absorb the ending's leading e.
  if (ending.startsWith('e') && base.endsWith('e')) ending = ending.slice(1);
  return base + ending;
}
