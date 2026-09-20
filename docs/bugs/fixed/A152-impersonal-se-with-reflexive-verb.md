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

## Resolved

Fixed on 2026-09-20 by giving GENERIC_PERSON a second surface and letting the two `predicateText`s
choose between them:

- `generic_reflexive` on the Spanish and Portuguese lexemes
  ([`concepts/pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts)): Spanish takes the
  standard pronoun 'uno'; Portuguese has no single standard form and takes the colloquial 'a
  gente', which the engine's 'você' paradigm (A108) already leans towards. A written Portuguese
  would say 'a pessoa' — one had to be picked, and the test pins only that 'se' is not doubled.
- [es](../../../packages/engine/src/languages/es/predicateText.ts) and
  [pt](../../../packages/engine/src/languages/pt/predicateText.ts): when the subject is generic and
  the verb is reflexive, the impersonal clitic is suppressed and the word is written back into the
  subject slot the clause emptied, ahead of the negator, the fronted 'nunca' and the verb group.
  Portuguese also stops treating the clause as verb-initial there, so a 3rd-person object clitic no
  longer enclitizes.

Guarded by `reflexive.test.ts` → *known bugs: Spanish and Portuguese impersonal subject of a
reflexive verb*: both former `test.fails` now pass, plus Portuguese's own surface, the negation, the
fronted 'nunca', a modal, the resultative and BECOME, with regressions that French and Italian are
unchanged and that a non-reflexive verb keeps the impersonal clitic, in a clause and in a relative one.
