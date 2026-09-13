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
