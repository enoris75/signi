# A07. BUTCHER — "a person who kills animals"

**Concept:** BUTCHER (noun)   **Shape:** genus + relative clause (subject gap)

| lang | renders |
|---|---|
| en | a person who kills animals |
| it | una persona che uccide animali |
| de | eine Person, die Tiere tötet |
| ja | 動物を殺す人 |

**Plan:** `definition: whoGloss('PERSON', 'KILL', 'ANIMAL')`
**Vocabulary (all seeded in 7 langs):** PERSON (genus), KILL (verb), ANIMAL (object)
**Edit:** [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) — the BUTCHER seed

Note: "kills animals" approximates the trade (slaughters animals / sells meat); MEAT and
SELL/SLAUGHTER are not seeded (see B-needs-seed for a more faithful gloss).

## Done

Localized 2026-07-18. Added `definition: whoGloss('PERSON', 'KILL', 'ANIMAL')` to the BUTCHER seed in
[../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts)
(reusing the `whoGloss` helper from A05). Rendered strings (engine output, all 7 languages):

| lang | render |
|---|---|
| en | a person who kills animals |
| it | una persona che uccide animali |
| fr | une personne qui tue animaux |
| de | eine Person, die Tiere tötet |
| es | una persona que mata animales |
| ja | 動物を殺す人 |
| pt | uma pessoa que mata animais |

e2e coverage added to [../../../e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts)
(English + Italian). Full suite green (26/26).
