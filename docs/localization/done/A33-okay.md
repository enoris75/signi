# A33. OKAY — that does not have problems

_(filed on 2026-09-24 for the concepts [P09-E24–E43](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
seeded with no `definition`. OKAY was seeded by
[P09-E31](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E31-state-predicate-okay.md), the
lexical copula (*sta bene, va bien, dem Kater geht es gut*). Its Done item 5 left it unglossed: "no
plan in the corpus says 'in a satisfactory state' without restating *good* or *well*". A relative
on PROBLEM does, and so does one on STATE; this ticket **overturns that remark**. No new word, no new
construct.)_

## Plan

Inline on the OKAY block in [concepts/adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts),
on C23's headless relative ([relativeGloss.ts](../../../packages/backend/src/concepts/relativeGloss.ts)),
DARK's shape ("that does not have light", B59):

| concept | plan | gloss (en) |
|---|---|---|
| OKAY | `subjectGapGloss('BEING', 'HAVE', { object: 'PROBLEM', number: 'plural', negative: true })` | that does not have problems |

The antecedent is BEING, the class OKAY is said of in E31's table (*the cat is okay, I am okay*); it
sets German's relative pronoun (*das*, of *Wesen*). OBJECT_THING renders the same in six languages
and *der* in German, for an author who prefers "the plan is okay" as the model.

## Vocabulary

All seeded: HAVE, PROBLEM ("a state that one must change"; *problema, problème, Problem, problema*,
問題, *problema*) and the antecedent BEING.

## Probe renders (2026-09-24, engine source at 2c4cee46, lexicon seeded in memory)

Every row was checked against all 497 shipped definitions in all seven languages; none collides.

| candidate | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **that does not have problems** (proposed, BEING) | that does not have problems | che non ha problemi | qui n'a pas de problèmes | das keine Probleme hat | que no tiene problemas | 問題がない | que não tem problemas |
| the same, OBJECT_THING | that does not have problems | che non ha problemi | qui n'a pas de problèmes | der keine Probleme hat | que no tiene problemas | 問題がない | que não tem problemas |
| that is in a good state | that is in a good state | che è in un buono stato | qui est dans un bon état | das in einem guten Zustand ist | que está en un estado bueno | 良い状態にある | que está em um estado bom |
| that fares well (BE_FARING + WELL) | that fares well | che sta bene | qui va bien | das gut geht | que está bien | よく過ごす | que está bem |
| that is well (BE + WELL) | that is well | che è bene | qui est bien | das gut ist | que es bien | よくある | que é bem |

Readings to judge on authoring:

1. **The proposed row says "fine" without *good* or *well*.** Japanese 問題がない is the everyday
   paraphrase of 大丈夫, German *keine Probleme* and French *pas de problèmes* take the negative
   determiner and the partitive their grammar asks for, and none of the seven says OKAY's own word
   (*okay, bene, bien, gut, bien*, 大丈夫, *bem*).
2. **"That is in a good state" is the runner-up**, and the seed's own description ("in a satisfactory
   state"). It renders in all seven, but GOOD is what OKAY is weaker than (*an okay film* is not a
   good one), and the Spanish and Portuguese postpose the adjective (*un estado bueno*, where *en buen
   estado* is the idiom). Either may ship; the proposed row is the closer paraphrase.
3. **The BE_FARING and WELL rows fail**: BE_FARING is the copula OKAY swaps in (E31), so "that fares
   well" says OKAY's own word in five languages (*sta bene, va bien, gut geht, está bien, está bem*);
   "that is well" is *è bene, es bien, é bem*, "it is good (that)", and よくある is "is common".
4. **DARK is the precedent** for a negated HAVE in a headless relative ("that does not have light",
   *che non ha luce*), shipped by B59.

## Mutual definitions

OKAY stands on BEING, HAVE and PROBLEM; PROBLEM stands on STATE, MUST and CHANGE. None names OKAY.
OKAY's lexemes name BE_FARING as their `copula`, but its gloss does not, so the two senses of
[C43](C43-senses-tell-order-and-be-faring.md) are untouched.

## Where the tooltip shows

OKAY is an ordinary adjective with no `slot`, so the adjective picker offers it (E31 Done item 4:
attributively as well as in the predicate) and the gloss is visible wherever the picker is.

## Not solved

Nothing: OKAY is the ticket's one concept. BE_FARING, the sense its copula names, is
[C43](C43-senses-tell-order-and-be-faring.md)'s.

## Coverage

A unit pin beside OKAY's predicate table in
[okay-predicate.test.ts](../../../packages/engine/test/okay-predicate.test.ts), and one row in
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored (OKAY in
English and Japanese, 問題がない). [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts)
must pass.

## Done

2026-09-24. Shipped the proposed row, **that does not have problems**, as
`subjectGapGloss('BEING', 'HAVE', { object: 'PROBLEM', number: 'plural', negative: true })` on the
OKAY block in [concepts/adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts). E31's
Done item 5 ("no plan says it without *good* or *well*") is overturned. Re-probed against the current
engine: every language matches the probe table.

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| that does not have problems | che non ha problemi | qui n'a pas de problèmes | das keine Probleme hat | que no tiene problemas | 問題がない | que não tem problemas |

- The backend boots clean with it, and `/api/concepts` serves all seven.
- Unit pin: "OKAY's definition" in
  [okay-predicate.test.ts](../../../packages/engine/test/okay-predicate.test.ts).
- e2e: "a negated HAVE in a headless relative (localize-seed A33: OKAY)" in
  [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), English and Japanese.
- [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts) passes. No
  engine change. BE_FARING stays on the literal ([C43](C43-senses-tell-order-and-be-faring.md)).
