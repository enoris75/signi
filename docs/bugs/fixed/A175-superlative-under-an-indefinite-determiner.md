# A175. A superlative under an indefinite or bare determiner keeps that determiner, outside English

**Languages:** Italian, French, German, Spanish, Portuguese

A relative superlative picks out one member of a set, so it is definite: "the biggest dog", never
"a biggest dog". [A25](A25-english-superlative-indefinite-article.md) made English force
`the` when a superlative (`most` or `least`) meets an `indefinite` or `bare` determiner. The other
languages still take the determiner the plan picked. Each goes wrong in its own way:

- **Italian, Spanish and Portuguese** mark the superlative only with the definite article
  ([C01](../C-do-not-fix/C01-italian-spanish-superlative-comparative-homophony.md)). Without it,
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

## Resolved

2026-09-21. Took the shape above.

- **The translator.** [`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
  resolves a noun phrase as `definite` when one of its adjectives carries `most` or `least` and the
  picked determiner is `indefinite` or `bare`. This runs before the `OTHER` rule reads the picked
  value, so Spanish and Portuguese keep the article in `el otro perro más grande`. Only a degree that
  an adjective carries counts. The two sets it reads, `SUPERLATIVE_DEGREES` and
  `SUPERLATIVE_MAKES_DEFINITE`, are in
  [`translator.consts.ts`](../../../packages/engine/src/translator/translator.consts.ts). No language
  engine changed.
- **English's own guard is kept.** `npHasSuperlative` and the `superlative` branch of
  [`en/determiner.ts`](../../../packages/engine/src/languages/en/determiner.ts) now repeat the
  translator for every plan `resolveNounPhrase` resolves. With the guard disabled, every A25
  sentence test in `adjectives.test.ts` still passed. But two paths set the determiner to `bare`
  after `resolveNounPhrase`, and English still needs the guard on both:
  - the measure manner, which `resolveComplements` makes bare: `the cat runs at the highest speed.`
    became `at highest speed`;
  - English's shouted alarm, which `predicateParts` makes bare: `the boy cries the biggest wolf.`
    became `cries biggest wolf`.

  Five colocated unit tests (`determiner`, `nounPhrase`, `npText`, `subjectPhrase`,
  `possessorPhrase`) also failed, because they pass resolved forms that are still indefinite
  straight to the English builders. The comment on the guard in `determiner.ts` now names these two
  paths.
- **The measure manner is left as it was, and not pinned.** `resolveComplements` still makes a
  measure manner with an adjective bare, after `resolveNounPhrase`. So a superlative there keeps no
  article outside English: `a velocità più alta`, `à vitesse la plus haute`, `mit höchster
  Geschwindigkeit`.
- **The quantifiers are left as A25 left them, and not pinned** (`some biggest dogs`, `einige größte
  Hunde`).

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: a superlative under an indefinite or bare determiner*. Both pinning `test.fails`
  are now passing `test`s, with their assertions unchanged. New cases:
  - the random phrase's German (seed 942887), asserted whole beside its ending, now that
    [A174](A174-german-possessive-plural-adjective-ending.md) is fixed too. The A174 pin in
    `possession.test.ts` asserts the whole German sentence as well. Its Romance openings (`sentimenti
    domestici e meno cattivi`) are still not asserted;
  - `least` in all seven languages;
  - the indefinite plural in Italian and Portuguese, and a bare plural object;
  - a feminine noun;
  - the source and the goal;
  - a noun possessor (`il libro del cane più grande`, `das Buch des größten Hundes`);
  - the passive agent (`dal cane più grande`, `vom größten Hund`);
  - one conjunct of a group (`un gatto e il cane più grande`);
  - a regression test that `less`, `equally` and a bare comparative keep the determiner picked.
- **Unit tests:** `translator/functions/resolveNounPhrase.test.ts` checks:
  - `most` and `least` under an indefinite or bare determiner, in every language, in the plural and
    among several adjectives;
  - that the other determiners and degrees are unchanged;
  - that a degree with no adjective is ignored;
  - `OTHER` with a superlative in Spanish and Portuguese.

No passing test changed its expectation.
