# A354. The generic subject as a direct object renders its subject form

**Languages:** Italian, French, German, Spanish, Portuguese (English and Japanese read, but the plan is refused everywhere)

GENERIC_PERSON is the generic subject: *one, si, on, man, se*, 人. As a direct object it keeps its
subject form, and the sentence means something else or nothing: *il gatto si vede* and *el gato se
ve* read "the cat is seen" or "the cat sees itself"; *le chat on voit* and *der Kater sieht man* are
not sentences (*man* is never an object, as A316's file says). No control builds one.

| Case | Now | Want |
|---|---|---|
| the CAT SEEs GENERIC_PERSON | `the cat sees one.` · `il gatto si vede.` · `le chat on voit.` · `der Kater sieht man.` · `el gato se ve.` · 猫は人を見ます。 · `o gato se vê.` | refused by name (an error naming GENERIC_PERSON) |
| … negated | `il gatto non si vede.` · `le chat n'on voit pas.` · `der Kater sieht man nicht.` | refused |
| the CAT EATs GENERIC_PERSON | `il gatto si mangia.` · `le chat on mange.` · `der Kater frisst man.` | refused |

**Why a refusal.** GENERIC_PERSON has no object form in five of the languages, and the one it could
borrow (*si*, *se*) turns the clause impersonal or reflexive. The same ruling was taken for a relative
over a role gap ([A288](../fixed/A288-relative-clause-over-a-role-gap-renders-nonsense.md)): a plan the
languages cannot say is refused by name, with a 400 at `/api/translate`.

**Not here, and ruled.** The complements were left as they are by
[A197](../fixed/A197-pronoun-in-the-comitative.md) and [A203](../fixed/A203-pronoun-in-the-other-complements.md)
(*con si*, *avec on*, not pinned). The dative has a seeded form since
[A316](../fixed/A316-generic-subject-in-a-dative-experiencer-frame.md) (*gibt einem das Buch*, *da el
libro a uno*), pinned in `okay-predicate.test.ts`, and must keep rendering.

## Shape of the fix

Refuse in resolution, beside the other named refusals in
[resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts): a direct object
(and a relative's, a content clause's) whose concept is GENERIC_PERSON throws an error that names it.
The builder should not offer it.

**Decisions for the fixer:**

- **Seed instead of refusing.** German *einen* and Spanish *a uno* exist (A316 seeded the dative), and
  English *sees one* reads. Italian and French have none. Seeding the three and refusing the other
  four is the alternative; it moves the pins from a throw to strings.
- **The passive** puts GENERIC_PERSON in the agent (*the cat is seen*), which is right and untouched.

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: the generic subject as a direct object renders its subject form (A354)* (2 `test.fails`: the object refused by name, negated and another verb; plus a regression test for the generic subject, its passive and the generic dative) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. **Refused**, as ruled (not seeded). A new
[refuseGenericObject.ts](../../../packages/engine/src/translator/functions/refuseGenericObject.ts) throws
*the generic person (GENERIC_PERSON) cannot be a direct object … (plan.directObject, A354)*.
[resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts) calls it on the
clause's object, which covers a content clause's, an infinitive's and a purpose's, and
[resolveRelativeClause.ts](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts)
on a relative's. The check runs after `addresseeObject`, so an addressee beside a content clause,
moved to the dative (A317), still renders: *erzählt einem, dass*, *cuenta a uno que*. A passive
(a clause's or a relative's, as resolved) is exempt: it promotes the generic patient to the subject,
where it has its form (*one is seen by the cat*, *on est vu par le chat*, *man wird vom Kater
gesehen*, *si è visti dal gatto*, 人は猫に見られます). The generic subject, its agentless passive and
A316's generic dative are unchanged.

`/api/translate` answers with a 400 naming the path
(`plan.directObject: the generic person (GENERIC_PERSON) cannot be a direct object`), from
[planError.ts](../../../packages/backend/src/planError.ts). It uses the verb's `complements` to exempt
the addressee, as the engine does, and exempts any clause whose verb phrase is passive.

The builder still offers *one* in the object's pronoun chooser. No filter hook for refused plans exists
(A288's refusal is not kept out of the builder either), and a per-slot filter would have to know when
the object is an addressee, so it was left out.

Guarded by `clause.test.ts` → *known bugs: the generic subject as a direct object renders its subject
form (A354)*: the two former `test.fails`, now plain tests, three new tests (a conjunct, a relative's,
a content clause's, an infinitive's and a purpose's object refused; the passive's generic patient
rendered in en/fr/de/it/ja; the addressee kept as the dative), and the regression test. Unit cases in `refuseGenericObject.test.ts` and the backend's
`planError.test.ts`; the 400 in `index.test.ts`.
