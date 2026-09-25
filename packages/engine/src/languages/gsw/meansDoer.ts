import type { ResolvedPhrase } from '../../types.js';
import { deImperativePN } from './deImperativePN.js';

/**
 * Who wields the instrument of a clause's means clause (B06): the forms its "indem" clause's
 * subject pronoun and verb agree with (see `personalPronoun`), or undefined when that is nobody in
 * particular and German says "man". German cannot drop that subject as a gerund does, so it has to
 * name the one the other six leave implicit, and that is the one who does the clause's act:
 *  - a statement's own subject: "der Kater schneidet, indem er den Stock wählt", "ich schneide,
 *    indem ich …"; a generic subject is its own "man";
 *  - under the passive, the demoted agent, who still does the act ("das Brot wird vom Kater
 *    geschnitten, indem er …"); an agentless passive names no one ("…, indem man …");
 *  - a command's addressee: "schneide, indem du …", "schneidet, indem ihr …", "schneiden wir,
 *    indem wir …";
 *  - an instruction and a citation infinitive are addressed to no one: "Schneiden, indem man …";
 *  - a zu-infinitive (`zu`: an infinitive complement or a clause of purpose) is done by its
 *    controller, which the translator hands it as its subject: "…, zu schneiden, indem er …".
 */
export function meansDoer(phrase: ResolvedPhrase, zu = false): Record<string, string> | undefined {
  const { mood, register, voice } = phrase.verbPhrase ?? {};
  if (mood === 'imperative') {
    if (register === 'instruction') return undefined;
    const ipn = deImperativePN(phrase.subject.agreement);
    return { person: ipn.charAt(0), number: ipn.endsWith('pl') ? 'plural' : 'singular' };
  }
  if (mood === 'infinitive' && !zu) return undefined;
  if (voice === 'passive') return phrase.agent?.agreement;
  return phrase.subject.agreement;
}
