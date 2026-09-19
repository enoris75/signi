# A153. An Italian source that is a person or an animal reads as a goal

**Language:** Italian

Italian marks a source with `da`. An animate goal also takes `da`, the *andare da qualcuno*
construction: `il gatto va dal ragazzo` means "the cat goes to the boy", and
`direction.test.ts` pins that output as right. The ablative adverb `via` keeps the two apart, but B01
gave it to RUN and JUMP only. B01 assumed that COME and GO read `da` as an origin. That holds for a
place (`va dalla casa`). It does not hold for a person or an animal, so GO and COME say "to" where the
plan says "from":

| Clause | Now | Want |
|---|---|---|
| DOG GO, source the CHILD | `il cane va dal bambino.` | `il cane va via dal bambino.` |
| DOG COME, source the CHILD | `il cane viene dal bambino.` | `il cane viene via dal bambino.` |
| few GOOD OXen CAN not GO, source that less WHOLE COLD ANGEL | `pochi buoni buoi non possono andare da quell'angelo meno intero e freddo.` | `pochi buoni buoi non possono andare via da quell'angelo meno intero e freddo.` |
| for comparison, DOG GO, **direction** the CHILD | `il cane va dal bambino.` | (right) |

The same from/to collision appears in cases the test does not pin, because their target needs a
decision first:

- **MOVE_ONESELF**: `il cane si muove dal bambino` in both directions. `via` would disambiguate it, but
  `si allontana dal bambino` is what a speaker says.
- **The transitive MOVE, COPY and TRANSFER**: `il cane sposta il libro dal bambino` in both directions.
  `via` suits MOVE. For COPY and TRANSFER the direction side is probably what should change, since the
  *andare da* construction describes the subject moving, not something handed over.
- **A source and a direction together**: `il cane va dal bambino dall'uomo`.
- **A relative clause on the source**: `l'uomo dal quale il cane va corre`, which is also the output for a
  direction gap. The `via` would go after the verb (`da cui il cane va via`).

The other languages are not affected. French, Spanish and Portuguese mark an animate goal with
`vers` / `hacia` / `para`, so their `de` stays an origin. German is A154.

Found by reviewing the random phrase "few good oxen cannot go from that less whole cold angel".

## Shape of the fix

In [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts),
`sourceAdverb` comes from `SOURCE_ABLATIVE_ADVERB_VERBS` alone. Also emit `via` when the source's head is
animate (`nf['animate'] === '1'`). Do it inside `headFor`, per conjunct, the way `direction` already
picks `da` or `a` per conjunct. A place keeps B01's bare `da`. Update the `SOURCE_ABLATIVE_ADVERB_VERBS`
comment in [`functions.consts.ts`](../../../packages/engine/src/functions/functions.consts.ts), whose
premise ("COME/GO read their `source` as an origin") is only true for places.

| | |
|---|---|
| **Test** | `complements/source.test.ts` → *known bugs: Italian animate source reads as a goal* (1 `test.fails`, plus a regression test: RUN keeps `via`, a place stays bare, and the animate goal keeps `da`) |
