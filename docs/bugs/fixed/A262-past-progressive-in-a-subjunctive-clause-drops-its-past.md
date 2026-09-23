# A262. A past progressive in a subjunctive clause drops its past

**Languages:** Italian, Spanish, Portuguese (French open)

A260 gave a past clause under a present subjunctive governor the perfect subjunctive, but only in
the neutral aspect. A past progressive still builds its auxiliary in the present subjunctive (or, in
Italian, the indicative, A261), so "does not believe that the cat was running" says "is running".

| Case | Now | Want |
|---|---|---|
| the MAN does not BELIEVE that the CAT RAN (progressive) (it) | `l'uomo non crede che il gatto stava correndo.` | `l'uomo non crede che il gatto stesse correndo.` |
| … es | `el hombre no cree que el gato esté corriendo.` | `el hombre no cree que el gato estuviera corriendo.` |
| … pt | `o homem não acredita que o gato esteja correndo.` | `o homem não acredita que o gato estivesse correndo.` |
| … fr | `l'homme ne croit pas que le chat soit en train de courir.` | open (see below) |

The **Want** column is written by hand, and it is a judgment call. A past progressive is imperfective,
so the auxiliary takes the imperfect subjunctive — the tense a past progressive under a past governor
already gets from A254 (`non credeva che il gatto stesse correndo`) — rather than the perfect
subjunctive A260 chose for a completed event (*haya estado corriendo* is grammatical but reads as a
finished stretch). **French is left open**: the imperfect subjunctive is literary (*fût en train de
courir*) and *ait été en train de courir* is heavy; the pin leaves French out until a target is decided.

**Already right.** English, German and Japanese (`the man does not believe that the cat was
running.`, `男は猫が走っていたと信じていません。`), and the neutral past (`non crede che il gatto abbia
corso`, A260).

**Shape of the fix.** Where A260's `contentClauseTense` turns a past neutral clause into the perfect
subjunctive, a past progressive takes the imperfect subjunctive of its auxiliary instead.

**Nothing shipped shows it**: no gloss has a past progressive content clause.

Pinned by `known bugs: a past progressive in a subjunctive clause drops its past (A262)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts).

Found landing A254–A260, from a lead the A254/A260 lane reported.

## Resolved

2026-09-23. [`contentClauseTense`](../../../packages/engine/src/translator/functions/contentClauseTense.ts)
now turns a **past progressive** clause in the `presentSubjunctive` under a governor that is not past
into the present progressive in the imperfect subjunctive (`'subjunctive'`), in the
`PAST_SUBJUNCTIVE_LANGUAGES` (Italian, Spanish, Portuguese) — the shape A254 already gives a
progressive under a past governor: `stesse correndo`, `estuviera corriendo`, `estivesse correndo`.
**French is ruled out** and left as it was (`ne croit pas que le chat soit en train de courir`,
unpinned); a past prospective is left as it was too.

Guarded by the formerly-`.fails` test and two new ones in the
`known bugs: a past progressive in a subjunctive clause drops its past (A262)` block of
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts) (the plural, an
evaluative predicate, and an indicative clause keeping its imperfect progressive), and the A262 case
in [contentClauseTense.test.ts](../../../packages/engine/src/translator/functions/contentClauseTense.test.ts),
whose A260 case now checks a past prospective where it checked the past progressive.

**Under a past governor too** (2026-09-23, follow-up ruling). The same defect under a past subjunctive
governor (`non credeva che il gatto stia correndo`, `no creía que el gato esté corriendo`, `não
acreditava que o gato esteja correndo`) is fixed in `anteriorToPast`, the A263 helper in
`contentClauseTense`: a past progressive in the `presentSubjunctive` takes the imperfect subjunctive of
its auxiliary in Italian, Spanish and Portuguese — `stesse correndo`, `estuviera corriendo`,
`estivesse correndo`. French is again untouched and unpinned. Guarded by the `under a past governor
too` test in the A262 block of [content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts)
(singular and plural) and the past-governor A262 case in
[contentClauseTense.test.ts](../../../packages/engine/src/translator/functions/contentClauseTense.test.ts),
whose A263 case now checks a past prospective where it checked the past progressive.
