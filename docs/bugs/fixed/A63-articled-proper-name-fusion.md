# A63. An articled proper name loses its preposition-article fusion under a non-definite pick

**Language:** German, Italian

A proper name that always takes the definite article (German `die Antarktis`, every Italian continent) renders that article whatever determiner was picked, but the preposition-article fusion is decided from the *picked* determiner. So an indefinite, bare or demonstrative pick leaves the article unfused.

## German

Some proper names always take the definite article (`die Antarktis`), marked `takes_article` in the
corpus. `determiner` returns that article whatever determiner was picked. `prepDet`
(`languages/de/prepDet.ts`) decides whether to fuse `zu der` → `zur` from the *picked*
determiner (`forms.definiteness === 'definite'`), not from the article that actually appears. An
indefinite or bare pick therefore renders the definite article without the fusion.

| Determiner picked | Now | Want |
|---|---|---|
| definite (default) | `der Kater geht zur Antarktis.` | *(already right)* |
| indefinite | `der Kater geht zu der Antarktis.` | `der Kater geht zur Antarktis.` |
| bare | `der Kater geht zu der Antarktis.` | `der Kater geht zur Antarktis.` |

ANTARCTICA is the only `takes_article` name in the corpus today, and it is feminine, so only `zur`
is reachable. A masculine or neuter one would lose `zum` / `im` the same way.

### Shape of the fix

Fuse whenever `determiner` produced the definite article. The simplest version treats a `proper` +
`takes_article` head as definite in `prepDet`'s check.

## Italian

In Italian every seeded continent takes the definite article (`l'Africa`): `artFor`
(`languages/it/artFor.ts`) returns it for a proper noun whatever determiner was picked. But
`prepDet` (`languages/it/prepDet.ts`) fuses the preposition only when the *picked* determiner is
definite. With any other pick, the article shows up unfused after the bare preposition. This
reaches source (`da`), terminus (`a`), and the `around` / `in_front_of` locatives (`intorno a`,
`davanti a`), which all go through `prepDet`.

| Complement | Now | Want |
|---|---|---|
| source, AFRICA indefinite | `il gatto viene da l'Africa.` | `il gatto viene dall'Africa.` |
| source, EUROPE this | `il gatto viene da l'Europa.` | `il gatto viene dall'Europa.` |
| terminus, EUROPE indefinite | `il gatto dà il libro a l'Europa.` | `il gatto dà il libro all'Europa.` |
| locative `around`, EUROPE indefinite | `il gatto mangia intorno a l'Europa.` | `il gatto mangia intorno all'Europa.` |

Already right: the default definite pick (`dall'Africa`, `all'Europa`).

| | |
|---|---|
| **Test** | `complements/direction.test.ts` → *known bugs: German fusion on an articled proper name* (1 `test.fails`)<br>`complements/direction.test.ts` → *known bugs: Italian fusion on an articled proper name* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. Each fusion now checks whether the definite
article actually surfaces, not which determiner was picked.

- [`de/prepDet.ts`](../../../packages/engine/src/languages/de/prepDet.ts): a `proper` + `takes_article`
  head fuses like a definite one (`zur Antarktis` under an indefinite, bare, demonstrative or negative
  pick). [`de/possessorText.ts`](../../../packages/engine/src/languages/de/possessorText.ts) makes the
  same check for `vom`.
- [`it/prepDet.ts`](../../../packages/engine/src/languages/it/prepDet.ts): a `proper` head fuses like
  a definite one, since `artFor` gives it the article regardless. That covers the source, terminus,
  `around`, `in front of`, the cause and the possessor (`dall'Africa`, `all'Europa`, `intorno
  all'Europa`, `davanti all'Africa`, `a causa dell'Europa`, `il libro dell'Europa`).

Unchanged: `con` never fuses (`con l'Europa`), a plain `in` continent stays bare (`va in Europa`), and
a German name with no article stays bare (`zu Europa`).

Not changed here: a `no` pick on an Italian continent still triggers the negative concord although no
`nessun` surfaces (`il gatto non viene dall'Africa`). That is a separate defect in how a proper name
drops its picked determiner.

- **Tests:** [`packages/engine/test/complements/direction.test.ts`](../../../packages/engine/test/complements/direction.test.ts)
  → *known bugs: German / Italian fusion on an articled proper name*. Both pinning `test.fails` are
  now passing `test`s. New cases:
  - the other determiners and complements;
  - guards for `con`, the bare `in` continent and the German name with no article.
- Unit tests: `prepDet.test.ts` (de, it).
