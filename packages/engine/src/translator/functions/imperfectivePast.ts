import type { SubordinatingConjunction } from '@signi/shared';
import type { ConceptForms, ResolvedPhrase } from '../../types.js';
import { IMPERFECT_PAST_LANGUAGES, IMPERFECTIVE_CONJUNCTIONS } from '../translator.consts.js';

/** `verb` with its past read as a state's, the imperfect (see `statePastForm`). */
function asState(verb: ConceptForms): ConceptForms {
  return verb.forms['stative'] === '1' ? verb : { ...verb, forms: { ...verb.forms, stative: '1' } };
}

/**
 * An adverbial clause with its past made the **imperfect** where its conjunction frames an event in
 * progress (A250): "mentre il gatto mangiava", "pendant que le chat mangeait", "mientras el gato
 * comía", "enquanto o gato comia". The Romance engines already build the imperfect for a state
 * verb's past (A130), reading `stative` on the finite verb, so the clause's verb — and the passive
 * auxiliary that takes over its finite slot — is read as one here. Unchanged outside a past
 * indicative clause under such a conjunction, and in a language with one simple past.
 */
export function imperfectivePast(
  clause: ResolvedPhrase,
  conjunction: SubordinatingConjunction,
  language: string,
): ResolvedPhrase {
  const verbPhrase = clause.verbPhrase;
  if (!verbPhrase || verbPhrase.tense !== 'past' || (verbPhrase.mood !== undefined && verbPhrase.mood !== 'indicative')) return clause;
  if (!IMPERFECTIVE_CONJUNCTIONS.has(conjunction) || !IMPERFECT_PAST_LANGUAGES.has(language)) return clause;
  return asImperfect(clause);
}

/**
 * `clause` with its verb — and the passive auxiliary that takes over its finite slot — read as a
 * state's, so a Romance past says the imperfect. Shared by a *while* clause (A250) and a content clause
 * shifted back under a past governor (A254, see `contentClauseTense`).
 */
export function asImperfect(clause: ResolvedPhrase): ResolvedPhrase {
  const verbPhrase = clause.verbPhrase;
  if (!verbPhrase) return clause;
  return {
    ...clause,
    verbPhrase: {
      ...verbPhrase,
      verb: asState(verbPhrase.verb),
      ...(verbPhrase.passiveAux ? { passiveAux: asState(verbPhrase.passiveAux) } : {}),
    },
  };
}
