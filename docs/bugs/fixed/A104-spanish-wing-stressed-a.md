# A104. Spanish `ala` (WING) takes the feminine article instead of `el` / `un`

**Language:** Spanish

A feminine noun starting with a stressed `a-` takes the masculine singular article (`el agua`,
`un águila`). `stressedA` (`languages/es/stressedA.ts`) applies this rule when the lexicon marks the
noun with `stressed_a`. `agua` carries the mark. WING's Spanish lexeme `ala` does not
(`packages/backend/src/concepts/nouns.ts`), so `defArticle` and `indefArticle` give it `la` / `una`,
and the `de`/`a` contractions follow (`de la ala`).

| | Now | Want |
|---|---|---|
| subject | `la ala arde.` | `el ala arde.` |
| indefinite | `una ala arde.` | `un ala arde.` |
| locative | `el gato corre en la ala.` | `el gato corre en el ala.` |
| possessor | `el libro de la ala arde.` | `el libro del ala arde.` |

Already right: the plural (`las alas arden.`) and the demonstrative (`esta ala arde.`), since the
exception covers only the two singular articles. `ningún ala` and `ninguna ala` are both accepted,
so that case is not pinned.

## Shape of the fix

Corpus only: add `stressed_a: '1'` to WING's `es` forms in `nouns.ts`, as on WATER. A sweep of the
other seeded Spanish feminine nouns starting with `a`/`ha` (`altura`, `acción`) finds only unstressed
initial vowels, so WING is the only one missing.

| | |
|---|---|
| **Test** | `nounPhrase.test.ts` → *known bugs: Spanish stressed-a noun WING* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, with a corpus change only. WING's `es` lexeme in
[`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts) carries `stressed_a: '1'`, as WATER's
does, and the database is reseeded.

Every row now renders as wanted: `el ala arde.`, `un ala arde.`, `en el ala` and `del ala`. The
existing `stressedA` path also gives:
- `al ala` and `del ala` after `a` and `de`;
- a postnominal adjective (`el ala grande`);
- a predicate (`el ala es grande`).

The plural (`las alas`), the demonstrative (`esta ala`) and a prenominal adjective (`la primera ala`,
where the exception lapses) keep the feminine.

- **Tests:** [`packages/engine/test/nounPhrase.test.ts`](../../../packages/engine/test/nounPhrase.test.ts)
  → *known bugs: Spanish stressed-a noun WING*. The pinning `test.fails` is now a passing `test`. New
  cases cover the contractions, the adjective and the predicate, with a guard for the feminine
  contexts.
- Unit test: `defArticle.test.ts` (es), with WING's forms.
