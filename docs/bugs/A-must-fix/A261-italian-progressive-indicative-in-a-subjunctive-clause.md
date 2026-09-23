# A261. The Italian progressive keeps the indicative in a subjunctive clause

**Languages:** Italian

A subjunctive clause in the progressive writes its auxiliary *stare* in the indicative. The present
subjunctive is derived for the clause's own verb, and an auxiliary gets one only through an override
in [`mood.ts`](../../../packages/engine/src/mood.ts); A260 gave *avere* and French *avoir* theirs
(*abbia corso*, *ait couru*), and Italian `STARE_AUX` has none. So every subjunctive governor —
a negated belief, an evaluative predicate, *before* — says *sta correndo* where it wants *stia
correndo*.

| Case | Now | Want |
|---|---|---|
| the MAN does not BELIEVE that the CAT RUNs (progressive) | `l'uomo non crede che il gatto sta correndo.` | `l'uomo non crede che il gatto stia correndo.` |
| it is right that the CAT RUNs (progressive) | `è giusto che il gatto sta correndo.` | `è giusto che il gatto stia correndo.` |
| the MAN RUNs before the CAT RUNs (progressive) | `l'uomo corre prima che il gatto sta correndo.` | `l'uomo corre prima che il gatto stia correndo.` |

**Already right.** Under a past governor A254's shift writes the imperfect subjunctive
(`l'uomo non credeva che il gatto stesse correndo.`), and the other Romance languages' progressive
auxiliaries have their present subjunctive (`esté corriendo`, `esteja correndo`, `soit en train de
courir`).

**Shape of the fix.** A present-subjunctive override for `STARE_AUX` in `mood.ts` (*stia*, *stia*,
*stia*, *stiamo*, *stiate*, *stiano*), as A260 added for *avere* and *avoir*.

**Nothing shipped shows it**: no gloss has a progressive subjunctive clause.

Pinned by `known bugs: the Italian progressive keeps the indicative in a subjunctive clause (A261)`
in [content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts).

Found landing A254–A260, from a lead the A254/A260 lane reported.
