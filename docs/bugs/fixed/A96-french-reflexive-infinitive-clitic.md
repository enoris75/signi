# A96. The French reflexive infinitive keeps "s'" for every person

**Language:** French

A reflexive infinitive agrees its clitic with the subject: `je dois m'effondrer`,
`nous sommes sur le point de nous effondrer`. It keeps the clitic in the infinitive perfect:
`il doit s'être effondré`. The finite paths handle this. The conjugated forms carry the clitic, and
`reflexiveFinite` restores it before the compound-past auxiliary. The non-finite paths do not:

- **progressive / prospective:** `aspectVerbFr` (`languages/fr/aspectVerbFr.ts`) takes the tail
  infinitive from the citation `base`, `s'effondrer`, for every person.
- **modal chain:** `verbGroupInfinitiveFr` (`languages/fr/verbGroupInfinitiveFr.ts`) also uses
  `base`, and its resultative `être` + participle has no clitic at all.

| Clause | Now | Want |
|---|---|---|
| FIRST_PERSON, MUST | `je dois s'effondrer.` | `je dois m'effondrer.` |
| SECOND_PERSON, MUST | `tu dois s'effondrer.` | `tu dois t'effondrer.` |
| FIRST_PERSON, progressive | `je suis en train de s'effondrer.` | `je suis en train de m'effondrer.` |
| FIRST_PERSON plural, prospective | `nous sommes sur le point de s'effondrer.` | `nous sommes sur le point de nous effondrer.` |
| CAT, MUST, resultative | `le chat doit être effondré.` | `le chat doit s'être effondré.` |

Already right: the third person (`le chat doit s'effondrer.`), the finite forms (`je m'effondre.`,
`la chatte s'est effondrée.`) and the citation infinitive (`s'effondrer.`).

**Snapshot:** `packages/engine/test/__snapshots__/verb.conjugation.test.ts.snap` records the current
output in 24 cells: COLLAPSE, 1st/2nd person singular and plural, progressive and prospective, e.g.
`nous serons en train de s'effondrer.`. They change with the fix. The 1st singular cells also show
the separate `je étais` elision defect.

## Shape of the fix

Factor the clitic agreement out of `reflexiveFinite`: strip `s'`/`se ` from the base and prepend
`FR_REFLEXIVE[auxKey(subject)]`, eliding before a vowel. Apply it to the infinitive in both
`aspectVerbFr` tails and in `verbGroupInfinitiveFr`, including before `être` in its resultative
(`s'être effondré`).

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: French reflexive infinitive* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with the shape the fix proposed, reusing `reflexiveFinite` rather than factoring it
apart. The new [`reflexiveInfinitive.ts`](../../../packages/engine/src/languages/fr/reflexiveInfinitive.ts)
strips `s'` / `se ` from the base and hands the bare infinitive to `reflexiveFinite`. That adds
`FR_REFLEXIVE[auxKey(subject)]` back, elided before a vowel. It is used in two places:

- [`aspectVerbFr.ts`](../../../packages/engine/src/languages/fr/aspectVerbFr.ts), for the progressive
  and prospective tails.
- [`verbGroupInfinitiveFr.ts`](../../../packages/engine/src/languages/fr/verbGroupInfinitiveFr.ts),
  for the modal chain. Its `être` resultative also goes through `reflexiveFinite`, giving
  `s'être effondré`.

Every row now renders as wanted. The fix also covers:
- every person of the modal perfect (`je dois m'être effondré`, `nous devons nous être effondrés`,
  `la chatte doit s'être effondrée`);
- stacked modals (`je veux pouvoir m'effondrer`) and a negation (`je ne dois pas m'effondrer`);
- a modal over the progressive (`je dois être en train de m'effondrer`).

Unchanged: the third person (`on doit s'effondrer`), the finite forms (`je m'effondre`, `la chatte
s'est effondrée`), the citation infinitive and a non-reflexive verb (`je dois avoir mangé`).

The 24 COLLAPSE cells in `verb.conjugation.test.ts.snap` were updated. A script confirmed each change
is only `s'effondrer` → the agreeing clitic.

- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *known
  bugs: French reflexive infinitive*. The pinning `test.fails` is now a passing `test`. New cases cover
  every person of the modal perfect, a stacked modal, a negation and a modal progressive, with a guard
  for the unchanged forms.
- Unit tests: the new `reflexiveInfinitive.test.ts`, plus `aspectVerbFr.test.ts` and
  `verbGroupInfinitiveFr.test.ts`.
