import { RG_REFLEXIVE, VOWEL_START } from './rumgr.consts.js';
import { auxKey } from './auxKey.js';
import { isReflexive } from './nonReflexiveVerb.js';

/**
 * A reflexive verb's clitic for its subject (*ma, ta, sa, ans, as, sa*), or "" for any other verb. The
 * generic *ins* takes *sa*, as any third person: "ins sa tschenta".
 */
export function reflexiveClitic(verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  if (!isReflexive(verbForms)) return '';
  return RG_REFLEXIVE[auxKey(subjectForms)] ?? 'sa';
}

/**
 * A clitic before its host, the lexical verb: *ma, ta, sa* elide before a vowel ("s'avrir"); *ans*
 * and *as* never do (verify).
 */
export function withClitic(clitic: string, host: string): string {
  if (!clitic) return host;
  if (!host) return clitic;
  return /^[mts]a$/.test(clitic) && VOWEL_START.test(host) ? `${clitic[0]}'${host}` : `${clitic} ${host}`;
}
