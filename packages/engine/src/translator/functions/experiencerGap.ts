/**
 * Where a wh-question's gap stands once an **experiencer verb** has turned its clause round (see
 * `resolvePhrase`, C34), as `passiveGap` places it under the passive. The plan names the gap by the
 * plain transitive slots, and Italian *piacere* and Spanish *gustar* move them:
 *
 *  - the **thing liked**, gapped as the object, is the clause's subject now — "**chi** mi piace?",
 *    "¿**qué** le gusta al gato?" (A367);
 *  - the **one who likes**, gapped as the subject, is the dative's gap — "**a chi** piace il cane?",
 *    "¿**a quién** le gusta el perro?" (A368);
 *  - any other gap — a complement, a possessor — is left where it was.
 */
export function experiencerGap<R extends string>(role: 'subject' | 'directObject' | R): 'terminus' | 'subject' | R {
  if (role === 'subject') return 'terminus';
  if (role === 'directObject') return 'subject';
  return role as R;
}
