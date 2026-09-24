# A355. The Spanish generic patient of a passive is the impersonal *se*

**Languages:** Spanish (Portuguese has the same output, with no settled target)

[A354](../fixed/A354-generic-subject-as-a-direct-object-renders-its-subject-form.md) exempted the passive
from its refusal: the passive promotes the generic patient (GENERIC_PERSON as the direct object) to
the subject, where it has its form (*one is seen by the cat*, *on est vu par le chat*, *man wird vom
Kater gesehen*, *si è visti dal gatto*). Spanish writes that subject as the impersonal clitic *se*,
which is no subject of *ser*: *se es visto por el gato* is not a sentence. The generic subject of a
passive is *uno*, the word Spanish already writes where the clitic cannot stand
([A152](../fixed/A152-impersonal-se-with-reflexive-verb.md): *uno se mueve*).

| Case | Now | Want |
|---|---|---|
| the CAT SEEs GENERIC_PERSON, passive | es `se es visto por el gato.` · pt `se é visto pelo gato.` | es `uno es visto por el gato.` |
| … negated | es `no se es visto por el gato.` · pt `não se é visto pelo gato.` | es `uno no es visto por el gato.` |

**Already right.** English, French, German, Italian and Japanese (`one is seen by the cat.`, `on est vu
par le chat.`, `man wird vom Kater gesehen.`, `si è visti dal gatto.`, 人は猫に見られます。), pinned in the
A354 block. A noun patient (`el perro es visto por el gato.`). The generic subject of an active verb
(`se da el libro al perro`), and of a reflexive verb (`uno se mueve.`).

## Shape of the fix

In [es/predicateText.ts](../../../packages/engine/src/languages/es/predicateText.ts), the generic
subject becomes the impersonal clitic (`impersonalClitic`) unless the verb is reflexive, when it is
written back into the subject slot as its `generic_reflexive` form, *uno* (`genericSubject`). A passive
clause (the verb phrase's `voice` is `passive`) should take the second branch too: *ser* has no
impersonal *se*. The `generic_reflexive` form is seeded in
[pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts), so no reseed is needed.

**Decisions for the fixer:**

- **Portuguese.** [pt/predicateText.ts](../../../packages/engine/src/languages/pt/predicateText.ts)
  has the same branch, and its `generic_reflexive` is *a gente* (A152: *a gente se move*). *a gente é
  visto / vista pelo gato* is colloquial, and the participle's agreement with *a gente* is unsettled;
  *uma pessoa é vista pelo gato* changes the pronoun into a noun. Standard Portuguese would say it
  with no generic subject at all. Not pinned: `se é visto pelo gato` is wrong, but no target is
  standard enough to assert.

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: the Spanish generic patient of a passive is the impersonal se (A355)* (1 `test.fails`: the passive, plain and negated; plus a regression test for the other five languages, a noun patient and the reflexive generic) |

Found by the A354 fix, which exempted the passive from its refusal, 2026-09-24.
