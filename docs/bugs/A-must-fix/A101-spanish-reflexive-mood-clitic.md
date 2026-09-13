# A101. A Spanish reflexive verb's conditional and imperfect subjunctive keep the wrong clitic

**Language:** Spanish

`moodForm` (`mood.ts`) builds the conditional on the stored `1sg_future` minus `-é` and the
imperfect subjunctive on the stored `3pl_past` minus `-ron`. For BECOME those stored forms include
their clitic (`me volveré`, `se volvieron`). Every person's conditional therefore starts with `me`,
and every person's subjunctive with `se`. The output is right only by accident, for a 1st-singular
conditional or a 3rd-person subjunctive.

| Clause | Now | Want |
|---|---|---|
| apodosis, 3sg | `si el gato comiera, el perro me volvería una leyenda.` | `si el gato comiera, el perro se volvería una leyenda.` |
| apodosis, 3pl | `si el gato comiera, los perros me volverían una leyenda.` | `si el gato comiera, los perros se volverían una leyenda.` |
| protasis, 1sg | `si se volviera una leyenda, el perro correría.` | `si me volviera una leyenda, el perro correría.` |
| protasis, 2sg | `si se volvieras una leyenda, el perro correría.` | `si te volvieras una leyenda, el perro correría.` |
| protasis, 1pl | `si se volvieramos una leyenda, el perro correría.` | `si nos volviéramos una leyenda, el perro correría.` |

The 1pl row also needs the accent from B11 (1st-plural subjunctive accent), so it is not pinned. Already
right: a marked aspect, whose clitic `aspectVerb` adds in front of the auxiliary (`se habría
vuelto`, `me hubiera vuelto`).

## Shape of the fix

Before deriving, strip the leading clitic word from the stored source form, then put
`ES_REFLEXIVE[pn]` in front of the result. Do it either inside `moodForm` for `es` or in
`predicateText`'s `finite` wrapper, using `reflexiveClitic`. Portuguese stores `tornar-se` the same
way (`me torno`) and shares `moodForm`. It is not checked here.

| | |
|---|---|
| **Test** | `hypothetical.test.ts` → *known bugs: Spanish reflexive verb in a conditional* (1 `test.fails`) |
