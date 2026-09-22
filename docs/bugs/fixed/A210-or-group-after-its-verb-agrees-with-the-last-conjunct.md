# A210. An "or" group after its verb agrees with the last conjunct

**Languages:** English, German

A disjunction agrees with the conjunct nearest the verb: *the cats or the dog **runs***, *die Kater
oder der Hund **läuft***. [`groupAgreement`](../../../packages/engine/src/translator/functions/groupAgreement.ts)
says so, then takes the nearest conjunct to be the **last** one. That holds only while the subject
comes first.

When the verb comes first, the nearest conjunct is the first. English inverts in a question, and
German in a question, in the main clause after a `wenn` clause, and after `also` and `dann`. There
the engine still agrees with the last conjunct, so the finite verb disagrees with the noun it
stands next to: *does the cats or the dog run?*, *läuft die Kater oder der Hund?*. With a pronoun it
gets worse: *does I or the cat run?*, *laufe der Kater oder ich?*.

| Case | Language | Now | Want |
|---|---|---|---|
| question, the CATS or the DOG RUN | English | `does the cats or the dog run?` | `do the cats or the dog run?` |
| | German | `läuft die Kater oder der Hund?` | `laufen die Kater oder der Hund?` |
| … the DOG or the CATS | English | `do the dog or the cats run?` | `does the dog or the cats run?` |
| | German | `laufen der Hund oder die Kater?` | `läuft der Hund oder die Kater?` |
| … BE TIRED | English | `is the cats or the dog tired?` | `are the cats or the dog tired?` |
| | German | `ist die Kater oder der Hund müde?` | `sind die Kater oder der Hund müde?` |
| … resultative | English | `has the cats or the dog run?` | `have the cats or the dog run?` |
| | German | `ist die Kater oder der Hund gelaufen?` | `sind die Kater oder der Hund gelaufen?` |
| … progressive | English | `is the cats or the dog running?` | `are the cats or the dog running?` |
| | German | `läuft die Kater oder der Hund gerade?` | `laufen die Kater oder der Hund gerade?` |
| … negative | English | `does the cats or the dog not run?` | `do the cats or the dog not run?` |
| | German | `läuft die Kater oder der Hund nicht?` | `laufen die Kater oder der Hund nicht?` |
| question, I or the CAT | English | `does I or the cat run?` | `do I or the cat run?` |
| | German | `läuft ich oder der Kater?` | `laufe ich oder der Kater?` |
| question, the CAT or I | English | `do the cat or I run?` | `does the cat or I run?` |
| | German | `laufe der Kater oder ich?` | `läuft der Kater oder ich?` |
| after a `wenn` clause | German | `wenn der Mann springen würde, würde die Kater oder der Hund laufen.` | `…, würden die Kater oder der Hund laufen.` |
| after `also` | German | `der Mann springt, also läuft die Kater oder der Hund.` | `der Mann springt, also laufen die Kater oder der Hund.` |
| after `dann` | German | `der Mann springt, und dann läuft die Kater oder der Hund.` | `der Mann springt, und dann laufen die Kater oder der Hund.` |
| the random phrase's main clause | German | `…, würde jene Kinder, die braunen fehlenden Feuer aller starken alten Flügel oder kein neues gleich erwachsenes Haus die kleine Datei … verdichten.` | `…, würden jene Kinder, … verdichten.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** Every clause with the subject first: the statement (`the cats or the dog runs.`,
`die Kater oder der Hund läuft.`), German `und`, which does not invert (`der Mann springt, und die
Kater oder der Hund läuft.`), the verb-final `wenn` clause and relative clause (`wenn die Kater oder
der Hund laufen würde`, `die Maus, die die Kater oder der Hund sieht`), and an `and` group, which
resolves as a whole (`do the cats and the dog run?`). Italian, French, Spanish and Portuguese keep
the subject first in a question (`i gatti o il cane corre?`, `est-ce que les chats ou le chien
court ?`), so they are right. Japanese does not agree.

Found by the random phrase "if the old light did not describe me or that big man with these wild
buildings well, those children, all strong old wings' brown missing fires or no new equally adult
house would compact the small file with few people and the wing." (seed 583438). German inverts its
main clause after the `wenn` clause and agrees with *kein … Haus* at the far end: `würde jene
Kinder, …`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, and no passing test moves.

`groupAgreement` has no clause, so it cannot know the order. The engines do:

