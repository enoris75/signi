# A65. The Romance cause complement ignores its noun's determiner

**Language:** Italian, French, Spanish, Portuguese

Italian, French, Spanish and Portuguese build the `cause` connector for a noun with a definite contraction (`a causa del`, `à cause du`, `a causa del`, `por causa do`) and never read the noun's own `definiteness`. An indefinite, demonstrative or quantified cause turns definite. With `no`, the negative concord still adds the preverbal negator but the negative determiner is lost, so the sentence says the opposite ("does not cry because of the dog"). English and German keep the determiner (`because of a dog`, `wegen einem Hund`).

Only a plan can produce this today: the builder offers no determiner on a cause (`DETERMINER_COMPLEMENT_TYPES` in `packages/shared/src/index.ts` leaves it out), but `translate` resolves the field.

## Italian

The noun branch of the cause in `complementsPhrase` (`languages/it/complementsPhrase.ts`) builds
its connector with `prepArt`, which is always the preposition plus the *definite* article:
`a causa del`, `per colpa del`, `grazie al`. It never reads the complement's `definiteness`, so
every determiner the builder offers on the cause renders as the definite one. The `no` determiner
is the worst case. It still triggers the negative concord that adds the preverbal `non`
(`hasNegativeComplement`), but it loses `nessun`, so the sentence says the opposite: "the cat
does not cry because of the dog".

| Cause | Now | Want |
|---|---|---|
| DOG, no | `il gatto non piange a causa del cane.` | `il gatto non piange a causa di nessun cane.` |
| DOG, indefinite | `il gatto piange a causa del cane.` | `il gatto piange a causa di un cane.` |
| DOG, this | `il gatto piange a causa del cane.` | `il gatto piange a causa di questo cane.` |
| DOGS, bare | `il gatto piange a causa dei cani.` | `il gatto piange a causa di cani.` |
| DOGS, some, negative | `il gatto piange per colpa dei cani.` | `il gatto piange per colpa di alcuni cani.` |
| DOG, indefinite, positive | `il gatto piange grazie al cane.` | `il gatto piange grazie a un cane.` |

Already right: the definite cause (`a causa del cane`, `a causa dei cani`), and the source,
terminus and locative complements, which go through `prepDet`.

### Shape of the fix

Use `prepDet('di', …)` / `prepDet('a', …)` in place of `prepArt` in the cause's `headFor`, the
way `terminus` and `source` already do. It fuses only the definite article and otherwise writes
`di` / `a` plus the determiner. An articled continent as the cause (`a causa dell'Africa`) then
needs A63's fix too, or an indefinite pick would render `a causa di l'Africa`.

## French

The `cause` branch of `complementsPhrase` (`languages/fr/complementsPhrase.ts`) heads every noun
conjunct with a definite contraction: `à cause` + `dePrep`, `par la faute` + `dePrep`, or `grâce` +
`datPrep`. The noun's own `definiteness` is never read, so an indefinite, quantified or negative
cause becomes definite. With `no`, `hasNegativeComplement` still adds the preverbal `ne`, leaving a
negator with nothing to negate.

| Cause | Now | Want |
|---|---|---|
| DOG, indefinite | `le chat court à cause du chien.` | `le chat court à cause d'un chien.` |
| DOG, some (plural) | `le chat court à cause des chiens.` | `le chat court à cause de quelques chiens.` |
| DOG, no | `le chat ne court à cause du chien.` | `le chat ne court à cause d'aucun chien.` |
| DOG, indefinite, negative sentiment | `le chat court par la faute du chien.` | `le chat court par la faute d'un chien.` |
| DOG, indefinite, positive sentiment | `le chat court grâce au chien.` | `le chat court grâce à un chien.` |

Only a plan can produce this. The builder offers no determiner on a cause
(`DETERMINER_COMPLEMENT_TYPES` excludes it), but `translate` resolves the field and English and
German render it (`because of a dog`, `wegen einem Hund`).

### Shape of the fix

Use the determiner-aware heads the other complements use: `deDet` after `à cause` and `par la faute`,
`aDet` after `grâce`. Both keep the definite contraction (`du`, `au`) and otherwise render the
determiner (`d'un`, `de quelques`, `d'aucun`, `à un`).

## Spanish

The generic (noun) branch of `complementsPhrase` (`languages/es/complementsPhrase.ts`) builds the
three cause connectors with `dePrep` (`a causa de` / `por culpa de`) and `datPrep` (`gracias a`).
Both always use the definite article. The other branches use the determiner-aware `deDet` / `aDet`,
so `source` gets `de una casa` right, but the cause never reads its `definiteness`. Every cause
comes out definite. With `no`, the preverbal `no` is still added (the cause counts as a negative
complement), so the sentence ends up saying the opposite ("does not cry because of the dog").

| Cause | Now | Want |
|---|---|---|
| DOG, indefinite | `el gato llora a causa del perro.` | `el gato llora a causa de un perro.` |
| DOG, some | `el gato llora a causa de los perros.` | `el gato llora a causa de algunos perros.` |
| DOG, no | `el gato no llora a causa del perro.` | `el gato no llora a causa de ningún perro.` |
| DOG, indefinite, positive | `el gato llora gracias al perro.` | `el gato llora gracias a un perro.` |
| DOG, indefinite, negative | `el gato llora por culpa del perro.` | `el gato llora por culpa de un perro.` |

