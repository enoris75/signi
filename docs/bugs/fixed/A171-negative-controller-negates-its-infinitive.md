# A171. A `no` controller negates its infinitive complement and clause of purpose

**Language:** English, German, Italian, French, Japanese

A `no` subject negates its own clause, and nothing else. An infinitive complement or a clause of
purpose is a clause of its own, whose unspoken subject is controlled by the matrix subject. "No cat
desires not to eat" has two negations, one per clause, and "no cat desires to eat" has only the
matrix one. [A167](A167-negative-head-erases-relative-polarity.md) made the same point for a
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

## Resolved

2026-09-21. Took the translator shape, which fixed English, German and Japanese outright. Two
engines needed the explicit shape as well, because they never read the embedded clause's subject.

- **The subject the translator hands over.** A new function,
  [`translator/functions/controlledSubject.ts`](../../../packages/engine/src/translator/functions/controlledSubject.ts),
  changes every `no` conjunct of the controller to the definite and keeps any other determiner,
  plus the person, number and gender a predicate adjective agrees with. It works on the plan, so
  resolution (group agreement, `subject_sense`) runs as before.
  [`resolvePhrase.ts`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) calls it
  in `resolveInfinitiveComplement`, under both subject and object control, and on the `purpose`
  branch. The matrix clause keeps its own `no`.
- **Italian and French.** Their `infinitiveComplementText`
  ([`it/`](../../../packages/engine/src/languages/it/infinitiveComplementText.ts),
  [`fr/`](../../../packages/engine/src/languages/fr/infinitiveComplementText.ts)) builds the
  infinitive from the matrix controller's own forms (`infinitiveController`), `no` included, and
  not from the resolved subject. So it now passes `subjectIsNegative: false` to `predicateText`
  explicitly, the trailing parameter [A167](A167-negative-head-erases-relative-polarity.md) added.
  Spanish and Portuguese needed nothing: their `predicateText` returns the infinitive before it
  reads the flag.
- **Object control, which the file asked to check, had the same defect.** `the cat causes no dog
  not to eat` rendered `causes no dog to eat` / `a mangiare` / `à ne manger` / `, zu fressen`, and
  French also printed `à ne manger` for the positive clause. The same two changes fix it. Japanese
  needed one more:
  [`ja/buildClauseSegments.ts`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts)
  speaks the causee inside the embedded clause (`どの犬も`) and takes it from the matrix's direct
  object, so its `no` never reached the matrix predicate. Its negation had come from the embedded
  subject instead, so `the cat causes no dog to eat` rendered `猫はどの犬も食べないようにします`
  ("the cat makes it so that no dog eats"). A `no` causee now negates the causing predicate, as a
  `no` object does, and the embedded clause keeps its own polarity: `猫はどの犬も食べるようにしません`,
  and `猫はどの犬も食べないようにしません` for the negated clause.

**Found while fixing, not fixed: a coordinated controller loses its `subject_sense` in German.**
`no cat and no dog desire not to eat` renders `kein Kater und kein Hund wünschen, nicht zu essen`,
where each animal alone takes `fressen`. This happens at HEAD too, in either polarity, so it is
not this defect.

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: a negative controller negates its infinitive*. Both pinning `test.fails` are now
  passing `test`s, with their assertions unchanged. New cases:
  - a `no` causee in all seven languages, with a positive and a negated clause. A regression
    guard checks a `no` subject over a definite causee;
  - a nested infinitive under a `no` controller (`nessun gatto desidera essere capace di non
    mangiare`);
  - a predicate adjective that still agrees with a feminine `no` controller (`nessuna gatta desidera
    non essere attenta`, `aucune chatte ne désire ne pas être prudente`);
  - a negated purpose clause with its own object;
  - a coordinated `no` controller.
- **Unit tests:**
  - [`translator/functions/controlledSubject.test.ts`](../../../packages/engine/src/translator/functions/controlledSubject.test.ts)
    is new;
  - `resolvePhrase.test.ts` checks that the infinitive's subject, under either control, and the
    purpose's subject are handed over definite, while the matrix keeps its `no`;
  - `it/infinitiveComplementText.test.ts` and `fr/infinitiveComplementText.test.ts` check a `no`
    controller in both polarities;
  - `ja/buildClauseSegments.test.ts` checks that a `no` causee negates the causing predicate.
