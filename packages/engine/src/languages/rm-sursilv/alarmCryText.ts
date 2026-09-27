import type { ResolvedNounPhrase } from '../../types.js';
import { sursilvPossessedHeadForms } from './sursilvPossessedHeadForms.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * The alarm a cry raises, as `alarmCry` hands it over: *a* with the article, "el crida al luf", "al
 * fieu" (verify). It is the terminus's head, but not the terminus, which is the one the cry is shouted at.
 */
export function alarmCryText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => prepDet('a', sursilvPossessedHeadForms(np), plural, lead));
}
