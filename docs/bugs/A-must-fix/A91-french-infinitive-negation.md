# A91. French negates an infinitive with a fixed "ne pas" prefix

**Language:** French

A negated French infinitive puts both parts of the negation before it, and an object clitic after
them: `ne pas le voir`, `ne jamais manger`, `ne manger aucune souris`. The infinitive branch and the
instruction branch of `predicateText` (`languages/fr/predicateText.ts`) build the negation the same
way: `` verbNegative === true ? `ne pas ${inf}` : inf ``. This goes wrong in three ways:

- `frCliticize` puts the clitic after `ne ` (`ne le pas voir`).
- A self-negating `jamais` gets no `ne` and trails the infinitive as a manner adverb.
- An `aucun` object or complement gets no `ne`.

The finite and imperative paths handle all three through `negateFinite`.

| Plan | Now | Want |
|---|---|---|
| instruction, SEE + THIRD_PERSON, negative | `ne le pas voir.` | `ne pas le voir.` |
| infinitive, ADD + THIRD_PERSON, negative | `ne le pas ajouter.` | `ne pas l'ajouter.` |
| infinitive, EAT, NEVER | `manger jamais.` | `ne jamais manger.` |
| infinitive, EAT, NEVER, negative | `ne pas manger jamais.` | `ne jamais manger.` |
| infinitive, EAT + MOUSE (no) | `manger aucune souris.` | `ne manger aucune souris.` |
| instruction, EAT + MOUSE (no) | `manger aucune souris.` | `ne manger aucune souris.` |
| infinitive, RUN, locative HOUSE (no) | `courir dans aucune maison.` | `ne courir dans aucune maison.` |

Already right: the plain negative infinitive (`ne pas manger.`), the finite clause
(`le chat ne mange jamais.`) and the command (`ne mange jamais.`).

## Shape of the fix

Build the non-finite negation once for both branches, as `ne` + (`pas` | `jamais` | nothing for
`aucun`) + clitic + infinitive. Treat `jamais` as the negator rather than a trailing adverb, and let
`aucun` trigger `ne` alone, the same rules `negateFinite` applies.

| | |
|---|---|
| **Test** | `infinitive.test.ts` → *known bugs: French negative infinitive* (1 `test.fails`) |
