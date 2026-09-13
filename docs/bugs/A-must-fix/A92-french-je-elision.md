# A92. French never elides the subject pronoun "je"

**Language:** French

The subject clitic `je` elides to `j'` before a vowel (or a mute h): `j'ai mangé`, `j'aime`. The
pronoun subject comes from `subjectPhrase` (`languages/fr/subjectPhrase.ts`). `renderClause`
(`languages/fr/renderClause.ts`) and `relativeText` (`languages/fr/relativeText.ts`) join it to the
predicate with a plain space, so nothing elides it. Every 1st-singular clause with a vowel-initial
finite verb is affected: `avoir` (the compound past), `être` in the imparfait (`étais`), and verbs
such as `aimer`, `ajouter`, `apparaître`.

| Clause | Now | Want |
|---|---|---|
| EAT, resultative | `je ai mangé.` | `j'ai mangé.` |
| LOVE + CAT | `je aime le chat.` | `j'aime le chat.` |
| EAT, progressive past | `je étais en train de manger.` | `j'étais en train de manger.` |
| object relative, subject FIRST_PERSON | `la souris que je aime court.` | `la souris que j'aime court.` |
| condition, resultative | `si je avais mangé, le chat courrait.` | `si j'avais mangé, le chat courrait.` |

Already right: a clitic in between (`je l'aime.`), a negation (`je ne mange pas.`), and the
relativiser and conditional elisions that already exist (`qu'il`, `s'il`).

**Snapshot:** `packages/engine/test/__snapshots__/verb.conjugation.test.ts.snap` records the current
output in 249 cells (`"fr": "je ajoute."`, `"je ai ajouté."`, `"je étais …"`). They change with the
fix.

## Shape of the fix

Join the subject and the predicate with an elision check. When the subject text is exactly `je` (a
pronoun subject, not a coordinated tonic `moi`) and `VOWEL_START` holds for the predicate's first
word, write `j'` with no space. Do it in `renderClause` and in `relativeText`, whose subject goes
through the same `subjectText`.

| | |
|---|---|
| **Test** | `pronoun.test.ts` → *known bugs: French je elision* (1 `test.fails`) |
