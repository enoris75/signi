import type { ConceptForms, ResolvedNounPhrase } from '../types.js';

/**
 * The noun phrase a direct-object conjunct renders as when it is the alarm a cry raises, or
 * `undefined` when it is an ordinary object (A124). A cry raises an alarm when its lexeme says so
 * (`alarm_cry`: Italian gridare, French crier) and the noun names a danger (`alarm`: wolf, fire).
 * Italian and French shout it with a / à and the article, "gridò al lupo", "cria au feu", and any
 * other object of the same verb stays plain, "gridò la parola". The article belongs to the frame, so
 * a bare cry takes the definite one ("al lupo", never "*a lupo"); any other determiner is kept.
 */
export function alarmCry(verb: ConceptForms, np: ResolvedNounPhrase): ResolvedNounPhrase | undefined {
  if (verb.forms['alarm_cry'] !== '1' || np.head.forms['alarm'] !== '1') return undefined;
  if (np.head.forms['definiteness'] !== 'bare') return np;
  return { ...np, head: { ...np.head, forms: { ...np.head.forms, definiteness: 'definite' } } };
}
