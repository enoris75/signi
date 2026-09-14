# A143. German ADD takes its goal with "in"

**Language:** German

An inanimate terminus in German takes "in" + accusative, the app's default for a goal
(`complementsPhrase`). That fits putting a thing into a container: "speichert das Buch in den Behälter".
ADD is *hinzufügen* (A138), which adds a thing TO something. Its goal takes "zu" + dative: "fügt das
Buch zum Behälter hinzu". With "in" the clause reads like "puts it into the container, in addition".

| Clause | Now | Want |
|---|---|---|
| de: CAT ADD the BOOK to the CONTAINER | `der Kater fügt das Buch in den Behälter hinzu.` | `der Kater fügt das Buch zum Behälter hinzu.` |
| de: … to the CONDITION | `der Kater fügt das Buch in die Bedingung hinzu.` | `der Kater fügt das Buch zur Bedingung hinzu.` |
| de: … to a CONTAINER | `der Kater fügt das Buch in einen Behälter hinzu.` | `der Kater fügt das Buch zu einem Behälter hinzu.` |
| de: … to the HOUSEs | `der Kater fügt das Buch in die Häuser hinzu.` | `der Kater fügt das Buch zu den Häusern hinzu.` |
| de: the CONTAINER the CAT ADDs the BOOK to RUNs | `der Behälter, in den der Kater das Buch hinzufügt, läuft.` | `der Behälter, zu dem der Kater das Buch hinzufügt, läuft.` |

Already right:
- SAVE, EXPORT and SEND keep "in" (`speichert das Buch in den Behälter`).
- A person recipient keeps the bare dative (`fügt dem Hund das Buch hinzu`).
- The other six languages (`adds the book to the container`, `aggiunge il libro al contenitore`).

No UI string adds to a goal today.

Found while fixing A138.

## Shape of the fix

`complements/terminus.test.ts` already says which preposition an inanimate goal takes "depends on the
verb". So the preposition belongs on the verb's German forms, like A139's `object_prep`: say
`terminus_prep: 'zu'` on ADD's lexeme. The German terminus branch then renders it with its case and its
fusion (`prepDet('zu', …, 'dat')` gives *zum* / *zur*). "in" stays the default.

A relative on the goal renders its pronoun through `complementsPhrase(gap)` with no verb forms
(`subordinateClause`), so the verb's forms must reach that call too.

The passing test *German marks an inanimate terminus with a preposition* no longer lists ADD; these tests
cover it.

Not pinned: "nicht" follows the goal (`fügte das Buch in den Behälter nicht hinzu`), where German puts it
before a directional phrase. That is the terminus's placement for every verb (SAVE too), not ADD's
preposition.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: German ADD takes its goal with zu* (2 `test.fails`, plus a regression test for SAVE and a person recipient) |
