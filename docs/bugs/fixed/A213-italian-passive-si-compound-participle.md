# A213. The Italian passive "si" does not agree its compound participle with the patient

**Language:** Italian

With the impersonal *si* and a noun patient, *si* is the passive *si*, and in a compound tense the
participle agrees with that patient: *si è salvat**a** l'opzione*, *le opzioni che si **sono**
salvat**e***. [A73](A73-impersonal-se-plural-object.md) made the finite verb agree with a plural
object, and the main clause's participle agreed with it too — but only in the plural, and an object
relative not at all: its gapped head *is* the patient, nothing handed it to the participle, and the
plural head's agreement was switched off in the compound tense by name.

Found building the headless relative gloss (localization
[C23](../../localization/done/C23-participial-state-adjectives.md)), whose Italian read *che si è
salvato* under a feminine antecedent. Masculine singular patients — OBJECT_THING, the antecedent
most of the participial glosses take — were never wrong, which is how it went unseen.

| Plan | Was | Want |
|---|---|---|
| GENERIC_PERSON SAVE (resultative), OPTION | `si è salvato l'opzione.` | `si è salvata l'opzione.` |
| OPTION with an object relative, GENERIC_PERSON SAVE (resultative) | `l'opzione che si è salvato.` | `l'opzione che si è salvata.` |
| the same, OPTION plural | `le opzioni che si è salvato.` | `le opzioni che si sono salvate.` |
| the same, BOOK plural | `i libri che si è salvato.` | `i libri che si sono salvati.` |
| the same under MUST, OPTION plural | `le opzioni che si deve aver salvato.` | `le opzioni che si devono aver salvate.` |

Already right: the main clause's plural (*si sono salvate le opzioni*), a masculine singular patient
(*si è salvato il libro*), and the simple tenses (*le opzioni che si salvano*).

## Resolved

**2026-09-22**, filed and fixed together.

- [`it/predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts) — the passive
  *si*'s patient is recognised in either number; only the plural moves the finite verb, but the
  compound participle agrees with it in both. A new last parameter, `gappedPatient`, carries an
  object relative's unspoken head to the same agreement.
- [`it/relativeText.ts`](../../../packages/engine/src/languages/it/relativeText.ts) — an object gap
  under a generic subject passes its head's gender and number as that patient, and the plural head's
  agreement is no longer dropped in the compound tense.

The modal's compound infinitive takes the agreement the main clause already gave it (*si devono
aver salvate le opzioni*); whether that reads better as *si devono essere salvate* is a separate
question and was not changed.

| | |
|---|---|
| **Tests** | `relative.test.ts` → *known bugs: the Italian passive si and its compound participle (A213)*: the main clause's singular patient, the object relative in both genders and numbers, and the modal and simple tenses unchanged. Colocated: `it/predicateText.test.ts`, `it/relativeText.test.ts`. `relative-gloss.test.ts` now pins the Italian of its feminine and plural antecedents |
