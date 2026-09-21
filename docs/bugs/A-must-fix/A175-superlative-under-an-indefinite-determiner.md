# A175. A superlative under an indefinite or bare determiner keeps that determiner, outside English

**Languages:** Italian, French, German, Spanish, Portuguese

A relative superlative picks out one member of a set, so it is definite: "the biggest dog", never
"a biggest dog". [A25](../fixed/A25-english-superlative-indefinite-article.md) made English force
`the` when a superlative (`most` or `least`) meets an `indefinite` or `bare` determiner. The other
languages still take the determiner the plan picked. Each goes wrong in its own way:

- **Italian, Spanish and Portuguese** mark the superlative only with the definite article
  ([C01](../../C-do-not-fix/C01-italian-spanish-superlative-comparative-homophony.md)). Without it,
  the superlative turns into the comparative: `un cane più grande` says "a bigger dog".
- **French** keeps the second article but loses the first: `un chien le plus grand`, `comme phrase
  la moins affamée`.
- **German** declines a superlative under `ein` or no article at all: `einen größten Hund`, `größter
  Hund`.

| Case | Language | Now | Want |
|---|---|---|---|
| indefinite object, `most` | Italian | `il gatto vede un cane più grande.` | `il gatto vede il cane più grande.` |
| | French | `le chat voit un chien le plus grand.` | `le chat voit le chien le plus grand.` |
| | German | `der Kater sieht einen größten Hund.` | `der Kater sieht den größten Hund.` |
| | Spanish | `el gato ve un perro más grande.` | `el gato ve el perro más grande.` |
| | Portuguese | `o gato vê um cão maior.` | `o gato vê o cão maior.` |
| indefinite object, `least` | Italian | `il gatto vede un cane meno grande.` | `il gatto vede il cane meno grande.` |
| | German | `der Kater sieht einen am wenigsten großen Hund.` | `der Kater sieht den am wenigsten großen Hund.` |
| indefinite plural | French | `le chat voit des chiens les plus grands.` | `le chat voit les chiens les plus grands.` |
| | German | `der Kater sieht größte Hunde.` | `der Kater sieht die größten Hunde.` |
| | Spanish | `el gato ve unos perros más grandes.` | `el gato ve los perros más grandes.` |
| bare subject | Italian | `cane più grande corre.` | `il cane più grande corre.` |
| | German | `größter Hund läuft.` | `der größte Hund läuft.` |
| indefinite locative | Italian | `il gatto corre in una casa più grande.` | `il gatto corre nella casa più grande.` |
| | German | `der Kater läuft in einem größten Haus.` | `der Kater läuft im größten Haus.` |
| bare mass object | French | `le chat boit de l'eau la plus froide.` | `le chat boit l'eau la plus froide.` |
| | Portuguese | `o gato bebe água mais fria.` | `o gato bebe a água mais fria.` |
| predicative noun (indefinite by default) | Italian | `il gatto è un cane più grande.` | `il gatto è il cane più grande.` |
| | German | `der Kater ist ein größter Hund.` | `der Kater ist der größte Hund.` |
| the random phrase's manner (`bare`) | Italian | `… come frase meno affamata.` | `… come la frase meno affamata.` |
| | French | `… comme phrase la moins affamée.` | `… comme la phrase la moins affamée.` |
| | German | `… nicht wie am wenigsten hungrige Phrase verwendet.` | `… nicht wie die am wenigsten hungrige Phrase verwendet.` |
| | Spanish | `… como frase menos hambrienta.` | `… como la frase menos hambrienta.` |
| | Portuguese | `… como frase menos faminta.` | `… como a frase menos faminta.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** English, since A25 (`the cat sees the biggest dog.`). Japanese, which has no
articles (`猫は最も大きい犬を見ます。`). A comparative under an indefinite, which is grammatical (`un
cane più grande`, `einen größeren Hund`). A superlative that is already definite, or under a
demonstrative or a possessive (`il cane più grande`, `quel cane più grande`, `meinen größten Hund`).

Found by the random phrase "her domestic least bad feelings have not used that hungry lazy person
who an equally small animal starts like the least hungry phrase." (seed 942887). Its German subject
also carries [A174](A174-german-possessive-plural-adjective-ending.md), so the pin asserts only the
phrase's end.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

Resolve the determiner once, for every language, in
[`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts): when any
of the phrase's `adjectiveDegrees` is `most` or `least` and the picked determiner is `indefinite` or
`bare`, resolve it as `definite`. The trial does exactly that, before the `OTHER` rule reads the
picked value. English's own guard (`npHasSuperlative` in `determiner`) then has nothing left to do.
Keep it or retire it, since it now duplicates the translator.

**Decisions for the fixer:**

- **The quantifiers.** `some`, `many`, `few` and `all` stay as they are, as A25 left them for English
  (`the cat sees some biggest dogs.`, `einige größte Hunde`). Not pinned.
- **The measure manner.** `resolveComplements` forces a measure manner with an adjective to `bare`
  ("at high speed"). It runs after `resolveNounPhrase`, so a superlative there still goes bare ("at
  highest speed"). Not pinned.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: a superlative under an indefinite or bare determiner* (2 `test.fails`, plus a regression test for what is already right) |
