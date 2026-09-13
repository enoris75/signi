import { ES_REFLEXIVE } from './es.consts.js';
import { auxKey } from './auxKey.js';

export function reflexiveClitic(verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  if (!(verbForms['base'] ?? '').endsWith('se')) return '';
  return ES_REFLEXIVE[auxKey(subjectForms)] ?? 'se';
}
