import type { Case, Slot } from './gsw.types.js';
import { DEM_FORMS } from './gsw.consts.js';

/**
 * The demonstrative, proximal or distal, for a case, gender and number: *dä / die / das*, plural *die*
 * (dative *dem / dere / dem / dene*), and the distal *sälb-* (see `DEM_FORMS`). Swiss German has no
 * *dies-*: the proximal demonstrative is the stressed article.
 */
export function demForm(distal: boolean, _case: Case, gender: string, plural: boolean): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  return DEM_FORMS[distal ? 'distal' : 'proximal'][_case === 'dat' || _case === 'gen' ? 'dat' : 'nom'][slot];
}
