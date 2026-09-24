# A348. A Japanese plural measure noun under *for* reads as one

**Languages:** Japanese

[A322](../fixed/A322-japanese-indefinite-measure-noun-drops-its-count.md) made an indefinite HOUR or
DAY count as one under the measuring relations: *for an hour* is 一時間走ります. A plural indefinite gets
the same count, so *for hours* reads *for an hour*; a bare plural gets none at all (時間走ります, the
defect A322 fixed for the singular). An unspecified number of hours, days or years under *for* is
何時間も / 何日も / 何年も ("for hours on end").

| Case | Now | Want |
|---|---|---|
| the CAT RUNs for HOURs (indefinite plural) | 猫は一時間走ります。 | 猫は何時間も走ります。 |
| … in the past | 猫は一時間走りました。 | 猫は何時間も走りました。 |
| … for DAYs | 猫は一日走ります。 | 猫は何日も走ります。 |
| … for YEARs | 猫は一年走ります。 | 猫は何年も走ります。 |
| … for HOURs (bare plural) | 猫は時間走ります。 | 猫は何時間も走ります。 |

**Already right.** The singular (一時間走ります) and a numeral (二時間走ります). The other six (`for
hours`, `per ore`, `pendant des heures`, `Stunden`, `durante unas horas`, `por umas horas`).

## Shape of the fix

Japanese's measure branch ([ja/jaMeasuredOnce.ts](../../../packages/engine/src/languages/ja/jaMeasuredOnce.ts),
called from [ja/complementSegs.ts](../../../packages/engine/src/languages/ja/complementSegs.ts)) counts
one without asking the number. A plural indefinite or bare measure noun under *for* should write 何 +
the counter + も instead. Check that the plural reaches the Japanese resolved forms: the lane that
found this reported it lost in `resolveNounPhrase` before Japanese sees it, since Japanese nouns do not
inflect.

**Decisions for the fixer:**

- **The other measuring relations.** *within hours* (一時間以内に now), *during hours* (一時間の間に) and
  *hours ago* (一時間前に) read as one too. 数時間以内に / 何時間も前に are candidates; not pinned.

| | |
|---|---|
| **Test** | `complements/temporal.test.ts` → *known bugs: a Japanese plural measure noun under for reads as one (A348)* (3 `test.fails`: HOUR present and past, DAY and YEAR, the bare plural; plus a regression test for one hour, two hours and the other six) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. The plural was lost as reported: `resolveNounPhrase` sets `number` back to `singular` for a
noun with no plural word, which is every Japanese noun. It now also leaves `plural_unmarked: '1'` on
such a head ([translator/functions/resolveNounPhrase.ts](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts),
additive). [ja/jaMeasuredOnce.ts](../../../packages/engine/src/languages/ja/jaMeasuredOnce.ts) marks a
plural indefinite or bare measure noun under *for* as `many`, and
[ja/jaCounted.ts](../../../packages/engine/src/languages/ja/jaCounted.ts) writes it 何 + the counter + も
in the head's place (何時間も走ります, 何日も, 何年も). **Ruled:** only *for*; within, during and ago keep
their 一時間以内に, 一時間の間に, 一時間前に.

Tests: the three `test.fails` in `complements/temporal.test.ts` (*known bugs: a Japanese plural measure
noun under for reads as one (A348)*) now pass, plus a case pinning the other measuring relations, a
definite plural and a plural subject as they were; `jaMeasuredOnce.test.ts`, `jaCounted.test.ts` and
`resolveNounPhrase.test.ts` cover `many` and `plural_unmarked`.
