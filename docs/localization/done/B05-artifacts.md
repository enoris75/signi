# B05. Artifacts — BOOK, COIN

**Blocked on:** the differentiae that distinguish these objects are not seeded.

## Seed first

- `WRITTEN` (adjective) — set down in words. (BOOK)
- `ROUND` (adjective) — circular. (COIN)
- `MONEY` (noun) — a medium of exchange, useful as the object of "used as money". (COIN)

## Unlocks

| concept | plan | gloss |
|---|---|---|
| BOOK | `glossOf('OBJECT_THING', 'WRITTEN')` | a written object |
| COIN | `glossOf('OBJECT_THING', 'SMALL', 'ROUND')` | a small round object |

Note: a fuller COIN ("used as money") needs a purpose/means complement in the definition — out of
scope for a plain noun phrase; the adjective gloss above is the feasible version.

## Done

Localized 2026-07-18. Seeded the three blockers — `WRITTEN` and `ROUND`
([adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts)) and mass-noun `MONEY`
([nouns.ts](../../../packages/backend/src/concepts/nouns.ts)) — which turned this into an A, then
added the `definition` plans to BOOK and COIN in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts):
`glossOf('OBJECT_THING', 'WRITTEN')` and `glossOf('OBJECT_THING', 'SMALL', 'ROUND')`.

Rendered strings (engine is source of truth):

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BOOK | a written object | un oggetto scritto | un objet écrit | ein geschriebener Gegenstand | un objeto escrito | 書かれた物体 | um objeto escrito |
| COIN | a small round object | un piccolo oggetto rotondo | un petit objet rond | ein kleiner runder Gegenstand | un objeto pequeño y redondo | 小さい丸い物体 | um objeto pequeno e redondo |

e2e coverage added in
[definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (BOOK en/de, COIN en/it); the
two former "literal-only" tests were repointed from BOOK to HOUSE, which still carries only a stored
literal. Unit tests: `ROUND`/`WRITTEN` in the `EVERY_ADJECTIVE` table + Italian postnominal cases
([adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts)), and a `MONEY` mass-noun
case ([nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts)).
