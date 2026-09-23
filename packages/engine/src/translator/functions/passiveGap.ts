/**
 * Where a gap stands once its clause is **passive** (P09-E16), for a relative clause's head and a
 * wh-question alike. The plan names the gap by the **active** slots, and the passive moves them:
 *
 *  - the **patient**, gapped as the object, is the clause's subject now — "the book **that** is
 *    written", "**what** is eaten by the cat?";
 *  - the **agent**, gapped as the subject, is the by-phrase's gap — "the child **by whom** the book is
 *    written", "**who** is the food eaten **by**?";
 *  - any other gap — a complement, a possessor — is left where it was: "the house **in which** the
 *    book is written", "**where** is the food eaten by the cat?".
 */
export function passiveGap<R extends string>(role: 'subject' | 'directObject' | R): 'agent' | 'subject' | R {
  if (role === 'subject') return 'agent';
  if (role === 'directObject') return 'subject';
  return role as R;
}
