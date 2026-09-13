# A102. A Spanish reflexive verb's non-finite forms keep a fixed `se`, or lose it under a modal

**Language:** Spanish

Spanish reflexivity is lexical. BECOME is `volverse`, and its stored finite forms carry the clitic
(`me vuelvo`, `se vuelve`). The stored non-finite forms carry the 3rd-person clitic, attached
(`volverse`, `volviéndose`), or none at all (`vuelto`). A30 fixed the finite compound past, where
`aspectVerb` now puts `reflexiveClitic` in front of `haber` (`se ha vuelto`, `me he vuelto`).
Nothing does the same for the non-finite verb group:

- `verbGroupInfinitive` (`languages/es/verbGroupInfinitive.ts`), which a modal governs, gets no
  subject forms. It emits the stored `volverse` / `estar volviéndose` for every person, and
  `haber vuelto` with no clitic. Without the clitic, `vuelto` is the participle of *volver*
  "return", not of *volverse* "become".
- `aspectVerb`'s progressive and prospective (`languages/es/aspectVerb.ts`) use the stored gerund
  and infinitive as they are, so any subject other than the 3rd person gets `se`.

| Clause | Now | Want |
|---|---|---|
| MUST + resultative, 3sg | `el gato debe haber vuelto una leyenda.` | `el gato debe haberse vuelto una leyenda.` |
| MUST, 1sg | `debo volverse una leyenda.` | `debo volverme una leyenda.` |
| prospective, 1sg | `estoy a punto de volverse una leyenda.` | `estoy a punto de volverme una leyenda.` |
| progressive, 1sg | `estoy volviéndose una leyenda.` | `estoy volviéndome una leyenda.` |

The same path gives `quiero poder volverse`, `debéis volverse`, `estábamos volviéndose`, the relative
`el perro que debe haber vuelto una leyenda corre.` and the conditional `debería haber vuelto`.
Already right: every 3rd-person form except the modal resultative (`debe volverse`, `está
volviéndose`), and the finite compound past. Moving the clitic in front of the finite verb (`me debo
volver`, `me estoy volviendo`) is equally standard. The targets keep it attached, as the engine
already does in the 3rd person.

The verb.conjugation snapshot (`test/__snapshots__/verb.conjugation.test.ts.snap`, BECOME) records
the wrong 1st/2nd-person forms. The 12 progressive entries run from line 2729 (`estaremos
volviéndose.`) to 3140 (`estás volviéndose.`), and the 12 prospective entries from line 2738
(`estaremos a punto de volverse.`) to 3149. They change with the fix.

## Shape of the fix

One helper for the reflexive non-finite form: strip the lexical `se` from the stored infinitive or
gerund and attach `reflexiveClitic(verbForms, subjectForms)` (`volver` + `me`, `volviéndo` + `me`).
For the resultative, attach it to `haber` (`haberse vuelto`). `verbGroupInfinitive` needs the
subject forms passed in, and `aspectVerb` should use the helper for the progressive and prospective.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: Spanish reflexive verb in a non-finite verb group* (1 `test.fails`) |
