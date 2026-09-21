import type { ConceptForms, ResolvedNounPhrase } from '../types.js';
import { withDefiniteness } from './withDefiniteness.js';

/**
 * The noun phrase a direct-object conjunct renders as when it is the alarm a cry raises, or
 * `undefined` when it is an ordinary object (A124). A cry raises an alarm when its verb says so
 * (`alarm_cry`: cry out) and the noun names a danger (`alarm`: wolf, fire). The alarm is the shout
 * itself, the word "Wolf!", not a referring noun phrase, so it has no determiner slot: whatever
 * determiner the plan carries is dropped, and the phrase comes back definite (A163). Italian and
 * French shout it with a / à and that article, "gridò al lupo", "cria au feu", never "*a un lupo";
 * English spells it bare, "cried wolf". Any other object of the same verb stays plain, "gridò la
 * parola", "cried a word".
 */
export function alarmCry(verb: ConceptForms, np: ResolvedNounPhrase): ResolvedNounPhrase | undefined {
  if (verb.forms['alarm_cry'] !== '1' || np.head.forms['alarm'] !== '1') return undefined;
  return np.head.forms['definiteness'] === 'definite' ? np : withDefiniteness(np, 'definite');
}
