# A148. ANGEL is not marked a person

**Languages:** Spanish, English (a corpus entry, not the grammar)

ANGEL in [`concepts/nouns.ts`](../../../packages/backend/src/concepts/nouns.ts) is seeded
`animate: true` but not `human: true`. `human` is the concept-level personhood flag. The schema in
[`db.ts`](../../../packages/backend/src/db.ts) glosses it "1 if the referent is a person", and the
lexicon surfaces it on the forms. Two rules read it, and both treat the angel as a thing:

| Clause | Now | Want |
|---|---|---|
| es: CAT SEE the ANGEL | `el gato ve el ángel.` | `el gato ve al ángel.` |
| es: that MAN LOVE this ANGEL, past | `ese hombre amaba este ángel.` | `ese hombre amaba a este ángel.` |
| en: the ANGEL that SEEs the CAT RUNs | `the angel that sees the cat runs.` | `the angel who sees the cat runs.` |

- **Spanish** takes the personal `a` on a person with a determiner (A98,
  [`takesPersonalA.ts`](../../../packages/engine/src/languages/es/takesPersonalA.ts)). An angel is a
  person there: `amar a Dios`, `ver a un ángel`.
- **English** relativises a person with `who` (A7,
  [`relativeText.ts`](../../../packages/engine/src/languages/en/relativeText.ts)). `the angel who` is
  the usual choice.

The engine needs no change. Portuguese takes no personal `a` (`o gato vê o anjo`) and is right. The
Japanese いる/ある choice reads `animate`, which is set, so it is right too.

Found by reviewing the rendered phrase "that man was never about to love this angel"
(`ese hombre nunca estaba a punto de amar este ángel`).

## Shape of the fix

Add `human: true` to ANGEL and reseed. Nothing else in the engine reads `human`.

Expect ANGEL in other suites to follow: any Spanish object or English relative on an angel will
change. `hypothetical.test.ts.snap` has one ANGEL cell (the fully-loaded conditional). ANGEL is the
main-clause subject there, which neither rule touches, so it should not change.

The other animate nouns without `human` are animals, plus CREATOR and POSSESSOR, which are glossed
"someone or something" and are left as they are.

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: ANGEL is a person* (2 `test.fails`, plus a regression test for Portuguese) |
