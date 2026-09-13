# A98. A Spanish human direct object has no personal "a"

**Language:** Spanish

A specific human direct object takes the preposition `a` in Spanish, and it contracts with `el`:
`ve al niño`, `mata a un hombre`. `predicateText` (`languages/es/predicateText.ts`) renders every
noun object as `coordinateElement(directObject, npText)`, which is the plain noun phrase, so the `a`
is always missing. The corpus already marks personhood: `human` has been on the forms since A7 and is
set on CHILD, PERSON, BOY, MAN, WOMAN, BUTCHER, PARENT, FATHER, YOUNG_MAN, YOUNG_WOMAN and BUILDER.

| Clause | Now | Want |
|---|---|---|
| BOY | `el gato ve el niño.` | `el gato ve al niño.` |
| WOMAN | `el gato ve la mujer.` | `el gato ve a la mujer.` |
| MAN, indefinite | `el gato mata un hombre.` | `el gato mata a un hombre.` |
| BOY, no | `el gato no ve ningún niño.` | `el gato no ve a ningún niño.` |
| relative clause | `el perro que ve el niño corre.` | `el perro que ve al niño corre.` |
| command | `ama el niño.` | `ama al niño.` |

The plural and quantified objects fail the same way (`ve los hombres`, `ve algunas personas`), as does
the infinitive (`amar el niño.`). Already right: animal and inanimate objects (`ve el perro`), a
human recipient (`da el libro al niño`, through `terminus`), and pronoun objects (the clitic path).

## Shape of the fix

Render the direct object per conjunct. A conjunct whose head has `human === '1'` takes
`aDet(artForms(f, adj), plural)` + the noun (`al`, `a la`, `a un`, `a ningún`) instead of its plain
article. Every other conjunct keeps `npText`. The imperative and infinitive branches reuse
`directObjectText`, so they follow. A group that mixes a human and a non-human (`al niño y el
perro`) falls out of the per-conjunct choice and is not pinned.

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: Spanish personal "a"* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with the per-conjunct approach the fix proposed, plus two refinements below.

- The new [`takesPersonalA.ts`](../../../packages/engine/src/languages/es/takesPersonalA.ts) marks a
  conjunct whose head is `human` and has a determiner.
- The new [`objectNounText.ts`](../../../packages/engine/src/languages/es/objectNounText.ts) renders
  such a conjunct with `aDet(artForms(f, adj), plural)` + the noun (`al`, `a la`, `a un`, `a ningún`,
  `a su`). Every other conjunct keeps `npText`.
- [`predicateText.ts`](../../../packages/engine/src/languages/es/predicateText.ts) uses it for the noun
  conjuncts of the direct object, so the imperative and infinitive branches follow.

The two refinements:

- **A bare human takes no `a`.** A plural with no determiner is non-specific (`el gato ve niños`),
  where Spanish leaves the `a` out.
- **The personal `a` blocks the passive `se`.** A73 made a plural noun object agree the verb (`se
  ven las casas`). An object with the personal `a`, whether a human or a pronoun group, now keeps
  `se` impersonal and the verb singular (`se ve a los niños`, `se nos ve a él y a mí`, which read `se
  nos ven` before).

Every row now renders as wanted, including the command (`ama al niño`). Also covered:

- the plural (`a los hombres`), a quantifier (`a algunas personas`) and a demonstrative (`a esta mujer`);
- a possessive (`a su padre`), a genitive (`al padre del niño`) and an adjective (`al hombre viejo`);
- a human group (`al niño y a la mujer`) and the infinitive (`amar al niño`).

A mixed group takes the `a` only on its human conjunct (`al niño y el perro`). These are unchanged:
animals and things (`ve el perro`), the recipient (`da el libro al niño`) and the object relative head
(`el niño que el gato ve`). An instrument's action object still renders through `npText`.

- **Tests:** [`packages/engine/test/clause.test.ts`](../../../packages/engine/test/clause.test.ts) →
  *known bugs: Spanish personal "a"*. The pinning `test.fails` is now a passing `test`. New cases cover
  the forms above, and the impersonal `se` with the personal `a`, with a guard for the bare human, the
  animal, the passive `se` and the recipient.
- Unit tests: the new `takesPersonalA.test.ts` and `objectNounText.test.ts`, and `predicateText.test.ts` (es).
