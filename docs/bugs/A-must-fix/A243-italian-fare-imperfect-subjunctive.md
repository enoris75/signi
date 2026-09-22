# A243. Italian *fare* in the imperfect subjunctive is *fasse*, not *facesse*

**Language:** Italian

The same table as [A239](A239-italian-dire-imperfect-subjunctive.md), the other contracted
infinitive: [`IT_SUBJ_STEM` in mood.ts](../../../packages/engine/src/mood.ts) derives the imperfect
subjunctive from the infinitive minus *-re*, and *fare* hides its Latin stem *face-*.

| Case | Now | Want |
|---|---|---|
| if the MAN MAKEs the WORK, the CAT would EAT | `se l'uomo fasse il lavoro, il gatto mangerebbe.` | `se l'uomo facesse il lavoro, il gatto mangerebbe.` |
| … the same with DO | `se l'uomo fasse il lavoro, …` | `se l'uomo facesse il lavoro, …` |

**This is MAKE's bug, and it was live before the P09 batch**; DO meets it because it shares *fare*.
One row in `IT_SUBJ_STEM` fixes both concepts, as PRODUCE's row does for *produrre*.

**Already right.** The conditional (`farebbe`) and the imperfect indicative (`faceva`) both know the
verb, and the other six languages are unaffected.

**Nothing shipped shows it**: a gloss is an infinitive citation.

Pinned by `known bugs: the Italian imperfect subjunctive of fare (A243)` in
[doing-verbs.test.ts](../../../packages/engine/test/doing-verbs.test.ts).

Found seeding DO for [B62](../../localization/done/B62-doing-working-playing.md).
