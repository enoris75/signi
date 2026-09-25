import type { NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import type { Mood } from '../../types.js';
import { EXISTENTIAL_NO_DETERMINERS, EXISTENTIAL_VERBS } from '../translator.consts.js';

/**
 * The plain clause an **existential** plan is resolved as, in `language` (P09-E6 D5, "the
 * existential"; see PhrasePlan.existential). The pivot — the plan's `subject` — moves to the
 * **object** slot of the language's existential verb (`EXISTENTIAL_VERBS`), because in French,
 * German, Spanish and Portuguese that is what it grammatically is: *il y a un chat*, *es gibt
 * einen Kater* (the accusative), *hay un gato*, *há um gato* — and the object path already writes
 * the forms a negation takes there (*pas de chat*, *keinen Kater*). The subject slot takes the
 * impersonal third person, which the engines say as the expletive: "il", "es", nothing where the
 * language drops a pronoun subject (it / es / pt), "there" in English and nothing in Japanese, whose
 * engines read the flag the translator sets (`ResolvedVerbPhrase.existential`). The verbs that agree
 * with the pivot (en, it) have that agreement put back after resolution (`withExistential`).
 *
 * Two negations are settled here, where the plan still says them. A pivot that is already `no`
 * negates the clause on its own, so the verb's `negative` is dropped rather than said twice ("there
 * is no cat", *non c'è nessun gatto*). And English says a negated indefinite pivot as *no* — "there
 * is no cat", "there are no cats" — unless a modal carries the negation ("there cannot be a cat").
 *
 * Refused, with an error naming the construct: a verb other than BE (the existential is BE's frame,
 * and no other verb has one), a verbless plan, a wh-question (`questionRole` — "what is there?" asks
 * about the pivot, a gap no engine writes), a passive, and a command or an infinitive (`mood`), none
 * of which has an existential reading here. The plan's own `directObject` is meaningless and dropped.
 */
export function existentialPlan(plan: PhrasePlan, language: string, mood?: Mood): PhrasePlan {
  const verbPhrase = plan.verbPhrase;
  if (!verbPhrase) throw new Error('an existential needs a verb phrase (P09-E6)');
  if (verbPhrase.verb !== 'BE') throw new Error(`an existential is said with BE, not ${verbPhrase.verb} (P09-E6)`);
  if (plan.questionRole) throw new Error('an existential cannot be a wh-question yet (P09-E6)');
  if (verbPhrase.voice === 'passive') throw new Error('an existential has no passive (P09-E6)');
  if (mood === 'imperative' || mood === 'infinitive') throw new Error(`an existential has no ${mood} (P09-E6)`);
  const pivot = plan.subject;
  const conjuncts: NounPhrase[] = 'conjuncts' in pivot ? pivot.conjuncts : [pivot];
  const alreadyNegative = conjuncts.some((np) => np.definiteness === 'no');
  // English says the negation on the pivot, where it can: one indefinite (or bare) noun phrase and no
  // modal to carry the "not" instead.
  const noPivot = language === 'en' && verbPhrase.negative === true && !alreadyNegative
    && !('conjuncts' in pivot) && EXISTENTIAL_NO_DETERMINERS.has(pivot.definiteness ?? 'definite')
    && (verbPhrase.modals?.length ?? 0) === 0;
  const directObject: NounElement = noPivot ? { ...pivot, definiteness: 'no' } : pivot;
  const { existential: _existential, ...rest } = plan;
  return {
    ...rest,
    subject: { concept: 'THIRD_PERSON', gender: language === 'de' || language === 'gsw' ? 'neut' : 'masc' },
    verbPhrase: {
      ...verbPhrase,
      verb: EXISTENTIAL_VERBS[language] ?? 'BE',
      ...(alreadyNegative || noPivot ? { negative: false } : {}),
    },
    directObject,
  };
}
