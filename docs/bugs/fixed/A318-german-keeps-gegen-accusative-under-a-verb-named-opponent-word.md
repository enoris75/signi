# A318. German keeps gegen's accusative under a verb-named opponent word

**Languages:** German

The opponent complement ([P09-E22](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E22-adversarial-against.md))
lets a verb name its own word for the opponent in its lexeme (`opponent_prep`, read by
`opponentLink`), as 戦う takes と in Japanese. German takes the word, but still puts the noun in the
accusative that its generic *gegen* governs. A dative preposition then governs an accusative.

| Case | Now | Want |
|---|---|---|
| CAT PLAYs, opponent DOG, `opponent_prep: 'mit'` | `der Kater spielt mit den Hund.` | `der Kater spielt mit dem Hund.` |
| … WOMAN | `der Kater spielt mit die Frau.` | `der Kater spielt mit der Frau.` |
| … DOG plural | `der Kater spielt mit die Hunde.` | `der Kater spielt mit den Hunden.` |
| … a DOG | `der Kater spielt mit einen Hund.` | `der Kater spielt mit einem Hund.` |
| … him | `der Kater spielt mit ihn.` | `der Kater spielt mit ihm.` |

**Why this target.** The case belongs to the preposition, not to the relation: *mit* governs the
dative. Every Want is what the comitative already writes for the same phrase (`der Kater spielt mit
dem Hund.`), so no string was written by hand.

**Already right.** The generic opponent (`der Kater spielt gegen den Hund.`), and the override in the
other languages (English *with*, Italian *con* and the fusing *a*: *al cane*), pinned in the same
file.

**Latent.** No seeded verb names an `opponent_prep` in German yet. It shows only through the test's
stand-in lexeme (`TEST_PLAY` in opponent.test.ts), so no app sentence renders it today.

**Shape of the fix.** In
[de/complementsPhrase/complementsPhrase.ts](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
(about L202), the opponent branch sets `_case = 'acc'` whatever `c.link` holds. It should take the
case from the preposition, as the prepositional object does (`objectPrepCase`,
`DATIVE_PREPOSITIONS`), and keep the accusative for the generic *gegen*.

Pinned by `known bugs: German keeps gegen's accusative under a verb-named opponent word (A318)` in
[opponent.test.ts](../../../packages/engine/test/complements/opponent.test.ts).

Found on 2026-09-24 by the P09-E22 coverage lane, which dropped its German override test on it.

## Resolved

2026-09-24. [`de/complementsPhrase/complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts),
the opponent branch: the case is now the preposition's, `objectPrepCase(c.link || 'gegen')`, as the
prepositional object's is. The generic *gegen* keeps the accusative.

The two `test.fails` in [opponent.test.ts](../../../packages/engine/test/complements/opponent.test.ts)
(*known bugs: German keeps gegen's accusative under a verb-named opponent word (A318)*) are plain
tests now, assertions unchanged. Added in the same block: *von* and *zu* fusing with the dative (*vom
Hund*, *zum Hund*), *um* keeping the accusative, a `no` opponent (*mit keinem Hund*) and a
coordination (*mit dem Hund und mit der Frau*).

Still latent, as before: no seeded German verb names an `opponent_prep`. Noticed, not fixed: the
opponent question and relative clause ignore a verb-named word (*gegen wen spielt der Kater?*, *der
Hund, gegen den der Kater spielt*, under `opponent_prep: 'mit'`).

