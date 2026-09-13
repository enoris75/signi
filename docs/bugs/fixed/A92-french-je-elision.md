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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. The new
[`joinSubject.ts`](../../../packages/engine/src/languages/fr/joinSubject.ts) joins a subject to its
predicate. It writes `j'` with no space when the subject text is exactly `je` and the predicate starts
with a vowel. Otherwise it joins with a space.

Two callers use it:

- [`renderClause.ts`](../../../packages/engine/src/languages/fr/renderClause.ts), for main clauses,
  conditions and coordinated clauses.
- [`relativeText.ts`](../../../packages/engine/src/languages/fr/relativeText.ts). Its relativiser now
  comes before the joined clause, so `que` is judged against `j'` and stays whole (`que j'aime`).

Every row now renders as wanted. The fix also covers a `lequel` relative (`dans laquelle j'ai mangé`),
a conditional apodosis (`si je courais, j'aimerais`) and a coordinated clause (`et j'aime le chien`).

These stay unchanged:
- a consonant (`je mange`), a clitic (`je l'aime`) and a negation (`je n'aime pas`);
- a coordinated tonic (`moi et le chat, nous aimons`).

The 249 cells in `verb.conjugation.test.ts.snap` were updated. A script check confirmed that every
changed cell is a French `je ` → `j'` and nothing else.

- **Tests:** [`packages/engine/test/pronoun.test.ts`](../../../packages/engine/test/pronoun.test.ts)
  → *known bugs: French je elision*. The pinning `test.fails` is now a passing `test`. New cases cover
  the `lequel` relative, the apodosis and the coordinated clause, with a guard for the unchanged
  contexts.
- Unit tests: the new `joinSubject.test.ts`, plus `renderClause.test.ts` and `relativeText.test.ts` (fr).
