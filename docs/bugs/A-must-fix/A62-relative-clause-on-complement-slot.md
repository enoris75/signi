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
