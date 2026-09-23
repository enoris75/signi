# A260. A subjunctive content clause drops its own past

**Languages:** Italian, French, Spanish, Portuguese

A subjunctive content clause is resolved in `presentSubjunctive`
([`contentClauseMood`](../../../packages/engine/src/translator/functions/contentClauseMood.ts),
`CONTENT_CLAUSE_MOOD` in [`translator.consts.ts`](../../../packages/engine/src/translator/translator.consts.ts)),
which every Romance engine builds from the stored present whatever the clause's own tense is. A past
clause loses its past, so "believes that the cat ran" says "believes that the cat runs". A past
clause under a present governor takes the perfect subjunctive.

| Case | Now | Want |
|---|---|---|
| the MAN does not BELIEVE that the CAT RAN (it) | `l'uomo non crede che il gatto corra.` | `l'uomo non crede che il gatto abbia corso.` |
| … fr | `l'homme ne croit pas que le chat coure.` | `l'homme ne croit pas que le chat ait couru.` |
| … es | `el hombre no cree que el gato corra.` | `el hombre no cree que el gato haya corrido.` |
| … pt | `o homem não acredita que o gato corra.` | `o homem não acredita que o gato tenha corrido.` |
| the MAN BELIEVEs that the CAT RAN (it) | `l'uomo crede che il gatto corra.` | `l'uomo crede che il gatto abbia corso.` |
| it is right that the CAT RAN (it / fr / es / pt) | `che il gatto corra` / `que le chat coure` / `que el gato corra` / `que o gato corra` | `abbia corso` / `ait couru` / `haya corrido` / `tenha corrido` |

The **Want** column is written by hand. Italian *correre* without a goal takes *avere*. Spanish
*corriera* is also right for a past event and is the fix's alternative; the perfect is taken because
the governor is present. A **future** clause under a subjunctive governor keeps the present
subjunctive, which carries a future reading in all four (`no cree que el gato corra`); that is right
and is not pinned.

**Already right.** The indicative keeps its past (`el hombre cree que el gato corrió.`,
`o homem acredita que o gato correu.`), and English, German and Japanese
(`the man believes that the cat ran.`, `der Mann glaubt, dass der Kater lief.`,
`男は猫が走ったと信じています。`).

**Shape of the fix.** Where `resolvePhrase` resolves a content clause in `presentSubjunctive`, a past
clause takes the perfect subjunctive instead: the aspect auxiliary in the present subjunctive and the
participle, which the engines already build for a resultative in a subjunctive clause (`haya comido`,
`tiver comido`, A252). Distinct from A254, which shifts a clause under a **past** governor; a past
clause under a past governor (`avesse corso`, the pluperfect subjunctive) is left to that fix.

**Nothing shipped shows it**: no gloss has a past content clause.

Pinned by `known bugs: a subjunctive content clause drops its own past (A260)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts).

Found while reproducing A254.
