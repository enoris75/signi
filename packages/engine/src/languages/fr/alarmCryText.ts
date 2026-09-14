import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { aDet } from './aDet.js';
import { renderNP } from './renderNP.js';

/**
 * The alarm a cry raises, as `alarmCry` hands it over: "à" fused with the article, "cria au loup",
 * "au feu", "aux loups". It is the terminus's head, but not the terminus, which is the one the cry is
 * shouted at.
 */
export function alarmCryText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => aDet(possessedHeadForms(np, 'bare'), plural, lead));
}
