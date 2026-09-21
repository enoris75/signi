# A174. A German adjective after a plural possessive takes the strong ending

**Language:** German

A possessive determiner (`mein`, `ihr`, `unser`) is an *ein*-word and declines like `kein`. After
it, an adjective takes the mixed endings in the singular and the weak `-en` everywhere in the
plural: `meine großen Kater`, `meiner großen Hunde`. In the plural nominative, accusative and
genitive, the engine gives the strong endings instead (`meine große Kater`, `meiner großer Hunde`),
as if no determiner carried the case.

The German builders decline a phrase with a pronominal possessor as if it were `indefinite`:
[`nounPhrase.ts`](../../../packages/engine/src/languages/de/nounPhrase.ts),
[`complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
and [`agentPhrase.ts`](../../../packages/engine/src/languages/de/agentPhrase.ts) each hand
`adjPhrase` the determiner `'indefinite'` when the phrase has a pronominal possessor. In the singular that is right, because `ein` and `mein` share the
mixed endings. In the plural, [`endingsFor`](../../../packages/engine/src/languages/de/endingsFor.ts)
reads an `indefinite` plural as having no article at all (`große Kater`) and returns the strong
table.

| Case | Now | Want |
|---|---|---|
| nominative plural | `meine große Kater laufen.` | `meine großen Kater laufen.` |
| | `unsere große Kater laufen.` | `unsere großen Kater laufen.` |
| two adjectives | `ihre große braune Kater laufen.` | `ihre großen braunen Kater laufen.` |
| accusative plural | `der Hund sieht meine große Kater.` | `der Hund sieht meine großen Kater.` |
| accusative after `durch` | `der Hund läuft durch meine große Häuser.` | `der Hund läuft durch meine großen Häuser.` |
| genitive plural (possessor) | `das Buch meiner großer Hunde brennt.` | `das Buch meiner großen Hunde brennt.` |
| genitive plural (`wegen`) | `der Hund weint wegen meiner großer Kater.` | `der Hund weint wegen meiner großen Kater.` |
| the random phrase's subject | `ihre zahme am wenigsten schlechte Gefühle brennen.` | `ihre zahmen am wenigsten schlechten Gefühle brennen.` |
| the random phrase | `ihre zahme am wenigsten schlechte Gefühle haben jene …` | `ihre zahmen am wenigsten schlechten Gefühle haben jene …` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The singular in every case (`mein großer Kater`, `meinen großen Kater`, `mein
großes Buch`, `meines großen Katers`). The dative plural (`mit meinen großen Katern`, `zu meinen
großen Häusern`, the passive's `von meinen großen Katern`). A mass noun with a possessive (`mein
kaltes Wasser`). `kein`, which already declines weak in the plural (`keine großen Kater`).

Found by the random phrase "her domestic least bad feelings have not used that hungry lazy person
who an equally small animal starts like the least hungry phrase." (seed 942887). Its manner
complement also carries [A175](A175-superlative-under-an-indefinite-determiner.md), so the pin asserts
only the phrase's opening.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

Decline a phrase with a pronominal possessor as `no` in place of `indefinite` at the three call sites.
`endingsFor` already gives `no` the declension a possessive has: mixed in the singular, weak in the
plural and in the genitive. `adjPhrase`'s mass-noun guard (`!possessive`) is unaffected. Pulling the
choice into one helper beside `possessedHeadForms` would keep the three sites from drifting apart
again.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: German adjective after a plural possessive* (2 `test.fails`, plus a regression test for the cases already right) |
