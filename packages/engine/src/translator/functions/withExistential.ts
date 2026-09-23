import type { ResolvedPhrase } from '../../types.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { EXISTENTIAL_AGREEING_LANGUAGES } from '../translator.consts.js';

/**
 * An existential clause as resolved from its `existentialPlan`, marked for the engines (P09-E6 D5):
 * the verb phrase carries `existential`, which is what makes each engine say its expletive and its
 * verb — "there", *ci*, *y*, *haber* / *haver*, が — and, where the verb **agrees with the pivot**
 * (`EXISTENTIAL_AGREEING_LANGUAGES`), the subject agrees as the pivot does: "there **are** cats",
 * "ci **sono** dei gatti", "there are a cat and a dog". The pivot stands behind the verb, so an "or"
 * group agrees with its first conjunct, the one nearest the verb, as an inverted clause does (A210).
 *
 * Only the person, number and gender are carried over, never the pivot's determiner: a `no` pivot
 * is a postverbal negator, which concords as an object does ("non c'è nessun gatto"), not the
 * preverbal `no` subject that takes the clause's negation on itself. English agrees in the third
 * person whatever the pivot is ("there is me"); Italian in the pivot's own ("ci sono io").
 */
export function withExistential(resolved: ResolvedPhrase, language: string): ResolvedPhrase {
  if (!resolved.verbPhrase) return resolved;
  const pivot = resolved.directObject;
  // A personal pronoun is refused as the pivot: "there is me" has no form in the object slot it takes
  // in Spanish and Portuguese (a clitic would say "*me hay"), nor the nominative Italian wants ("ci
  // sono io"). An indefinite pronoun is no person and stays: "there is something", *c'è qualcosa*.
  if (pivot && isPronounElement(pivot)) throw new Error('an existential pivot cannot be a personal pronoun yet (P09-E6)');
  const agrees = EXISTENTIAL_AGREEING_LANGUAGES.has(language) && pivot;
  const source = agrees ? pivot.invertedAgreement ?? pivot.agreement : undefined;
  const agreement = source
    ? {
        person: language === 'en' ? '3' : source['person'] ?? '3',
        number: source['number'] ?? 'singular',
        ...(source['gender'] ? { gender: source['gender'] } : {}),
      }
    : undefined;
  const { invertedAgreement: _inverted, ...subject } = resolved.subject;
  return {
    ...resolved,
    verbPhrase: { ...resolved.verbPhrase, existential: true },
    ...(agreement ? { subject: { ...subject, agreement } } : {}),
  };
}
