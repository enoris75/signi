# A31. Directional continent goal: wrong preposition, and the article is kept (Italian, French)

**Language:** Romance / Iberian coordination

The `direction` goal of a motion picks its adposition by the goal's animacy (`a`/`à` a place,
`da`/`vers` a person — see A29's sibling for the locative). A **continent** needs a third choice:
Italian and French use *in* / *en*, and with **no** article — `va in Antartide`, `va en
Antarctique`. The engine applies the default inanimate-goal adposition *and* keeps the proper
noun's fixed article (correct only as a subject, `l'Antartide è fredda`), so it emits `va
all'Antartide` / `va à l'Antarctique`. This is A29's article defect (there for the *locative*)
**plus** a preposition-selection error unique to the goal. Spanish and Portuguese genuinely keep
the article (`a la Antártida`, `à Antártida`) and are right; German `zur Antarktis` is acceptable.
The fix needs continent-awareness in the two engines — `ANTARCTICA isA CONTINENT`, which the goal
preposition can key off.

| | Now | Want |
|---|---|---|
| Italian | `il gatto va all'Antartide.` | `il gatto va in Antartide.` |
| French | `le chat va à l'Antarctique.` | `le chat va en Antarctique.` |

| | |
|---|---|
| **Test** | `complements/direction.test.ts` → *known bugs: direction* (1 test) |

## Resolved

Fixed 2026-07-16, with continent-awareness threaded through the lexicon into the two engines:

- [`packages/backend/src/lexicon.ts`](../../../packages/backend/src/lexicon.ts): `lookupNoun` now
  reads the concept's direct hypernym from `concept_relations` and exposes it as `forms['isA']`, so a
  goal preposition can key off `ANTARCTICA isA CONTINENT`.
- [`it.ts`](../../../packages/engine/src/languages/it.ts): the `direction` head returns a bare **`in`**
  for a continent goal (`nf['isA'] === 'CONTINENT'`) — `va in Antartide` — instead of the default
  inanimate place `prepDet('a', …)` that kept the proper noun's article (`va all'Antartide`).
- [`fr.ts`](../../../packages/engine/src/languages/fr.ts): the `direction` head returns a bare **`en`**
  for a continent goal — `va en Antarctique` — instead of `aDet(…)` (`va à l'Antarctique`).

Both wrong on two counts before — the preposition and the article — now correct on both. A common-noun
place goal still takes `a`/`à` + article (`al mercato` / `au marché`), an animate goal `da`/`vers`
(`dal ragazzo` / `vers le garçon`), and Spanish/Portuguese/German are untouched (they read no `isA`):
`a la Antártida`, `à Antártida`, `zur Antarktis` — all right. This keys off the continent hypernym
rather than mere proper-noun-ness, so a future city goal would still take `a`/`à`. (The sibling
locative fix A29 keys on `proper`; equivalent for the current corpus, all of whose proper nouns are
continents.)

- **Tests:** [`packages/engine/test/complements/direction.test.ts`](../../../packages/engine/test/complements/direction.test.ts)
  → *known bugs: direction*. The pinning `test.fails` is now a passing `test`, plus added cases: the
  other continents including a compound name (`in America del Nord` / `en Amérique du Nord`), a
  regression that Spanish/Portuguese/German keep their forms, and a regression that the common-place
  and animate goals are unchanged. One anticipated collateral assertion (and its snapshot) in
  [`hypothetical.test.ts`](../../../packages/engine/test/hypothetical.test.ts) — flagged "flip it when
  A31 lands" — was updated from `all'Antartide` to `in Antartide`.
