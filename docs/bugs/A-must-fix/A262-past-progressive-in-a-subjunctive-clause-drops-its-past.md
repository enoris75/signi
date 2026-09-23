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
