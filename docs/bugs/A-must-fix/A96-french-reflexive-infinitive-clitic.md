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
