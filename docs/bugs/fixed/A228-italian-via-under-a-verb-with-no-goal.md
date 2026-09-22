# A228. An Italian animate source takes "via" under a verb with no goal

**Language:** Italian

Italian marks a source with "da", and an animate *goal* takes "da" too (the *andare da qualcuno*
construction), so *il cane va dal bambino* says "to the boy".
[A153](../fixed/A153-italian-animate-source-reads-as-goal.md) kept the two apart by giving an animate
source the ablative adverb "via" (*va via dal bambino*), on every verb, in the source branch of
`headFor` in [`it/complementsPhrase`](../../../packages/engine/src/languages/it/complementsPhrase.ts).

The collision it resolves needs a verb that takes a goal. REMOVE licenses a source and no direction,
so "da" can only be its origin: *l'uomo rimuove il libro dal cane*. There "via" only doubles
*rimuovere* ("remove away from"), and in a relative on the source it lands in front of the relative
pronoun, where Italian cannot have an adverb at all: *un animale via dal quale si sono rimossi
testicoli*.

| Case | Now | Want |
|---|---|---|
| an ANIMAL from which one has REMOVEd TESTICLEs | `un animale via dal quale si sono rimossi testicoli.` | `un animale dal quale si sono rimossi testicoli.` |
| … present | `un animale via dal quale si rimuovono testicoli.` | `un animale dal quale si rimuovono testicoli.` |
| the DOG from which the MAN REMOVEs the BOOK | `il cane via dal quale l'uomo rimuove il libro.` | `il cane dal quale l'uomo rimuove il libro.` |
| the MAN REMOVEs the BOOK from the DOG | `l'uomo rimuove il libro via dal cane.` | `l'uomo rimuove il libro dal cane.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A verb that takes a goal keeps A153's "via" (`il gatto corre via dal cane.`, `il
gatto va via dal cane.`), and a place keeps its bare "da" (`la casa dalla quale l'uomo rimuove il
libro.`). The other six mark the source apart from the goal and are right (`an animal from which one
has removed testicles.`, `ein Tier, von dem man Hoden entfernt hat.`, `un animal del que se han
quitado testículos.`, `精巣を取り除いた動物。`, `um animal do qual se removeram testículos.`).

**Not filed: the relative of a verb with a goal.** `l'uomo via dal quale il cane va corre.` (GO) has
the same misplaced "via", and it is A153's recorded decision: its resolution names the idiomatic
*da cui il cane va via* and keeps the adverb in front, because "being unambiguous beats being
idiomatic here", and `source.test.ts` pins it. It is left to the user; this file does not touch it.

**Nothing shipped shows it.** The gloss that hit it (an animal from which one has removed testicles)
was written around it.

Found authoring C24's relational adjectives.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green apart from one passing test, which pins the shape of a verb's
lexical forms.

Give the animate "via" only to a verb whose goal could read "da". The trial had
[`lexicon.ts`](../../../packages/backend/src/lexicon.ts) hand a verb its concept's licensed
complements (`forms['complements']`, from the `complements` column), and gated the animate branch in
`headFor` on them including `direction`; a caller that passes no verb forms (the complement gloss)
keeps the "via":

```ts
nf['animate'] === '1' && (verbForms['complements'] ?? 'direction').split(',').includes('direction') ? 'via ' : ''
```

The relative clause already passes its verb's forms to the relativizer (`relativeText`), so *dal
quale* follows.

**The passing test the fix moves.** `packages/backend/src/lexicon.test.ts` → *reads a verb's forms,
the non-finite ones folded in by the seed included* compares CUT's forms whole, and they gain
`complements`. An Italian lexeme flag on REMOVE instead would move nothing, at the price of saying per
verb what the concept already says.

**Decision for the fixer: transitive verbs with a goal.** MOVE, COPY and TRANSFER take a direction,
so the trial keeps their "via" (A153 left them open: *sposta il libro dal bambino* is ambiguous).

| | |
|---|---|
| **Test** | `complements/source.test.ts` → *known bugs: an Italian animate source takes "via" under a verb with no goal (A228)* (1 `test.fails`, plus a regression test for a verb with a goal, a place and the other six) |

## Resolved

**2026-09-22**, as the shape above has it:

- [`lexicon.ts`](../../../packages/backend/src/lexicon.ts) hands a verb its concept's licensed
  complements, `forms['complements']` — landed ahead of this fix in the shared base commit, with
  CUT's row in `lexicon.test.ts`.
- [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts) — the
  animate "via" in the source branch of `headFor` is gated on the verb's `complements` including
  `direction`; a caller that passes no verb forms (the complement gloss) keeps it. The relative
  already passes its verb's forms to the relativizer, so *dal quale* follows.

Every verb that licenses a source and no direction now takes its animate source with a bare "da":
REMOVE (*rimuove il libro dal cane*, *un animale dal quale si sono rimossi testicoli*), and BUY,
ACQUIRE, IMPORT, LOAD, DELETE and SHED with it (*compra il libro dal ragazzo*). **MOVE, COPY and
TRANSFER keep their "via"**, as ruled: they take a direction, and bare *sposta il libro dal
ragazzo* would be ambiguous. So do the verbs of motion. **The relative of a verb with a goal**
(*l'uomo via dal quale il cane va corre.*) is A153's recorded decision; it and its pin are
untouched.

| | |
|---|---|
| **Tests** | `complements/source.test.ts` → *known bugs: an Italian animate source takes "via" under a verb with no goal (A228)*, the `test.fails` now passing, plus two added cases: BUY, ACQUIRE, IMPORT and DELETE, a relative on BUY, a group and a pronoun source under REMOVE; and MOVE, COPY, TRANSFER and COME keeping "via". Colocated: `it/complementsPhrase.test.ts` (a verb with a goal, one without, and no verb) |
