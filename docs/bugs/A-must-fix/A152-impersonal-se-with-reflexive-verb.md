# A152. Spanish and Portuguese double "se" when the impersonal subject meets a reflexive verb

**Languages:** Spanish, Portuguese

The generic subject (GENERIC_PERSON, "one") is rendered in Spanish and Portuguese as the impersonal
clitic `se`, in front of the verb (`se come`). A reflexive verb's stored forms already carry their own
`se` (`se mueve`, `se vuelve`), so the two stack:

| Clause | Now | Want |
|---|---|---|
| es: GENERIC_PERSON MOVE_ONESELF | `se se mueve.` | `uno se mueve.` |
| es: GENERIC_PERSON MOVE_ONESELF, resultative | `se se ha movido.` | `uno se ha movido.` |
| es: GENERIC_PERSON BECOME HAPPY | `se se vuelve feliz.` | `uno se vuelve feliz.` |
| pt: GENERIC_PERSON MOVE_ONESELF | `se se move.` | no doubled `se` (`a gente se move.`, or a generic noun) |
| pt: GENERIC_PERSON BECOME HAPPY | `se se torna feliz.` | no doubled `se` |

Impersonal `se` cannot stand with a reflexive `se` in either language. Spanish takes the generic
pronoun `uno` for a reflexive verb. Portuguese has no single standard form: colloquial Brazilian
takes `a gente`, and a written text takes a generic noun (`a pessoa`). The pinning test asserts only
that `se` is not doubled.

Already right: French `on se déplace`, which has a subject pronoun of its own, and Italian `ci si
muove`. The Italian reflexive clitic turns into `ci` before the impersonal `si` (localization C17).

Found while seeding MOVE_ONESELF for localization C17. It was already live for BECOME.

## Shape of the fix

In each `predicateText`, when the subject is generic (`subjectForms['generic'] === '1'`) and the
verb is reflexive (`reflexiveClitic` is not empty), render the generic subject as a word (es `uno`)
instead of the impersonal clitic, and let the verb keep its own 3rd-person `se`. The subject slot
is emptied upstream for a generic subject, so the engine needs to know to write it back in this case.

| | |
|---|---|
| **Test** | `reflexive.test.ts` → *known bugs: Spanish and Portuguese impersonal subject of a reflexive verb* (2 `test.fails`, plus a regression test for French and Italian) |
