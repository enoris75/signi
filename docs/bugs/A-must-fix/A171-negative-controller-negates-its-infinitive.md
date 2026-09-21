# A171. A `no` controller negates its infinitive complement and clause of purpose

**Language:** English, German, Italian, French, Japanese

A `no` subject negates its own clause, and nothing else. An infinitive complement or a clause of
purpose is a clause of its own, whose unspoken subject is controlled by the matrix subject. "No cat
desires not to eat" has two negations, one per clause, and "no cat desires to eat" has only the
matrix one. [A167](../fixed/A167-negative-head-erases-relative-polarity.md) made the same point for a
relative clause under a `no` head.

The translator resolves both embedded clauses with the controller as their subject
([`resolvePhrase.ts`](../../../packages/engine/src/translator/functions/resolvePhrase.ts):
`resolveInfinitiveComplement` and the `purpose` branch hand over `plan.subject`, or the object under
object control). The `no` determiner comes along, and five engines read it as the embedded
clause's own negative subject:

- **English, German and Italian** collapse the infinitive's own `not` / `nicht` / `non` against it,
  as A160 collapses a main clause's. A negated infinitive then renders exactly like a positive one,
  which reverses its meaning.
- **French** takes it as a self-negating `aucun` and prints a lone `ne`, whatever the infinitive's
  polarity. A positive infinitive gains a negation and a negative one loses its `pas`.
- **Japanese** negates the embedded clause's verb, so a positive infinitive or purpose clause turns
  negative (`食べないこと`, `食べないために`).

| Case | Language | Now | Want |
|---|---|---|---|
| `no cat desires not to eat` | English | `no cat desires to eat.` | `no cat desires not to eat.` |
| | German | `kein Kater wünscht, zu fressen.` | `kein Kater wünscht, nicht zu fressen.` |
| | Italian | `nessun gatto desidera mangiare.` | `nessun gatto desidera non mangiare.` |
| | French | `aucun chat ne désire ne manger.` | `aucun chat ne désire ne pas manger.` |
| `no cat runs not to eat` (purpose) | English | `no cat runs to eat.` | `no cat runs not to eat.` |
| | German | `kein Kater läuft, um zu fressen.` | `kein Kater läuft, um nicht zu fressen.` |
| | Italian | `nessun gatto corre per mangiare.` | `nessun gatto corre per non mangiare.` |
| | French | `aucun chat ne court pour ne manger.` | `aucun chat ne court pour ne pas manger.` |
| `no cat desires to eat` | French | `aucun chat ne désire ne manger.` | `aucun chat ne désire manger.` |
| | Japanese | `どの猫も食べないことを望んでいません。` | `どの猫も食べることを望んでいません。` |
| `no cat runs to eat` (purpose) | French | `aucun chat ne court pour ne manger.` | `aucun chat ne court pour manger.` |
| | Japanese | `どの猫も食べないために走りません。` | `どの猫も食べるために走りません。` |
| `no cat desires to eat the mouse` | French | `aucun chat ne désire ne manger la souris.` | `aucun chat ne désire manger la souris.` |
| | Japanese | `どの猫もネズミを食べないことを望んでいません。` | `どの猫もネズミを食べることを望んでいません。` |

No trial fix was applied. Each **Want** is the embedded clause the same plan renders today under a
definite controller (`the cat desires not to eat.`, `le chat désire ne pas manger.`,
`猫は食べることを望んでいます。`), with the matrix clause's own `no` rendering unchanged.

**Already right.** Spanish and Portuguese in every case (`ningún gato desea no comer.`, `nenhum gato
corre para não comer.`). A positive infinitive in English, German and Italian, since collapsing a
negation that is not there changes nothing. Every language under a definite controller. The matrix
clause's own negation (`no cat desires …`, `aucun chat ne désire …`, `どの猫も…望んでいません`).

Found while fixing A167 (2026-09-21), whose Resolved note first recorded it for en, de, it and fr. Its
French and Japanese positive rows were found when it was probed for filing.

## Shape of the fix

The embedded clause's unspoken subject is never itself negative. It is PRO, controlled by a `no`
phrase whose negation belongs to the matrix. Two places could say so:

- **In the translator** (preferred). When `resolveInfinitiveComplement` and the `purpose` branch
  hand the controller to the embedded clause, strip its `no` (e.g. `definiteness: 'definite'` on a
  copy of its agreement), as A167's trial did for the relative clause's head forms. Agreement
  (person, number, gender) is all the embedded clause needs from it.
- **In the engines.** Each engine's infinitive path passes `subjectIsNegative: false` explicitly, as
  the relative call sites now do through `relativeSubjectIsNegative`.

Check object control too (a causative with a `no` object, `to cause no person to see`), which takes
its subject from the other slot by the same path.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: a negative controller negates its infinitive* (2 `test.fails`, plus a regression test for the languages and shapes already right) |
