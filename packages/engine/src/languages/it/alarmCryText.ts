import type { ResolvedNounPhrase } from '../../types.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * The alarm a cry raises, as `alarmCry` hands it over: "a" fused with the article, "gridò al lupo",
 * "al fuoco", "ai lupi". It is the terminus's head, but not the terminus, which is the one the cry is
 * shouted at.
 */
export function alarmCryText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => prepDet('a', itPossessedHeadForms(np), plural, lead));
}
