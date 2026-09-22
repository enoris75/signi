import type { ConceptForms } from '../../types.js';
import type { Case } from './de.types.js';

/**
 * The case a verb governs its direct object in. German's default is the accusative, and a handful
 * of verbs take the **dative** instead — *helfen*, *folgen*, *danken*, *gehören*, and *glauben*
 * with a person. Nothing in the meaning predicts it (one helps a dog and sees a dog alike), so it
 * is lexical: the German lexeme names it with `object_case`, and every place the object is declined
 * reads it — the article and its adjectives ("hilft dem großen Hund"), a pronoun ("hilft ihm"), a
 * relative pronoun ("der Hund, dem man hilft"), the negative "kein" ("hilft keinem Hund"), and the
 * passive, which a dative verb forms **impersonally**: the patient stays in the dative and *werden*
 * has no subject to agree with ("ihm wird geholfen", not *"er wird geholfen"). Localization C35.
 *
 * Only German reads the key; the other six decline nothing on the object. A verb that takes its
 * object with a preposition names `object_prep` instead, and the preposition's own case wins
 * (see `objectPrepCase`).
 */
export function objectCase(verb: ConceptForms): Extract<Case, 'acc' | 'dat'> {
  return verb.forms['object_case'] === 'dat' ? 'dat' : 'acc';
}
