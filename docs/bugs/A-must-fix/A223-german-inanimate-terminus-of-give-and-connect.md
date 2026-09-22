# A223. A German inanimate terminus of GIVE and CONNECT takes "in" + the accusative

**Language:** German

[A16](../fixed/A16-german-inanimate-terminus-dative.md) split the German terminus on animacy. A person
or an animal is a recipient, the bare dative ahead of the object (*gibt dem Hund das Buch*); a thing
is a destination, "in" + the accusative behind it (*speichert das Buch in den Behälter*), because the
bare dative would read as *giving* the book to the container. Which preposition a destination takes
is the verb's: [A143](../fixed/A143-german-add-goal-takes-zu.md) let a verb's lexeme name it,
`terminus_prep` (ADD's *zu*, LINK's *mit*).

Two verbs are left on the default that is not theirs:

- **GIVE.** *geben* takes a dative object whatever it names — one gives a value *to* an option,
  *gibt der Option den Wert*, the way one *gibt dem Projekt einen Namen*. "in" + the accusative says
  the value is put *into* the option. For *geben* the thing the bare dative "would read as" is the
  meaning.
- **CONNECT.** Its German is *verbinden*, the verb LINK already joins *with* (*verbindet den Knoten
  mit einem anderen Knoten*), but CONNECT's lexeme names no `terminus_prep`, so the same verb joins
  *into* (*in einen anderen Knoten*).

The choice is made in the terminus branch of
[`complementsParts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
and in [`splitDative`](../../../packages/engine/src/languages/de/splitDative.ts), which hoists only an
animate recipient.

| Case | Now | Want |
|---|---|---|
| the PERSON GIVEs the VALUE to the OPTION | `die Person gibt den Wert in die Option.` | `die Person gibt der Option den Wert.` |
| … to an OPTION | `die Person gibt den Wert in eine Option.` | `die Person gibt einer Option den Wert.` |
| … to the OPTIONS | `die Person gibt den Wert in die Optionen.` | `die Person gibt den Optionen den Wert.` |
| … past | `die Person gab den Wert in die Option.` | `die Person gab der Option den Wert.` |
| … resultative | `die Person hat den Wert in die Option gegeben.` | `die Person hat der Option den Wert gegeben.` |
| … negative | `die Person gibt den Wert nicht in die Option.` | `die Person gibt der Option den Wert nicht.` |
| the OPTION to which the PERSON GIVEs the VALUE | `die Option, in die die Person den Wert gibt.` | `die Option, der die Person den Wert gibt.` |
| to give a value to an option (citation) | `einen Wert in eine Option geben.` | `einer Option einen Wert geben.` |
| give the value to the option! | `gib den Wert in die Option.` | `gib der Option den Wert.` |
| the MAN GIVEs the BOOK to it (neuter pronoun) | `der Mann gibt das Buch in es.` | `der Mann gibt ihm das Buch.` |
| the PERSON CONNECTs the NODE to another NODE | `die Person verbindet den Knoten in einen anderen Knoten.` | `die Person verbindet den Knoten mit einem anderen Knoten.` |
| … to the NODES | `die Person verbindet den Knoten in die Knoten.` | `die Person verbindet den Knoten mit den Knoten.` |
| … past | `die Person verband den Knoten in einen anderen Knoten.` | `die Person verband den Knoten mit einem anderen Knoten.` |
| the NODE to which the PERSON CONNECTs a NODE | `der Knoten, in den die Person einen Knoten verbindet.` | `der Knoten, mit dem die Person einen Knoten verbindet.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.
For GIVE the bare dative is German's own construction (*jemandem etwas geben*); *gibt den Wert an die
Option* is *weitergeben an*, handing it on, which is not what GIVE says.

**Already right.** A living recipient (`die Person gibt dem Hund den Wert.`). LINK (`die Person
verbindet den Knoten mit einem anderen Knoten.`). The destinations of SAVE, EXPORT and ADD (`der
Kater speichert das Buch in den Behälter.`, `der Kater fügt das Buch zum Behälter hinzu.`). The other
six languages mark a recipient and a destination alike (`the person gives the value to the option.`,
`la persona dà il valore all'opzione.`, `la personne donne la valeur à l'option.`, `la persona da el
valor a la opción.`, `人は選択肢に値をあげます。`, `a pessoa dá o valor à opção.`).

**Nothing shipped shows it.** GIVE's gloss gives to a person (`einer Person Gegenstände übertragen`),
and SEND's sends to a place with the direction's *zu*.

Found authoring the C23–C28 localization sweep. Spanish LINK (*enlaza X a Y*, where *enlazar X con Y* is the classical
collocation) was reported beside it and is not filed: *enlazar a* is current Spanish, above all in
computing. If the product wants *con*, a Spanish `terminus_prep` read the way the German one is would
say it.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green apart from the three passing tests listed below.

- **CONNECT** is corpus only: `terminus_prep: 'mit'` on its de lexeme in
  [`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts), as LINK has.
- **GIVE** needs the lexeme to say that its terminus is a dative object whatever it is. The trial
  seeded `terminus_dative: '1'` on *geben* in
  [`ditransitive.ts`](../../../packages/backend/src/concepts/verbs/ditransitive.ts). `splitDative`
  takes the verb's forms and hoists the terminus when it is animate **or** the verb says
  `terminus_dative`; its two callers (`renderClause`, `subordinateClause`) pass them, and pass them on
  to the `complementsPhrase(dative, …)` that renders the slot, whose terminus branch writes the bare
  dative on the same test.

**Passing tests the fix moves.** Each uses GIVE with an inanimate goal for another purpose, and each
takes the **Want**:

- `adjectives.test.ts` → *known bugs: an adjective on a place name* → *the article comes back after
  every preposition, and after a relation*: `der Kater gibt das Buch ins große Asien.` becomes `der
  Kater gibt dem großen Asien das Buch.` The row tests the article after a preposition, so the fixer
  may prefer to move it onto SAVE.
- `negation.test.ts` → *known bugs: German "nicht" and a prepositional complement* → *"nicht" leads
  every complement that carries a preposition*: `der Mann gibt das Buch nicht ins Haus.` becomes `der
  Mann gibt dem Haus das Buch nicht.` The same: the row is about the preposition, and SAVE keeps one.
- `complements/comitative.test.ts` → *known bugs: a pronoun in the other adposition-bearing
  complements* → *a personal pronoun takes the animate branch, and a neuter one does not*: `der Mann
  gibt das Buch in es.` becomes `der Mann gibt ihm das Buch.`, and so, under this trial, does the
  masculine row next to it (`der Mann gibt das Buch ihm.`), which is
  [A229](A229-german-dative-pronoun-trails-the-object.md)'s.

**Decisions for the fixer:**

- **The flag.** `terminus_dative` says what the verb's terminus is rather than naming a preposition,
  so it sits beside `terminus_prep` rather than in it. SHOW (*zeigt der Option den Wert*) and SEND
  (*schickt der Firma den Brief*) take a dative of a thing too; SEND to a MARKET is pinned as `in den
  Markt` by A16's own test. Not pinned.
- **LINK and CONNECT to a person.** `verbindet dem Mann den Knoten` (both verbs, today and under the
  trial) should be `mit dem Mann`: a `terminus_prep` of *mit* is a partner, not a recipient, so it
  could win over animacy there, where ADD's *zu* does not (A143 keeps *fügt dem Hund das Buch hinzu*).
  Not pinned.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: a German inanimate terminus of GIVE and CONNECT takes "in" (A223)* (1 `test.fails`, plus a regression test for a living recipient, LINK, the goals of SAVE and ADD, and the other six) |
