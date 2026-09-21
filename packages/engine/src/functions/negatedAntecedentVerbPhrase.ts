import type { ResolvedNounPhrase, ResolvedVerbPhrase } from '../types.js';

/**
 * The verb phrase of a relative clause on `np`, in the subjunctive when its antecedent is negated.
 * "No cat that eats" asserts nothing about a real cat, so Spanish and Portuguese put the relative's
 * verb in the subjunctive: "ningún gato que coma corre", "nenhum gato que coma corre" (A170). A
 * present or future relative takes the present subjunctive, and a past one takes the imperfect
 * subjunctive the protasis already uses ("que comiera", "que comesse"). The trigger is the head's
 * `no` determiner, whatever slot the gap fills and wherever the head stands in the matrix clause.
 *
 * Returned unchanged under any other head, and when the clause already carries a mood of its own.
 * Only the Spanish and Portuguese engines ask. Italian and French take the subjunctive here too in
 * the standard register, but the indicative is widely accepted in both, so that is left to a product
 * decision (see A170).
 */
export function negatedAntecedentVerbPhrase(np: ResolvedNounPhrase, verbPhrase: ResolvedVerbPhrase): ResolvedVerbPhrase {
  if (np.head.forms['definiteness'] !== 'no' || verbPhrase.mood !== undefined) return verbPhrase;
  return { ...verbPhrase, mood: verbPhrase.tense === 'past' ? 'subjunctive' : 'presentSubjunctive' };
}
