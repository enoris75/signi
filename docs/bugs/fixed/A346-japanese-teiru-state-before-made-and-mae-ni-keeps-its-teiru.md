# A346. A Japanese ている state before まで and 前に keeps its ている

**Languages:** Japanese

[A323](../fixed/A323-japanese-na-adjective-predicate-takes-na-before-made-and-mae-ni.md) named this
case in its "Related, not pinned" list: a 〜ている state verb gives 犬が疲れているまで, where 疲れるまで is
natural, and "take them along if the ruling is 〜になる". The ruling was 〜になる (the state reached),
but the fix left the ている state as it was. TIRED is a た-adjective whose predicate is 疲れている; the
state reached is the bare verb 疲れる, "until the dog gets tired".

| Case | Now | Want |
|---|---|---|
| the CAT RUNs until the DOG is TIRED | 猫は犬が疲れているまで走ります。 | 猫は犬が疲れるまで走ります。 |
| … before the DOG is TIRED | 猫は犬が疲れている前に走ります。 | 猫は犬が疲れる前に走ります。 |

**Already right.** 時に keeps the state (猫は犬が疲れている時に走ります。). The other six (`until the dog is
tired`, `bis der Hund müde ist`, `jusqu'à ce que le chien soit fatigué`).

## Shape of the fix

Where A323's `reach` value reaches the predicate ([ja/predicateSegs.ts](../../../packages/engine/src/languages/ja/predicateSegs.ts)),
a た-adjective (and any held ている state) under `reach` should take its verb's dictionary form, with
the clause's tense, instead of the 〜ている form.

| | |
|---|---|
| **Test** | `adverbial-clause.test.ts` → *known bugs: a Japanese ている state before まで and 前に keeps its ている (A346)* (2 `test.fails`: まで and 前に; plus a regression test for 時に and the other six) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. Under `reach` a た-adjective takes its verb's dictionary form in the present (疲れるまで,
疲れる前に) and its plain past in the past (疲れた). The verb is read back from the stored plain past by
the new [ja/jaStateVerb.ts](../../../packages/engine/src/languages/ja/jaStateVerb.ts), which reads only
the unambiguous endings (ichidan 〜る, a compound's or と's 〜する, godan 〜いた / 〜いだ); an ambiguous
past (〜った, 〜んだ, a single kanji before した) keeps the 〜ている state. Wired in
[ja/copulaSegs.ts](../../../packages/engine/src/languages/ja/copulaSegs.ts), not predicateSegs: the
た-adjective predicate is the copula's `ta` class. A held-state verb (HAVE, KNOW) under まで / 前に already
kept the dictionary form (持つまで).

Tests: the two `test.fails` in `adverbial-clause.test.ts` (*known bugs: a Japanese ている state before まで
and 前に keeps its ている (A346)*) now pass, plus a new case for CLOSED, UNCONNECTED and OPEN_ADJECTIVE
(閉じるまで, 孤立するまで, 開くまで); `jaStateVerb.test.ts`; `copulaSegs.test.ts`'s reach case now
asserts 疲れる / 疲れた.
