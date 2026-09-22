import type { Case, Slot } from './de.types.js';
import { deSyncopate } from './deSyncopate.js';
import { endingsFor } from './endingsFor.js';

export function declineAdj(base: string, _case: Case, gender: string, plural: boolean, definiteness: string): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  const ending = endingsFor(_case, definiteness, plural)[slot];
  if (!ending.startsWith('e')) return base + ending;
  // Stems already ending in -e (e.g. "müde") absorb the ending's leading e; a stem in unstressed -el
  // loses its own instead ("dunkel" → "dunkle").
  if (base.endsWith('e')) return base + ending.slice(1);
  return deSyncopate(base) + ending;
}
