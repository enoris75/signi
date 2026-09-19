# A147. Italian, Spanish and Portuguese put a frequency adverb after the prospective's infinitive

**Languages:** Italian (prospective and progressive), Spanish, Portuguese (prospective)

A frequency adverb on a periphrastic aspect is appended after the whole verb group, so it lands
after the infinitive or gerund. There it reads as scoping over that verb alone (`stava per amare
sempre`: *was about to always love*). French slots it right after the finite verb of every
periphrasis (`était toujours sur le point de`, `n'est jamais en train de`), and Italian already does
the same for the compound perfect (A28: `ha sempre mangiato`).

| Clause | Now | Want |
|---|---|---|
| it: that MAN LOVE this ANGEL, past prospective, NEVER | `quell'uomo non stava per amare mai quest'angelo.` | `quell'uomo non stava mai per amare quest'angelo.` |
| it: CAT EAT MOUSE, prospective, ALWAYS | `il gatto sta per mangiare sempre il topo.` | `il gatto sta sempre per mangiare il topo.` |
| it: CAT EAT, progressive, ALWAYS | `il gatto sta mangiando sempre.` | `il gatto sta sempre mangiando.` |
| it: CAT EAT, progressive, NEVER | `il gatto non sta mangiando mai.` | `il gatto non sta mai mangiando.` |
| es: CAT EAT MOUSE, prospective, ALWAYS | `el gato está a punto de comer siempre el ratón.` | `el gato está siempre a punto de comer el ratón.` |
| pt: CAT EAT MOUSE, prospective, ALWAYS | `o gato está prestes a comer sempre o rato.` | `o gato está sempre prestes a comer o rato.` |

Italian `mai` does not change the meaning (the `non` is already on `stava`), but no speaker puts it
there. For `sempre`/`siempre` the placement changes the scope.

Already right:

- **Spanish and Portuguese `nunca`.** It is fronted before the finite verb (`nunca está a punto de`),
  so only the positive adverb is affected.
- **French** throughout.
- **A manner adverb**, which does follow the infinitive: `sta per mangiare bene il topo`.

Found by reviewing the rendered phrase "that man was never about to love this angel".

## Shape of the fix

In each language's `predicateText`, a frequency adverb (`subtype: 'frequency'`) on the prospective
goes right after the finite `stare` / `estar`. For Italian, extend the same placement to the
progressive. Italian already has the split for the resultative in
[`it/predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts) (`[aux, ...rest] =
verbText.split(' ')`). Widening its `aspect === 'resultative'` guard to the progressive and the
prospective covers all four Italian rows. Spanish and Portuguese need the same split for a
non-fronted frequency adverb.

Out of scope, because they are pinned as right today:

- **The modal chain.** `deve mangiare sempre` is A28's regression guard, and `non deve stare per
  amare mai` follows it. Keep the new placement to the plan without modals, as A28 did.
- **The Spanish and Portuguese progressive** (`está comiendo siempre`, `está comendo sempre`).
  Both are idiomatic, so they are not pinned. Moving them for consistency is optional.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: Romance frequency adverb after the prospective infinitive* (3 `test.fails`, plus a regression test for French, the fronted `nunca` and a manner adverb) |
