# A62. A relative clause on a complement slot renders as a direct-object relative

**Language:** all except Japanese

The builder can relativise on any slot: `workspacePlan.ts` sets `headRole` to the gap, and that
includes complement keys. "The house the cat eats **in**" is `headRole: 'locative'`; "the boy the man
gives the book **to**" is `headRole: 'terminus'`. The gap complement is correctly dropped from the
clause, but no engine gives the relative pronoun the complement's preposition or case. Every language
except Japanese renders a direct-object relative, which changes the meaning ("the house that the cat
eats").

German says so in `languages/de/subordinateClause.ts`: dative and genitive relatives "are not
modelled and fall back to accusative".

| | Now | Want (one standard form) |
|---|---|---|
| English | `the house that the cat eats burns.` | `the house in which the cat eats burns.` |
| German | `das Haus, das der Kater isst, brennt.` | `das Haus, in dem der Kater isst, brennt.` |
| Italian | `la casa che il gatto mangia brucia.` | `la casa in cui il gatto mangia brucia.` |
| French | `la maison que le chat mange brûle.` | `la maison où le chat mange brûle.` |
| Spanish | `la casa que el gato come arde.` | `la casa en la que el gato come arde.` |
| Portuguese | `a casa que o gato come arde.` | `a casa em que o gato come arde.` |

| | Now | Want (one standard form) |
|---|---|---|
| English | `the boy who the man gives the book runs.` | `the boy to whom the man gives the book runs.` |
| German | `der Junge, den der Mann das Buch gibt, läuft.` | `der Junge, dem der Mann das Buch gibt, läuft.` |
| Italian | `il ragazzo che l'uomo dà il libro corre.` | `il ragazzo a cui l'uomo dà il libro corre.` |
| French | `le garçon que l'homme donne le livre court.` | `le garçon à qui l'homme donne le livre court.` |
| Spanish | `el niño que el hombre da el libro corre.` | `el niño al que el hombre da el libro corre.` |
| Portuguese | `o menino que o homem dá o livro corre.` | `o menino a quem o homem dá o livro corre.` |

Japanese is already right: a gapped relative needs no marking (`猫が食べる家`,
`男が本をあげる男の子`).

## Shape of the fix

Each engine's relative-pronoun choice must read `headRole`. For a complement gap it renders the
preposition that complement would take with the head as its noun phrase, followed by the relative
pronoun in the case that preposition governs:

- **German:** `in dem`, `mit dem`, the bare dative `dem`, the plural `denen`.
- **English:** `in which` / `to whom`.
- **Romance:** `in cui` / `où` / `en la que` / `em que`, and `a cui` / `à qui` / `al que` / `a quem`.

The spatial and sentiment specifiers of the dropped complement are needed to choose the preposition,
so they must survive the gap, e.g. `under which` for a locative with `under`.

Only English and German are pinned. The Romance languages have several equally standard forms
(`où` / `dans laquelle`, `en la que` / `en la cual`, `em que` / `na qual`), so whoever fixes them
picks one and extends the test.

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: relative clause on a complement slot* (1 `test.fails`, en + de) |

## Resolved

Fixed 2026-09-13. Rather than a table of relative prepositions per language, each engine renders
the relativizer through its own complement path, so preposition, case, contraction and specifiers
match the complement exactly.

- **The gap's specifiers survive.** `RelativeClause.headSpecifiers`
  ([`packages/shared/src/index.ts`](../../../packages/shared/src/index.ts)) carries the dropped
  complement's specifiers. [`workspacePlan.ts`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan.ts)
  copies them off the gap complement before deleting it, and
  [`translator.ts`](../../../packages/engine/src/translator.ts) passes them through.
- **A stand-in for the head.** `relativeGapComplement`
  ([`types.ts`](../../../packages/engine/src/types.ts)) builds a one-complement map for a complement
  gap. Its noun phrase is the relativizer word each engine supplies, on the head's gender, number,
  animacy and manner relation, with no concept id, adjectives or proper-name article. A `predicative`
  gap is not one: it takes no preposition and renders like a direct object.
- **Each engine renders it with its own `complementsPhrase`:**
  - [English](../../../packages/engine/src/languages/en/relativeText.ts): `whom` / `which`
    (`in which`, `to whom`, `under which`, `because of which`).
  - [Italian](../../../packages/engine/src/languages/it/relativeText.ts): `il quale`
    (`nella quale`, `al quale`, `sotto la quale`, `per colpa del quale`).
  - [French](../../../packages/engine/src/languages/fr/relativeText.ts): `lequel`, joined to its
    article (`dans laquelle`, `auquel`, `autour desquelles`, `par la faute duquel`).
  - [Spanish](../../../packages/engine/src/languages/es/withRelative.ts): `que` after the article
    (`en la que`, `al que`, `gracias a la que`).
  - [Portuguese](../../../packages/engine/src/languages/pt/withRelative.ts): `qual` (`na qual`,
    `ao qual`, `das quais`).
  - [German](../../../packages/engine/src/languages/de/subordinateClause.ts): a stand-in with
    `definiteness: 'relative'`. [`determiner.ts`](../../../packages/engine/src/languages/de/determiner.ts)
    renders it through the new [`relativePronoun.ts`](../../../packages/engine/src/languages/de/relativePronoun.ts),
    which is the article except for the dative plural `denen` and the genitive `dessen` / `deren`.
    [`complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase.ts) stops at
    the preposition and pronoun (`in dem`, `unter denen`, the bare dative `dem`, `in den` with no
    `ins`). A negative cause becomes `durch dessen Schuld`.
  - A predicate-noun gap now takes the nominative in German (`der Hund, der der Kater wird`).
- The Romance source's ablative adverb (`via` / `loin` / `lejos` / `longe`) is left off the
  relativizer (`dalla quale`).

Both pinned rows render as wanted in English and German, and the Romance rows in the forms above.

Not pinned: a `mode` manner gap in French, Spanish and Portuguese renders `de laquelle` / `de la que`
/ `da qual`. That is grammatical, but `dont` / `en la que` / `pela qual` read more naturally.

- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: relative clause on a complement slot*. The pinning `test.fails` is now a passing
  `test`. New cases:
  - the Romance forms;
  - specifiers and agreement;
  - source, direction, instrumental and manner;
  - the German cases;
  - a predicative gap.
- Unit tests:
  - `relativeText.test.ts` (en, it, fr) and `withRelative.test.ts` (es, pt);
  - `subordinateClause.test.ts`, `determiner.test.ts` and the new `relativePronoun.test.ts` (de).
- End-to-end: [`e2e/relative.spec.ts`](../../../e2e/relative.spec.ts) links a head to a locative gap
  set to "under" and checks four languages.
