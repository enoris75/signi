# A311. A mass noun is counted as if it were a count noun

**Languages:** English (NEWS); all seven for a noun that is mass everywhere (FOOD, WATER)

`resolveNounPhrase` never pluralises a mass noun (`uncountable`): "a mass noun is never counted". But
the numeral is still printed. So the count lands on a singular, and in the Romance languages on the
singular article too:

- FOOD with `numeral: 3`: `the three food burns.`, `il tre cibo brucia.`, `la trois nourriture brûle.`,
  `das drei Essen brennt.`, `la tres comida arde.`, `a três comida arde.`
- WATER: `the three water burns.`, `la tre acqua brucia.`, `el tres agua arde.`

English NEWS is a special case. It is mass in English (and Japanese) and a plurale tantum in the other
five, which count it (`le tre notizie`, `die drei Nachrichten`). English alone says `the three news
runs.` The distributives go the same way. P09-E25 has the five plurale-tantum languages take `each` /
`every` whole, as `all` (`tutte le notizie`). English keeps them on its singular mass noun: `each news
burns.`, `every news burns.`

| Case | Now | Want (the ruling taken) |
|---|---|---|
| the three NEWS RUN (subject, English) | `the three news runs.` | `the three pieces of news run.` |
| the CAT READs the three NEWS (object, English) | `the cat reads the three news.` | `the cat reads the three pieces of news.` |
| `each` NEWS BURNs (English) | `each news burns.` | `each piece of news burns.` |
| `every` NEWS BURNs (English) | `every news burns.` | `every piece of news burns.` |
| the three FOOD BURNs (all seven) | `the three food burns.` · `il tre cibo brucia.` · `la trois nourriture brûle.` · `das drei Essen brennt.` · `la tres comida arde.` · 三つの食べ物は燃えます。 · `a três comida arde.` | refused by name: a numeral on a mass noun |

**Already right.** The five plurale-tantum languages count NEWS. FOOD with `each` keeps a kind reading
in the Romance languages and German (`ogni cibo`, `chaque nourriture`, `jedes Essen`, `cada comida`),
and `MASS_DETERMINER` deliberately leaves it (P09-E25). `all news burns.` is right. Japanese counts FOOD
with つ (三つの食べ物), which is acceptable, but a refusal takes it along.

**Found by** the lanes landing P09-E25 (quantity determiners) and E41 (NEWS), re-verified at 48af1d35.

## Decisions for the fixer

- **English NEWS: a unit word or a refusal.** English counts news by the piece, and *piece of news* is
  the standard unitiser. The recommended ruling is that English says `three pieces of news` (plural verb)
  and `each piece of news`, so the plan's count survives in the one language that needs a unit. The
  other option is `all news` for the distributives, as the five take it, and a refusal for the
  numeral. That would lose a plan the five other languages say well. Change the Wants with the ruling.
- **A noun that is mass in every language.** No unit word is seeded (no PIECE / PORTION), and the
  choice depends on the noun (*three portions of food*, *three glasses of water*). The recommended
  ruling is a named refusal, as A288 refuses a relative over a role gap. The pin asserts a throw
  matching `/numeral/`. Alternatively, a builder guard could keep the numeral off a mass noun and the
  engine could refuse only as a backstop.
- **Where to decide.** `resolveNounPhrase` already reads `uncountable` and the plurale tantum
  (`applyPluralOnly`). English NEWS needs the English lexeme to name its unitiser (for example a
  `unit` form, *piece*), read when a numeral or a distributive meets an English mass noun.

| | |
|---|---|
| **Test** | `quantity-determiners.test.ts` → *known bugs: a mass noun is counted as if it were a count noun (A311)* (5 `test.fails`, one per row, plus a regression test for the five plurale-tantum languages, FOOD's kind-reading `each` and `all news`) |

## Resolved

2026-09-24. Both recommended rulings were taken. English counts news by the piece: `the three pieces
of news run.`, `each piece of news burns.`, `every piece of news burns.`, with a plural verb after a
numeral above one. A numeral on a noun that is mass in every language is refused by name.

- [countMass.ts](../../../packages/engine/src/translator/functions/countMass.ts), called from
  `resolveNounPhrase` in
  [resolveNounPhrase.ts](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts) right
  after `applyPluralOnly`. `applyMassUnit` swaps a mass head that seeds a unit for that unit's counted
  phrase when a numeral or a distributive (`each`, `every`) meets it. The head then drops its mass
  flag, so it counts and agrees as a count noun. `refuseUncountableNumeral` throws (`a numeral cannot
  count FOOD: it is a mass noun in every language, and no unit word is seeded to count it by (A311)`)
  when no language's lexeme of the concept counts it, by a plurale tantum or a unit word. The check
  reads all seven lexemes, so the refusal is the same in every language. Japanese NEWS still counts
  (三つのニュース), because the other languages count NEWS.
- Corpus: the English NEWS lexeme in
  [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) seeds `unit: 'piece of news'` and
  `unit_plural: 'pieces of news'`. These are the whole counted phrases, so the language-neutral
  resolver writes no English *of*. The live database needs a reseed.
- FOOD's kind-reading `each` / `every` (`ogni cibo`, `every food`) and `all news burns.` are unchanged.

Guarded by `quantity-determiners.test.ts` → *known bugs: a mass noun is counted as if it were a count
noun (A311)*: the five former `test.fails`, now plain tests, two new tests (the unit with an
adjective, an approximator, the numeral one, the object slot, the plain and `some` mass noun, and
Japanese; the refusal on WATER, on the numeral one, in the object, and not on a distributive), and
the regression test. Unit cases are in `countMass.test.ts`.
