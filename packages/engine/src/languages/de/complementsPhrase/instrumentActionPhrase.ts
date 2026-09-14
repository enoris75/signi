import type { ResolvedComplement } from '../../../types.js';
import { abstractionLevel } from '../../../functions/abstractionLevel.js';
import { actionInfinitive } from '../../../functions/actionInfinitive.js';
import { coordinate } from '../coordinate.js';
import { declineAdj } from '../declineAdj.js';
import { nounPhrase } from '../nounPhrase.js';

// An instrument presented as an action. German has no gerund, so the two levels part ways
// completely. The process level is a subordinate means clause — "indem man ein Wort wählt",
// with the impersonal "man" and the verb pushed to the end — whose noun phrase is a plain
// direct object, hence *accusative*, not the dative "mit" would otherwise give it.
//
// The concept level nominalises the infinitive instead: German turns any infinitive into a
// neuter noun just by capitalising it ("wählen" → "das Wählen"), which "mit" then puts in
// the dative, and — the noun being a noun — its object arrives as an attached *genitive*:
// "mit dem Wählen eines Wortes". The action's adverb comes along as an attributive
// adjective on that noun ("mit dem schnellen Wählen"), which is what German adverbs are.
//
// Undefined at the object level or without an action: the instrument is then the plain "mit" +
// dative noun of the prepositional path in `complementsPhrase`.
export function instrumentActionPhrase(c: ResolvedComplement): string | undefined {
  const action = c.action;
  const level = abstractionLevel(c);
  if (!action || level === 'object') return undefined;
  const adverb = action.modifier?.forms['base'] ?? '';
  if (level === 'process') {
    const object = coordinate(c.phrase, (np) => nounPhrase(np, 'acc'));
    // A separable verb's finite form takes its particle back at the end of the clause: "indem man eine Maus hinzufügt" (A138).
    const stem = action.verb.forms['3sg_present'];
    const finite3sg = stem ? `${action.verb.forms['particle'] ?? ''}${stem}` : (action.verb.forms['base'] ?? '');
    // A subordinate clause is set off by a comma ("beginnt, indem man ein Wort wählt").
    // It is emitted as a leading comma and pulled back onto the previous word when the
    // clause is joined (see `punctuate`), since the joiner knows nothing of punctuation.
    return [', indem man', object, adverb, finite3sg].filter(Boolean).join(' ');
  }
  const object = coordinate(c.phrase, (np) => nounPhrase(np, 'gen'));
  const infinitive = actionInfinitive(action);
  const act = infinitive.charAt(0).toUpperCase() + infinitive.slice(1);
  // Weak declension: the adjective sits behind the definite "dem" (dative neuter → -en).
  const attr = adverb ? declineAdj(adverb, 'dat', 'neut', false, 'definite') : '';
  return ['mit dem', attr, act, object].filter(Boolean).join(' ');
}
