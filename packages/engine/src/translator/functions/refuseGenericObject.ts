import { nounConjuncts, type NounElement } from '@signi/shared';

/**
 * Refuses a direct object that is the generic person (GENERIC_PERSON: *one*, *si*, *on*, *man*,
 * *se*, 人), by name (A354). The generic has no object form in five of the languages, and the one it
 * could borrow (*si*, *se*) turns the clause impersonal or reflexive: "il gatto si vede" reads "the cat
 * is seen", and "*der Kater sieht man*" is not a sentence. `/api/translate` says the same with the
 * field's path (see the backend's `planError`).
 *
 * Only the object slot is refused. A passive (`passive`) promotes the object to the subject, which
 * the generic is ("one is seen by the cat", "man wird vom Kater gesehen"), so it passes there. The
 * generic subject, and the generic agent a passive drops, are its own; a dative that has a form
 * keeps it (A316: *gibt einem*, *a uno*), and so does an addressee a content clause moves out of the object into the terminus (see `addresseeObject`), checked after
 * that move. The complements are left as A197 and A203 ruled.
 */
export function refuseGenericObject(el: NounElement | undefined, where: string, passive = false): void {
  if (passive || !el || !nounConjuncts(el).some((np) => np.concept === 'GENERIC_PERSON')) return;
  throw new Error(
    `the generic person (GENERIC_PERSON) cannot be a direct object: no language here has an object form for one / si / on / man (${where}, A354)`,
  );
}
