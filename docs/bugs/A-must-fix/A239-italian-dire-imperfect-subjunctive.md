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