The demonstratives and the other quantifiers fail the same way (`a causa del perro` for *this*,
`a causa de los perros` for *few* / *all*). Already right: the definite (`a causa del perro`), proper
names (`a causa de la Antártida`, `a causa de Europa`) and pronoun causes (a separate branch).

### Shape of the fix

In the `cause` arm, use `deDet(af, plural)` in place of `dePrep(af, plural)` for the neutral and
negative connectors, and `aDet(af, plural)` in place of `datPrep(af, plural)` for the positive one.
Both still contract to `del` / `al` for the masculine singular definite, so the definite outputs
pinned across `combined.test.ts`, `combined-triples.test.ts`, `cause.test.ts` and
`languages/es/complementsPhrase.test.ts` do not change.

## Portuguese

The noun path of the cause in `complementsPhrase` (`languages/pt/complementsPhrase.ts`) builds its
connector with `dePrep(f, plural)` (`por causa do`, `por culpa do`) or `datPrep(f, plural)`
(`graças ao`). Both fuse the preposition with `defArticle` and never read `definiteness`. So an
indefinite, demonstrative or quantified cause turns definite. With `nenhum` it is worse. The clause
still gets its `não` (`hasNegativeComplement`), but `nenhum` is dropped, so "the cat cries because of
no dog" reads "the cat does not cry because of the dog".

The other contracting complements already honour the determiner through `contractDet` (`desta
casa`, `a uma casa`). The cause is the one that bypasses it.

| Cause | Now | Want |
|---|---|---|
| DOG, indefinite | `o gato chora por causa do cão.` | `o gato chora por causa de um cão.` |
| DOG, this | `o gato chora por causa do cão.` | `o gato chora por causa deste cão.` |
| DOG, no | `o gato não chora por causa do cão.` | `o gato não chora por causa de nenhum cão.` |
| DOG, some | `o gato chora por causa dos cães.` | `o gato chora por causa de alguns cães.` |
| DOG, indefinite, negative | `o gato chora por culpa do cão.` | `o gato chora por culpa de um cão.` |
| DOG, this, positive | `o gato chora graças ao cão.` | `o gato chora graças a este cão.` |

Already right: the definite cause (`por causa do cão`, `graças ao cão`) and a proper name, which keeps
its article (`por causa da Europa`).

### Shape of the fix

Use `contractDet(dePrep, 'de', f, plural)` for the neutral and negative connectors and
`contractDet(datPrep, 'a', f, plural)` for the positive one, as `terminus` and `source` already do.
`contractDet` fuses the definite article and `de` + demonstrative (`deste`, `desse`) and leaves the
rest unfused (`de um`, `de nenhum`, `a este`).

| | |
|---|---|
| **Test** | `complements/cause.test.ts` → *known bugs: Italian cause determiner*; `complements/cause.test.ts` → *known bugs: French cause determiner*; `complements/cause.test.ts` → *known bugs: Spanish cause determiner*; `complements/cause.test.ts` → *known bugs: Portuguese cause determiner* (4 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. The cause connectors use the determiner-aware
heads the other complements use:

- [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts):
  `prepDet('di' | 'a', …)`.
- [`fr/complementsPhrase.ts`](../../../packages/engine/src/languages/fr/complementsPhrase.ts): `deDet`
  after `à cause` / `par la faute`, and `aDet` after `grâce`, including the shared-connector group
  from A54.
- [`es/complementsPhrase.ts`](../../../packages/engine/src/languages/es/complementsPhrase.ts): `deDet` /
  `aDet`.
- [`pt/complementsPhrase.ts`](../../../packages/engine/src/languages/pt/complementsPhrase.ts):
  `contractDet(dePrep | datPrep, …)`.

Every table row now renders as wanted. The fix also covers the remaining determiners (`a causa di
molti cani`, `par la faute de tous les chiens`, `gracias a esa mujer`), a feminine `no` (`a causa di
nessuna donna`), and a determiner inside a group that shares its connector (`à cause d'un chien et
de toi`). The definite cause is unchanged, as is the relativizer stand-in from A62 (`a causa del
quale`).

Routing the cause through these heads exposed two gaps that the source complement already had.
Both are fixed here:

- [`fr/deDet.ts`](../../../packages/engine/src/languages/fr/deDet.ts) treated an articled continent
  under a non-definite pick as a dropped mass-noun partitive (`à cause d'Afrique`, `vient d'Afrique`).
  A proper noun now keeps its contracted article (`à cause de l'Afrique`).
- [`it/prepDet.ts`](../../../packages/engine/src/languages/it/prepDet.ts) stacked a preposition on a
  mass noun's partitive (`a causa di dell'acqua`, `viene da dell'acqua`, and A58's `di dell'acqua`).
  The partitive now fuses like the definite (`a causa dell'acqua`, `viene dall'acqua`); `con` keeps
  `con dell'acqua`.

- **Tests:** [`packages/engine/test/complements/cause.test.ts`](../../../packages/engine/test/complements/cause.test.ts)
  → the four *known bugs: … cause determiner* blocks. The pinning `test.fails` are now passing
  `test`s. New cases:
  - the remaining determiners, groups and continents;
  - the Italian partitive;
  - guards for the definite contraction and Spanish's bare proper name.
- Unit tests:
  - `complementsPhrase.test.ts` (it, fr, es, pt);
  - `deDet.test.ts` (fr) and `prepDet.test.ts` (it).
