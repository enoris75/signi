# A67. The Italian and French past participle ignores a preceding object clitic

**Language:** Italian, French

With avere / avoir, the past participle agrees with a direct object that precedes it, and a third-person object clitic always does: `l'ha vista`, `l'a vue`. Neither engine passes the clitic's gender and number to the participle.

## Italian

With `avere`, the past participle agrees in gender and number with a third-person object clitic
that comes before it: `l'ha vista`, `li ha visti`, `le ha viste`. `aspectVerb`
(`languages/it/aspectVerb.ts`) agrees the participle only for an `essere` verb, with the subject,
and never sees the object. `predicateText` (`languages/it/predicateText.ts`) computes the clitic
but does not pass its features down. So `la` and `li` always get the default masculine singular
`visto`. The same happens under a modal (`il gatto la deve aver visto.`, want `vista`) and in a
hypothetical (`se il gatto la avesse visto, …`).

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON fem | `il gatto la ha visto.` | `il gatto l'ha vista.` |
| THIRD_PERSON plural | `il gatto li ha visto.` | `il gatto li ha visti.` |
| THIRD_PERSON fem, past | `il gatto la aveva mangiato.` | `il gatto l'aveva mangiata.` |

Eliding `lo` / `la` before a form of `avere` (`l'ha`) is the usual spelling but not required, so
the pin accepts `la ha vista` and pins only the agreement. A feminine plural object also needs the
separate `le` clitic fix (today `il gatto li ha visto.`, want `il gatto le ha viste.`). Already
right: `lo` (`lo ha visto`) and `mi` / `ti` / `ci` / `vi`, where agreement is optional
(`mi ha visto`).

### Shape of the fix

When the direct object is a third-person clitic, pass its gender/number to `aspectVerb` (and to
`verbGroupInfinitive` for the modal case). Agree the `avere` participle with it through
`agreeAdj`. Optionally, elide `lo` / `la` → `l'` before a vowel- or h-initial auxiliary.

## French

An *avoir* participle agrees with a direct object that comes before it, and an object clitic always
comes before it: `le chat l'a vue`, `les a vus`. A37 added this agreement through the
`precedingObjectForms` argument of `aspectVerbFr` (`languages/fr/aspectVerbFr.ts`). The only caller
that passes it is `relativeText`, for an object relative (`la souris que le chat a mangée`).
`predicateText` never passes the clitic's own forms, so a cliticised object leaves the participle in
its base form. A37 anticipated this case (`il l'a mangée`), which was then blocked by A32, but the
fix never covered it.

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON, feminine | `le chat l'a vu.` | `le chat l'a vue.` |
| THIRD_PERSON, plural | `le chat les a vu.` | `le chat les a vus.` |
| THIRD_PERSON, feminine plural | `le chat les a vu.` | `le chat les a vues.` |

Already right: the masculine singular (`le chat l'a vu.`), the object relative (A37), and a noun
object after the verb (`le chat a vu la souris.`).

### Shape of the fix

When `predicateText` has an `objectClitic`, pass that pronoun's head forms as `precedingObjectForms`
to `aspectVerbFr`. Do the same in the modal chain's resultative (`verbGroupInfinitiveFr`,
`doit l'avoir vue`) once the clitic sits there.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: Italian participle agreement with a preceding object clitic*; `objectPronoun.test.ts` → *known bugs: French participle agreement with an object clitic* (2 `test.fails`) |
