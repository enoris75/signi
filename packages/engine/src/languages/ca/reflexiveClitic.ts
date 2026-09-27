import { moodPN } from '../../mood.js';
import { CA_REFLEXIVE } from './ca.consts.js';
import { isReflexive } from './nonReflexiveVerb.js';

/** A pronominal verb's clitic for its subject — *em, et, es, ens, us, es* — or '' for any other verb. */
export function reflexiveClitic(verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  if (!isReflexive(verbForms)) return '';
  return CA_REFLEXIVE[moodPN(subjectForms)] ?? 'es';
}
