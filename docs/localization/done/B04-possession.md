# B04. Possession & containers — POSSESSOR, CONTAINER

**Blocked on:** no ownership / holding verb is seeded.

## Seed first

- `OWN` (verb) — to have as property. (it possedere, fr posséder, de besitzen, es poseer, ja 所有する, pt possuir)
- `HOLD` (verb) — to contain or keep. (it contenere, fr contenir, de enthalten, es contener, ja 保持する/入れる, pt conter)

## Unlocks (genus + relative clause)

| concept | plan | gloss |
|---|---|---|
| POSSESSOR | `whoGloss('PERSON', 'OWN', 'OBJECT_THING')` | a person who owns objects |
| CONTAINER | `whoGloss('OBJECT_THING', 'HOLD', 'OBJECT_THING')` | an object that holds objects |

## Done

Localized 2026-07-18. The verbs `OWN` and `HOLD` were seeded first
([verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) +
[verbs/nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts)), which turned this
from a B into an A. Both definitions were then authored with `whoGloss` in
[concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts). Rendered by the engine at boot
in all seven languages:

**POSSESSOR** — `whoGloss('PERSON', 'OWN', 'OBJECT_THING')`

| lang | render |
|---|---|
| en | a person who owns objects |
| it | una persona che possiede oggetti |
| fr | une personne qui possède objets |
| de | eine Person, die Gegenstände besitzt |
| es | una persona que posee objetos |
| ja | 物体を所有する人 |
| pt | uma pessoa que possui objetos |

**CONTAINER** — `whoGloss('OBJECT_THING', 'HOLD', 'OBJECT_THING')`

| lang | render |
|---|---|
| en | an object that holds objects |
| it | un oggetto che contiene oggetti |
| fr | un objet qui contient objets |
| de | ein Gegenstand, der Gegenstände enthält |
| es | un objeto que contiene objetos |
| ja | 物体を保持する物体 |
| pt | um objeto que contém objetos |

Covered by two e2e assertions (POSSESSOR en+de, CONTAINER en+it) in
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
