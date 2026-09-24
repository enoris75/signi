# A362. A Japanese plural measure noun under *within*, *during* and *ago* reads as one

**Languages:** Japanese

[A348](../fixed/A348-japanese-plural-measure-noun-under-for-reads-as-one.md) made an unspecified
plural under *for* 何時間も / 何日も / 何年も, and its resolution kept the fix to *for*: "**Ruled:** only
*for*; within, during and ago keep their 一時間以内に, 一時間の間に, 一時間前に." That was a scope call
for the batch, not a product decision, and **it is overturned here**. Under the other measuring
relations a plural indefinite still counts as one, so *within hours* reads *within an hour*, and a
bare plural loses the count altogether (時間以内に, the defect
[A322](../fixed/A322-japanese-indefinite-measure-noun-drops-its-count.md) fixed for the singular).
An unspecified few there is 数 + the counter: 数時間以内に, 数時間の間に, 数時間前に, 数日, 数年.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs within HOURs (indefinite plural) | 猫は一時間以内に走ります。 | 猫は数時間以内に走ります。 |
| … during HOURs | 猫は一時間の間に走ります。 | 猫は数時間の間に走ります。 |
| … HOURs ago | 猫は一時間前に走ります。 | 猫は数時間前に走ります。 |
| … HOURs ago, in the past | 猫は一時間前に走りました。 | 猫は数時間前に走りました。 |
| … within / during / DAYs ago | 猫は一日以内に / 一日の間に / 一日前に走ります。 | 猫は数日以内に / 数日の間に / 数日前に走ります。 |
| … within / during / YEARs ago | 猫は一年以内に / 一年の間に / 一年前に走ります。 | 猫は数年以内に / 数年の間に / 数年前に走ります。 |
| … within / during / HOURs ago (bare plural) | 猫は時間以内に / 時間の間に / 時間前に走ります。 | 猫は数時間以内に / 数時間の間に / 数時間前に走ります。 |

**Already right.** The singular (一時間以内に, 一時間の間に, 一時間前に), *for hours* (何時間も走ります,
A348), and English (`within hours`, `during hours`, `hours ago`).

## Shape of the fix

[ja/jaMeasuredOnce.ts](../../../packages/engine/src/languages/ja/jaMeasuredOnce.ts) marks a plural
indefinite or bare measure noun as `many` under *for* only, and
[ja/jaCounted.ts](../../../packages/engine/src/languages/ja/jaCounted.ts) writes `many` as 何 + the
counter + も. Under *within*, *during* and *ago* the same plural (A348's `plural_unmarked`, left by
`resolveNounPhrase`) should be marked as a few, written 数 + the counter, with no も.

**Decisions for the fixer:**

- **A definite plural** (*for the hours*, now bare 猫は時間走ります). "The hours" names hours the
  context knows; Japanese has no clean count for that (その数時間?). Kept in A348's regression as it
  is; not pinned.
- **何時間も前に** (A348's other candidate) is "many hours ago", a stronger reading than *hours ago*;
  数時間前に is the plain one, and the one pinned.

| | |
|---|---|
| **Test** | `complements/temporal.test.ts` → *known bugs: a Japanese plural measure noun under within, during and ago reads as one (A362)* (3 `test.fails`: HOUR under the three relations and in the past, DAY and YEAR, the bare plural; plus a regression test for one hour, *for hours* and English). The three cells moved out of A348's regression test, which keeps the definite plural and the plural subject. |

Found from A348's Decisions ("candidates; not pinned"), 2026-09-24.

**Neighbouring leads, not filed here.** The other six under *within* and *during* with an
indefinite plural may read oddly too: `innerhalb Stunden`, `während Stunden`, `entro ore`,
`durante ore`, `d'ici des heures`. Not reviewed or reproduced as bugs; one ticket per topic.
