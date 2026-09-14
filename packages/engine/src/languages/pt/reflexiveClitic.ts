import { PT_REFLEXIVE } from './pt.consts.js';
import { auxKey } from './auxKey.js';

/** A pronominal verb's clitic for its subject ("me", "se", "nos"), or "" for any other verb. */
export function reflexiveClitic(verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  if (!(verbForms['base'] ?? '').endsWith('-se')) return '';
  return PT_REFLEXIVE[auxKey(subjectForms)] ?? 'se';
}
