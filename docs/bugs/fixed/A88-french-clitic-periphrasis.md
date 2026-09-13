# A88. The French object clitic climbs onto the auxiliary or modal

**Language:** French

Modern French has no clitic climbing. An object pronoun goes before the infinitive that governs it:
`est en train de me voir`, `doit me voir`. `predicateText` (`languages/fr/predicateText.ts`) builds
the whole verb group first and then calls `frCliticize(objectClitic, effectiveVerb)`. That puts the
clitic in front of the finite word, which is `être` for the progressive and prospective and the modal
for a modal chain. Only the compound past wants it there (`l'a vu`).

| Clause | Now | Want |
|---|---|---|
| SEE + FIRST_PERSON, progressive | `le chat m'est en train de voir.` | `le chat est en train de me voir.` |
| SEE + FIRST_PERSON, prospective | `le chat m'est sur le point de voir.` | `le chat est sur le point de me voir.` |
| ADD + THIRD_PERSON, progressive | `le chat l'est en train d'ajouter.` | `le chat est en train de l'ajouter.` |
| SEE + FIRST_PERSON, MUST | `le chat me doit voir.` | `le chat doit me voir.` |
| SEE + FIRST_PERSON, MUST, negative | `le chat ne me doit pas voir.` | `le chat ne doit pas me voir.` |
| SEE + THIRD_PERSON, MUST, resultative | `le chat le doit avoir vu.` | `le chat doit l'avoir vu.` |

Already right: the resultative without a modal (`le chat l'a vu.`).

## Shape of the fix

Pass the clitic into the non-finite tail rather than onto the finite verb:

- **progressive / prospective:** `aspectVerbFr` builds `en train de` / `sur le point de` + clitic +
  infinitive. The elision of `de` must then be judged on the clitic (`de l'ajouter`, not
  `d'l'ajouter`).
- **modal chain:** `modalGroupFr` / `verbGroupInfinitiveFr` put the clitic before the innermost verb
  group (`me voir`, `l'avoir vu`, `être en train de me voir`).
- **plain resultative:** keeps the clitic on the auxiliary.

`ne … pas` still wraps only the finite verb.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: French object clitic in a periphrasis* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. In
[`predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts), under a modal or the
progressive / prospective the object clitic now travels into the non-finite tail. The finite verb is
cliticised only otherwise (the compound past, `l'a vu`). The tail builders place it:

- [`aspectVerbFr.ts`](../../../packages/engine/src/languages/fr/aspectVerbFr.ts) builds
  `en train de` / `sur le point de` + clitic + infinitive. It judges the elision of `de` on the
  cliticised infinitive, so `de l'ajouter` and `de me voir` come out, but `d'aller` without a clitic.
- [`modalGroupFr.ts`](../../../packages/engine/src/languages/fr/modalGroupFr.ts) passes the clitic to
  [`verbGroupInfinitiveFr.ts`](../../../packages/engine/src/languages/fr/verbGroupInfinitiveFr.ts),
  which puts it before the infinitive heading the main group: `me voir`, `l'avoir vu`, `être en train
  de me voir`.

`ne … pas` still wraps only the finite verb.

Every row now renders as wanted. `verbGroupInfinitiveFr` also takes the preceding object's forms, so a
modal's perfect participle agrees with it as the plain compound past already did. Before the fix it
agreed with neither the clitic nor an object relative:

- a clitic: `le chat doit l'avoir vue` (was `la doit avoir vu`);
- an object relative: `la souris que le chat doit avoir mangée` (was `mangé`).

Also covered: a frequency adverb (`doit toujours me voir`, `ne doit jamais me voir`), stacked modals
(`veut pouvoir me voir`), a modal over the progressive, and a resumed group (`doit nous voir, lui et
moi`). The negative compound past still reads `n'm'a pas vu`, which is A93's separate defect.

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → *known bugs: French object clitic in a periphrasis*. The pinning `test.fails` is now a passing
  `test`. New cases cover agreement, adverbs, stacked modals, the progressive under a modal and the
  resumed group. Further cases cover the object relative, with a guard for the compound past and a
  noun object.
- Unit tests: `aspectVerbFr.test.ts`, `verbGroupInfinitiveFr.test.ts`, `modalGroupFr.test.ts` and
  `predicateText.test.ts` (fr).
