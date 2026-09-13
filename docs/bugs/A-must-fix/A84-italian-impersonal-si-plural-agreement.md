# A84. A predicate agreeing with the Italian impersonal "si" stays singular

**Language:** Italian

The impersonal `si` takes a singular verb, but whatever *agrees* with it is masculine plural: a
predicate adjective (`quando si è stanchi`, `si diventa vecchi`) and the participle of an
`essere` verb (`si è andati`). The Italian engine agrees both with the subject's features, which
GENERIC_PERSON seeds as 3sg (`packages/backend/src/concepts/pronouns.ts`). Two call sites read
them: the predicative branch of `complementsPhrase` (`languages/it/complementsPhrase.ts`,
`subjectForms['number']`) and the `essere` participle in `aspectVerb`
(`languages/it/aspectVerb.ts`).

| Clause | Now | Want |
|---|---|---|
| BE + TIRED | `si è stanco.` | `si è stanchi.` |
| BECOME + TIRED | `si diventa stanco.` | `si diventa stanchi.` |
| GO, resultative | `si è andato.` | `si è andati.` |

Not pinned: the compound form of BECOME (`si è diventato stanco.`, want `si è diventati
stanchi.`) and an `avere` verb in the compound tense, whose participle stays singular (`si è
mangiato`, the auxiliary defect). Spanish and Portuguese (`se está cansado`) are right: they agree
in the singular.

## Shape of the fix

For agreement only (not for the finite verb), treat a generic subject as masculine plural. That
means a small `agreementForms(subjectForms)` helper used by the predicative branch and by the
`essere` participle in `aspectVerb`.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: Italian agreement with the impersonal si* (1 `test.fails`) |
