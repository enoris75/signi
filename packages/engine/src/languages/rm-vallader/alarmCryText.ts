import type { ResolvedNounPhrase } from '../../types.js';
import { vlPossessedHeadForms } from './vlPossessedHeadForms.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * The alarm a cry raises, as `alarmCry` hands it over: *a* with the article, "el clama al luf", "al
 * fö" (verify). It is the terminus's head, but not the terminus, which is the one the cry is shouted at.
 */
export function alarmCryText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => prepDet('a', vlPossessedHeadForms(np), plural, lead));
}
