# B01. Wild / domestic animals — WOLF, DOG

**Blocked on:** two adjectives not yet seeded. Once seeded, these become A-tasks
(`glossOf('MAMMAL', <adj>)`).

## Seed first (adjectives, all 7 langs)

- `WILD` — living in nature, not tamed. (en wild, it selvatico, fr sauvage, de wild, es salvaje,
  ja 野生の, pt selvagem)
- `DOMESTIC` — kept by or living with people. (en domestic, it domestico, fr domestique, de
  Haus-/zahm, es doméstico, ja 家庭の/飼い, pt doméstico)
- `CANINE` — of or resembling dogs. (en canine, it canino, fr canin, de Hunde-/hundeartig, es
  canino, ja イヌの, pt canino)

## Unlocks

| concept | plan | gloss |
|---|---|---|
| WOLF | `glossOf('MAMMAL', 'WILD', 'CANINE')` | a wild canine mammal |
| DOG | `glossOf('MAMMAL', 'DOMESTIC', 'CANINE')` | a domestic canine mammal |

Optionally refine CAT to `glossOf('MAMMAL', 'DOMESTIC', 'SMALL')` for "a small domestic mammal".

## Done

2026-07-18. Seeded the three adjectives `WILD`, `DOMESTIC`, `CANINE` in
[packages/backend/src/concepts/adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts)
(all 7 langs, pinned in `packages/engine/test/adjectives.test.ts`), then set the two `definition`
plans in [packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts):

- **DOG** — `glossOf('MAMMAL', 'DOMESTIC', 'CANINE')`
  - en `a domestic canine mammal` · it `un mammifero domestico e canino` ·
    fr `un mammifère domestique et canin` · de `ein zahmes hundeartiges Säugetier` ·
    es `un mamífero doméstico y canino` · ja `家庭の犬の哺乳類` · pt `um mamífero doméstico e canino`
- **WOLF** — `glossOf('MAMMAL', 'WILD', 'CANINE')`
  - en `a wild canine mammal` · it `un mammifero selvatico e canino` ·
    fr `un mammifère sauvage et canin` · de `ein wildes hundeartiges Säugetier` ·
    es `un mamífero salvaje y canino` · ja `野生の犬の哺乳類` · pt `um mamífero selvagem e canino`

Note the Romance renders coordinate the two postnominal adjectives with *e/et/y* — the engine is the
source of truth. e2e coverage added in `e2e/definition-tooltip.spec.ts` (DOG en+it, WOLF en+de).
