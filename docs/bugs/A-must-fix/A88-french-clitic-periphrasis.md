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
