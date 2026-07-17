# Precedent — CAT, MOUSE, FOX, COW (genus + differentia)

Shipped before this catalogue existed, when `ConceptSeed.definition` was introduced. They are the
worked example every A-task follows: `glossOf('MAMMAL', <adj>)`.

| concept | plan | en | it |
|---|---|---|---|
| CAT | `glossOf('MAMMAL', 'SMALL')` | a small mammal | un piccolo mammifero |
| MOUSE | `glossOf('MAMMAL', 'SMALL')` | a small mammal | un piccolo mammifero |
| FOX | `glossOf('MAMMAL', 'BROWN')` | a brown mammal | un mammifero marrone |
| COW | `glossOf('MAMMAL', 'BIG')` | a big mammal | un grande mammifero |

**Where:** [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (the CAT/MOUSE/FOX/COW seeds).
Covered by [../../../e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
