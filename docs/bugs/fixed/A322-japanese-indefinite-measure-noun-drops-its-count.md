# A322. A Japanese indefinite measure noun drops its count

**Languages:** Japanese

A Japanese measure noun whose counter is the noun itself (HOUR 時間, DAY 日: `counter` with
`counter_is_head: '1'`) says "one" with the numeral: 一時間, 一日. An article says nothing in Japanese,
so the indefinite *within an hour* / *for an hour* is 一時間以内に / 一時間走ります. That is what
`numeral: 1` already renders. The indefinite drops the count and leaves the bare noun: 時間以内に,
時間走ります, 日以内に, 日走ります. Those read "within time" and "runs time". Bare 時間 is TIME's own
word, so the hour is lost.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs within an HOUR | 猫は時間以内に走ります。 | 猫は一時間以内に走ります。 |
| … for an HOUR | 猫は時間走ります。 | 猫は一時間走ります。 |
| … within a DAY | 猫は日以内に走ります。 | 猫は一日以内に走ります。 |
| … for a DAY | 猫は日走ります。 | 猫は一日走ります。 |

**Already right.** `numeral: 1` (一時間以内に, 一時間走ります, 一日以内に). The six languages that say the
article (`within an hour`, `entro un'ora`, `d'ici une heure`, `innerhalb einer Stunde`, `dentro de una
hora`, `dentro de uma hora`).

**Two passing tests pin the defect.** P09-E34's 'within an hour' and P09-E35's 'for an hour' in
`complements/temporal.test.ts` assert 猫は時間以内に走ります and 猫は時間走ります. They move with the fix.
The `at` and `during` rows in 'is told apart from at and during' (時間に, 時間の間に) should move too if
the fix is general (一時間に reads oddly as a point in time, so the fixer may limit it to
`within` / `for` / `during`).

**Found by** the lanes landing P09-E34 and E35, re-verified at 48af1d35.

## Decisions for the fixer

- **Everywhere, or only in a measure.** Under `within` and `for` the noun is a measure, and 一 is
  wanted. As a subject or object (*an hour burns*, 時間は燃えます) the indefinite is not a measure, and
  inserting 一 there is odd (一時間は燃えます). The recommended scope is the measuring relations
  (`within`, `for`, `during`, `ago`), where the Japanese renderer already puts the counter on the numeral.
- **TIME.** `for a time` (TIME, 時間) also renders 猫は時間走ります. TIME has no counter, so it is out of
  scope. しばらく would be its natural rendering, which is a lexical question.

The site is Japanese's temporal measure (the branch that builds 以内に and the bare `for` measure in
[ja/npSegs.ts](../../../packages/engine/src/languages/ja/npSegs.ts) and the temporal complement). For a
`counter_is_head` noun it should treat an indefinite as `numeral: 1`.

| | |
|---|---|
| **Test** | `complements/temporal.test.ts` → *known bugs: a Japanese indefinite measure noun drops its count (A322)* (4 `test.fails`, one per row, plus a regression test for `numeral: 1` and the six languages' article) |

## Resolved

2026-09-24. Scope as decided: the measuring relations only (`within`, `for`, `during`, `ago`).
A new [ja/jaMeasuredOnce.ts](../../../packages/engine/src/languages/ja/jaMeasuredOnce.ts), called
from the temporal complement in [ja/complementSegs.ts](../../../packages/engine/src/languages/ja/complementSegs.ts),
gives an indefinite singular noun that is its own counter (`counter_join: 'head'`: HOUR, DAY)
`numeral: 1` under those four. So 一時間以内に, 一時間走ります, 一日の間に, 一時間前に. A point in time
(`at`: 時間に), a definite (日以内に), a subject or object (時間は燃えます) and TIME (猫は時間走ります) are
unchanged.

Four passing P09-E34/E35 tests in
[complements/temporal.test.ts](../../../packages/engine/test/complements/temporal.test.ts) moved with
the fix, by design: 'within an hour' (一時間以内に), 'for an hour' (一時間走ります), and the `during`
rows of 'is told apart from at and during' and 'is told apart from during' (一時間の間に).

Guarded by `known bugs: a Japanese indefinite measure noun drops its count (A322)` in the same file:
the four former `test.fails`, the regression test, and a new test for `during`, `ago`, and the
cases that stay bare; plus [jaMeasuredOnce.test.ts](../../../packages/engine/src/languages/ja/jaMeasuredOnce.test.ts).
