import { VL_REFLEXIVE, VOWEL_START } from './vallader.consts.js';
import { auxKey } from './auxKey.js';
import { isReflexive } from './nonReflexiveVerb.js';

/**
 * A reflexive verb's clitic for its subject (*am, at, as, ans, as, as*, the style sheet), or "" for
 * any other verb. The generic *ins* takes *as*, as any third person: "ins as ferma".
 */
export function reflexiveClitic(verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  if (!isReflexive(verbForms)) return '';
  return VL_REFLEXIVE[auxKey(subjectForms)] ?? 'as';
}

/**
 * A clitic before its host: *am, at, as* are written *m', t', s'* before a vowel ("s'algorda", "s'es
 * fermà"); *ans* never elides (the style sheet, as the column spells its cells).
 */
export function withClitic(clitic: string, host: string): string {
  if (!clitic) return host;
  if (!host) return clitic;
  return /^a[mts]$/.test(clitic) && VOWEL_START.test(host) ? `${clitic[1]}'${host}` : `${clitic} ${host}`;
}
