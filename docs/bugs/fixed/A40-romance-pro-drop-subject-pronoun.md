# A40. Italian, Spanish and Portuguese emit a subject pronoun the null-subject default drops

**Languages:** Italian, Spanish, Portuguese

Italian, Spanish and Portuguese are **null-subject (pro-drop)** languages: the verb ending alone
carries the person, so a personal-pronoun subject is dropped by default (`mangio`, not `io mangio`).
The engine emits it overtly in **every** declarative clause. So "it must have been an angel" comes
out `esso deve essere stato un angelo` / `ello debe haber sido un ángel` / `isso deve ter sido um
anjo`, where a native speaker says `deve essere stato un angelo` / `debe haber sido un ángel` / `deve
ter sido um anjo`.

The defect is general to every person, not just the neuter the report happened to hit:

| Case | Now | Want | Note |
|---|---|---|---|
| it, 1sg `EAT` | `io mangio.` | `mangio.` | drop `io` |
| it, 3neut `EAT` | `esso mangia.` | `mangia.` | drop `esso` |
| it, "it must have been an angel" | `esso deve essere stato un angelo.` | `deve essere stato un angelo.` | the reported case |
| es, 1sg `EAT` | `yo como.` | `como.` | drop `yo` |
| es, 3neut `EAT` | `ello come.` | `come.` | drop `ello` |
| es, "it must have been an angel" | `ello debe haber sido un ángel.` | `debe haber sido un ángel.` | the reported case |
| pt, 1sg `EAT` | `eu como.` | `como.` | drop `eu` |
| pt, 3neut `EAT` | `isso come.` | `come.` | drop `isso` |
| pt, "it must have been an angel" | `isso deve ter sido um anjo.` | `deve ter sido um anjo.` | the reported case |

**In scope only:** a **bare pronoun** subject. A **noun** subject is never dropped (`il gatto
mangia`, `el gato come`, `o gato come`) and a coordinated subject keeps its surface. French
(`cela mange`) and German (`es isst`) are **not** pro-drop and correctly keep the pronoun — the tell
that this is a per-language property, not a lost feature. Japanese topic-drop (それは) is a separate
question and **out of scope** here — an overt topic-marked pronoun is not ungrammatical. The pt
second person `você` is a treatment form with its own overtness norms; the pinning test stays on the
1st/3rd person where the drop is unambiguous.

The drop is a **default**, not absolute: an overt pronoun surfaces for emphasis/contrast (`IO
mangio, non tu`). The plan has no focus/emphasis feature, so **dropping is the correct default** for
every clause the engine can currently build.

**Root:** `renderClause` in [`it.ts`](../../../packages/engine/src/languages/it.ts),
[`es.ts`](../../../packages/engine/src/languages/es.ts) and
[`pt.ts`](../../../packages/engine/src/languages/pt.ts) computes `subj = subjectText(subject)` and
prepends it unconditionally, except for the imperative, which already sets `subj = ''` (the person
still drives the verb form — the exact machinery a pro-drop declarative needs). The fix is to extend
that guard to a single bare pronoun subject: drop `subj` when
`isPronounElement(subject)` (already exported from `types.ts` — one conjunct with a `person`),
letting `subject.agreement` continue to carry person/number/gender to the verb as it does under the
imperative. A noun subject and a coordination fall through to `subjectText` unchanged.

Do the same in all three engines; French and German must be left as they are.

| | |
|---|---|
| **Test** | `pronoun.test.ts` → *known bugs: Romance pro-drop — a pronoun subject is dropped* (3 `test.fails`) |
| **Regression** | same block → *a noun subject is never dropped* and *French and German keep their subject pronoun* (controls that must keep passing) |

**Gotcha — this contradicts existing passing tests.** [`pronoun.test.ts`](../../../packages/engine/test/pronoun.test.ts)
asserts `esso mangia.` / `ello come.` / `isso come.` (and `lui mangia.`, `lei mangia.`, `loro
mangiano.`, etc.) as **correct** in its *third-person pronoun by gender* block, and the *feminine
plural pronoun* block asserts overt `elles courent.` / `ellas corren.` / `elas correm.` — those
French/Spanish/Portuguese cases split: French keeps `elles`, but Spanish/Portuguese `ellas`/`elas`
must now drop. Every it/es/pt assertion in that file that shows an overt pronoun subject must be
updated in the same change. The `neut`-selects-the-language's-"it" distinction is still testable off
`translateWord`/the object path (`esso`/`ello`/`isso` remain the surface forms); it just no longer
appears as a subject.

## Resolved

Fixed 2026-07-17.

**Engine change:** `renderClause` in
[`it.ts`](../../../packages/engine/src/languages/it.ts),
[`es.ts`](../../../packages/engine/src/languages/es.ts) and
[`pt.ts`](../../../packages/engine/src/languages/pt.ts). Each already dropped the subject for an
imperative (`subj = ''`, the person still driving the verb off `subject.agreement`). The guard is
extended: `dropSubject = !!phrase.verbPhrase && (mood === 'imperative' || isPronounElement(subject))`,
so a single bare pronoun subject drops by default (`mangio`, not `io mangio`). A **noun** subject and
a **coordination** are not `isPronounElement`, so they fall through to `subjectText` unchanged; the
drop is gated on there being a finite verb to carry the person. French, German and English are
untouched (not pro-drop).

**Tests now guarding it** — all in [`pronoun.test.ts`](../../../packages/engine/test/pronoun.test.ts):
- *known bugs: Romance pro-drop* — the three former `test.fails` (neuter "it must have been an angel",
  1st person, 3rd person) are now plain passing tests, plus added coverage: a **coordinated** pronoun
  subject is kept (`io e lui mangiamo`), the drop fires **per clause** across a coordination
  (`mangio, e corro`) and in **both halves of a hypothetical** (`se corressi, mangerebbe`), and the
  noun-subject / French-German controls stay green.
- *third-person pronoun by gender* and *feminine plural pronoun*: every overt it/es/pt subject-pronoun
  assertion was updated to the dropped form. Because pro-drop removes the Spanish/Portuguese feminine
  **pronoun** surface (`ellas`/`nosotras`), that block was re-anchored: French still surfaces the overt
  `elles`/`nous`, and the feminine agreement (the A36 feature) is now shown on a **gender-distinct
  predicate adjective** — `sembrano stanche` / `parecen cansadas` / `parecem cansadas` vs the masculine
  `stanchi`/`cansados` — which surfaces the feature even with the subject dropped. (`grande` is
  gender-invariant in it/es/pt and could not, so `TIRED` replaced `BIG` there.)

**Also updated** (same reason — clauses with an overt Romance pronoun subject): the snapshot in
[`verb.conjugation.test.ts`](../../../packages/engine/test/verb.conjugation.test.ts) was re-baselined
(`vitest -u`; 3240 it/es/pt cells each lost their leading pronoun, verb forms unchanged), and the
hand-written cases in [`clause.test.ts`](../../../packages/engine/test/clause.test.ts),
[`coordination.test.ts`](../../../packages/engine/test/coordination.test.ts) and
[`modals.test.ts`](../../../packages/engine/test/modals.test.ts).
