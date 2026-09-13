# A81. Italian turns every masculine plural in -co into -chi

**Language:** Italian

`agreeAdj` (`languages/it/agreeAdj.ts`) keeps the hard sound of a stem in `-co`/`-go` in the plural
(`stanco` → `stanchi` / `stanche`). That is right for the feminine plural and for an adjective
stressed on its second-to-last syllable. An adjective stressed one syllable earlier, like the
common `-ico` adjectives, takes a soft `-ci` in the masculine plural: `domèstico` → `domestici`,
`selvàtico` → `selvatici`. The function applies the hard rule to every `-co`, so all three seeded
`-ico` adjectives come out wrong wherever they agree with a masculine plural: attributive,
predicative, or the relative/gloss paths that share `agreeAdj`.

| Adjective | Now | Want |
|---|---|---|
| DOMESTIC | `gli animali domestichi mangiano.` | `gli animali domestici mangiano.` |
| WILD | `i gatti selvatichi mangiano.` | `i gatti selvatici mangiano.` |
| SEMANTIC | `i libri semantichi bruciano.` | `i libri semantici bruciano.` |
| WILD, predicative | `i gatti sembrano selvatichi.` | `i gatti sembrano selvatici.` |

Already right: the feminine plural (`le gatte selvatiche`, `le parole semantiche`) and TIRED
(`i gatti stanchi`).

## Shape of the fix

Where the stress falls is not in the spelling, so the choice needs either a rule or a seeded
form. Use `-ico` → `-ici` in the masculine plural for words of three or more syllables (covering
`domestico`, `selvatico`, `semantico`, `pratico`, `magico`), with exceptions like `antico` →
`antichi`. Also let an adjective carry a seeded masculine plural (a `plural` form, as nouns
already do) that wins over the rule. Keep `-che` for the feminine plural, and keep `stanco` /
`bianco` / `lungo` on `-chi` / `-ghi`.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: Italian masculine plural of -ico adjectives* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with the rule the shape of the fix proposed.
[`agreeAdj.ts`](../../../packages/engine/src/languages/it/agreeAdj.ts) gives an `-ico` adjective of three
or more syllables the soft masculine plural `-ici`, while the feminine keeps `-che`. The exceptions
stressed on their second-to-last syllable are listed in `HARD_ICO_ADJ`
([`it.consts.ts`](../../../packages/engine/src/languages/it/it.consts.ts): `antico`, `carico`) and keep
`-chi`.

Every row now renders as wanted, attributive and predicative. The feminine plural (`selvatiche`,
`semantiche`) and a two-syllable `-co` (`stanchi`, `lunghi`) are unchanged. No seeded adjective needed
a seeded plural form, so none was added.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: Italian masculine plural of -ico adjectives*. The pinning `test.fails` is now a
  passing `test`, with a guard for the feminine plural and TIRED.
- Unit test: `agreeAdj.test.ts` (it), including `pratico` and the exception `antico`.
