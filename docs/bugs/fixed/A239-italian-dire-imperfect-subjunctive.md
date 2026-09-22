# A239. Italian *dire* in the imperfect subjunctive is *dissimo*, not *dicessimo*

**Language:** Italian

The Italian imperfect subjunctive is built on the infinitive minus *-re*
([`IT_SUBJ_STEM` in mood.ts](../../../packages/engine/src/mood.ts)), with the contracted infinitives
overridden by concept id — PRODUCE is there, because *produrre* hides its Latin stem *produce-*.
SAY's *dire* is contracted the same way and has no row, so a protasis on SAY renders *dissimo*.

| Case | Now | Want |
|---|---|---|
| if WE SAY the WORD, the DOG would RUN | `se dissimo la parola, il cane correrebbe.` | `se dicessimo la parola, il cane correrebbe.` |

The imperfect **indicative** already knows the verb (`IT_IMPERF_CONTRACTED`: *diceva*), so the fix is
the same list, one row.

**Already right.** The conditional is built on the future stem and is correct (`se il cane corresse,
la donna direbbe la parola.`), and the six other languages are unaffected.

**Nothing shipped shows it**: a gloss is an infinitive citation, which never inflects for mood.

Pinned by `known bugs: Italian dire in the imperfect subjunctive (A239)` in
[saying-verbs.test.ts](../../../packages/engine/test/saying-verbs.test.ts).

Found seeding SAY for [B60](../../localization/done/B60-saying-and-thinking-verbs.md).

## Resolved

2026-09-22, with [A243](A243-italian-fare-imperfect-subjunctive.md), which is the same table's other
row. Rather than adding SAY to the concept-keyed `IT_SUBJ_STEM`,
[mood.ts](../../../packages/engine/src/mood.ts) now derives the Italian imperfect subjunctive from
the **lemma**-keyed list the imperfect indicative already read: `IT_IMPERF_CONTRACTED` was renamed
`IT_CONTRACTED_STEM`, moved up beside the subjunctive stems and wrapped in `itContractedStem`, which
both imperfects call. `IT_SUBJ_STEM` keeps only what neither rule gets right (BE, GIVE, STARE); the
DRINK and PRODUCE rows went away, since *bere* and *produrre* are in the list. A second concept on a
contracted infinitive now reaches the stem without a row of its own — which is exactly A243.

Renders the Want column: `se dicessimo la parola, il cane correrebbe.`

Guarded by *known bugs: Italian dire in the imperfect subjunctive (A239)* in
[saying-verbs.test.ts](../../../packages/engine/test/saying-verbs.test.ts), now four tests: the Want
row, the whole *dice-* paradigm, the conditional regression, and a regression that an uncontracted
infinitive keeps the plain rule and Spanish and French are untouched.
