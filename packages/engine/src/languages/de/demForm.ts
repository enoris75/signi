import type { Case, Slot } from './de.types.js';
import { DEM_ENDINGS } from './de.consts.js';

export function demForm(distal: boolean, _case: Case, gender: string, plural: boolean): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  return `${distal ? 'jen' : 'dies'}${DEM_ENDINGS[_case][slot]}`;
}
