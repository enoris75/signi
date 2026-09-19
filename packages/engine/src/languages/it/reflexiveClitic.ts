import { IT_REFLEXIVE } from './it.consts.js';
import { auxKey } from './auxKey.js';

/**
 * A pronominal verb's clitic for its subject ("mi", "si", "ci"), or "" for any other verb. Under the
 * impersonal "si" the reflexive one is "ci", since two si cannot stand together: "ci si muove".
 */
export function reflexiveClitic(verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  if (!(verbForms['base'] ?? '').endsWith('rsi')) return '';
  if (subjectForms['generic'] === '1') return 'ci';
  return IT_REFLEXIVE[auxKey(subjectForms)] ?? 'si';
}
