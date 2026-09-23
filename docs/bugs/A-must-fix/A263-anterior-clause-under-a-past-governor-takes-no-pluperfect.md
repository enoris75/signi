# A263. A clause anterior to a past governor takes no pluperfect

**Languages:** English, Italian, French, Spanish, Portuguese

A254 shifts a present or future clause under a past governor and, as ruled, leaves a past or
resultative one alone. A clause anterior to a past governor wants the pluperfect, so what it is left
with is wrong in two ways: a past clause in the subjunctive falls back to the **present** subjunctive
(`non credeva che il gatto corra`, the A260 defect under a past governor), and a resultative keeps the
present perfect (`said that the cat has run`).

| Case | Now | Want |
|---|---|---|
| the MAN did not BELIEVE (past) that the CAT RAN (it) | `l'uomo non credeva che il gatto corra.` | `l'uomo non credeva che il gatto avesse corso.` |
| … fr / es / pt | `que le chat coure` / `que el gato corra` / `que o gato corra` | `ait couru` / `hubiera corrido` / `tivesse corrido` |
| the MAN SAID that the CAT RUNs (resultative) (en) | `the man said that the cat has run.` | `the man said that the cat had run.` |
| … it / fr | `disse che il gatto ha corso` / `dit que le chat a couru` | `aveva corso` / `avait couru` |
| … es / pt | `dijo que el gato ha corrido` / `disse que o gato correu` | `había corrido` / `tinha corrido` |
| the MAN did not BELIEVE (past) that the CAT RUNs (resultative) (en / it) | `did not believe that the cat has run` / `non credeva che il gatto abbia corso` | `had run` / `avesse corso` |
| … es / pt | `no creía que el gato haya corrido` / `não acreditava que o gato tenha corrido` | `hubiera corrido` / `tivesse corrido` |

The **Want** column is written by hand. French keeps the perfect subjunctive of speech under a past
governor (`ne croyait pas que le chat ait couru`, already right for the resultative), as A254 kept
its present subjunctive. A plain past **indicative** clause under a past governor is not pinned:
`the man said that the cat ran.` and `disse che il gatto corse` are grammatical, the pluperfect
(*had run*, *era corso*) being the stricter reading.

**Already right.** German (`der Mann sagte, dass der Kater gelaufen ist.`, its tenses do not agree)
and Japanese (`男は猫が走ったと言いました。`).

**Shape of the fix.** In `contentClauseTense`, a past-neutral or resultative clause under a past
governor takes the resultative in the past: the aspect auxiliary in the imperfect (indicative) or the
imperfect subjunctive, plus the participle — *aveva corso*, *avesse corso*, *había corrido*,
*hubiera corrido* — and English *had*.

**Nothing shipped shows it**: no gloss has a content clause under a past governor.

Pinned by `known bugs: a clause anterior to a past governor takes no pluperfect (A263)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts).

Found landing A254–A260; the case both A254 and A260 left to the other.