- English inverts in exactly one place, `renderClause` when `verbPhrase.interrogative`
  ([`en/renderClause.ts`](../../../packages/engine/src/languages/en/renderClause.ts)).
- German's `clauseText` takes an `inverted` flag, and `germanEngine` sets it for the question, the
  clause after a condition and the clause after an inverting coordinator
  ([`de/renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts),
  [`germanEngine.ts`](../../../packages/engine/src/languages/de/germanEngine.ts)). `verbFinal`
  overrides it.

The trial added a helper that, for an `or` group of two or more, returns the first conjunct's
person, number and gender (keeping the group's `definiteness`), and otherwise the group's own
agreement. English passes it to `predicateParts` in a question. German reads the person and number
for its verb group from it when `inverted && !verbFinal`. Where it lives is the fixer's call. It
could equally be a second field on `ResolvedNounElement`, computed beside `agreement` in
[`resolveNounElement`](../../../packages/engine/src/translator/functions/resolveNounElement.ts).
Either way, `groupAgreement`'s comment ("nearest the verb, i.e. the last") needs the correction.

**Decisions for the fixer:**

- **The German reflexive.** In the trial, a reflexive's pronoun follows the verb:
  `bewegst du oder der Kater dich?`. It stands after both conjuncts, so the nearer one is *der
  Kater*, and `bewegst du oder der Kater sich?` is as defensible. Not pinned.
- **French.** A French `ou` of mixed persons resolves as under `et` (`OR_RESOLVES_MIXED_PERSONS`), and
  French keeps the subject first under `est-ce que`, so nothing changes there. A future French
  inversion (`court-il ?`) would need the same helper.

| | |
|---|---|
| **Test** | `coordination.test.ts` → *known bugs: an "or" group after its verb agrees with the last conjunct* (1 `test.fails`, plus a regression test for the subject-first clauses, `und`, the verb-final clauses, an `and` group and the Romance questions) |

## Resolved

**2026-09-22.** As a second agreement field, computed beside `agreement`, rather than a helper the
engines call, so the one function that knows the rules still applies all of them:

- [`groupAgreement`](../../../packages/engine/src/translator/functions/groupAgreement.ts) takes a
  `verbFirst` flag that makes the conjunct nearest the verb the first instead of the last. Everything
  else it decides is a fact about the whole group and does not move: `and` resolves as before,
  French's mixed persons resolve as under `and`, a negative conjunct marks the group's
  `definiteness`, and [A211](A211-german-animal-group-eats-with-essen.md)'s `animal` needs every
  conjunct. Its comment no longer says "nearest the verb, i.e. the last".
- [`resolveNounElement`](../../../packages/engine/src/translator/functions/resolveNounElement.ts)
  resolves a group's `invertedAgreement` with it, beside `agreement`; a single phrase has none. The
  field is declared on `ResolvedNounElement` in [`types.ts`](../../../packages/engine/src/types.ts).
- English reads it in a question
  ([`en/renderClause.ts`](../../../packages/engine/src/languages/en/renderClause.ts)), German for
  its verb group's person and number when `inverted && !verbFinal`
  ([`de/renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts)). Either
  falls back to `agreement` when the element has none. `germanEngine` already sets `inverted` for
  the question, the clause after a condition and the clause after an inverting coordinator, so
  nothing changed there.

The verb's sense is still chosen from `agreement`, so an inverted `or` group of animals eats with
*fressen* (`frisst der Kater oder die Hunde?`) and one with a person with *essen*.

**The decisions were left where the file leaves them.** The German reflexive follows the verb's
person, as in the trial: `bewegst du oder der Kater dich?`, `bewegt der Kater oder du sich?`. Not
pinned. French keeps the subject first and is unchanged. No passing test moved.

| | |
|---|---|
| **Tests** | `coordination.test.ts` → *known bugs: an "or" group after its verb agrees with the last conjunct*, the `test.fails` now passing, plus two added cases: three conjuncts in either order, the past copula, the future, a modal, the 2nd person, the passive and a clause coordinated with a question; and an inverted `or` group of animals eating with *fressen* (in a question and after a `wenn` clause) beside one with a person eating with *essen*. `groupAgreement.test.ts` → the two *with the verb ahead of the group* cases; `resolveNounElement.test.ts` → *a group also resolves the agreement a verb ahead of it reads*; `en/renderClause.test.ts` → *a question reads the inverted agreement*; `de/renderClause.test.ts` → *inverted order reads the inverted agreement* |
