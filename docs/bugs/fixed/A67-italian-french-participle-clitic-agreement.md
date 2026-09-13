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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.

- **Italian.** [`aspectVerb.ts`](../../../packages/engine/src/languages/it/aspectVerb.ts) and
  [`verbGroupInfinitive.ts`](../../../packages/engine/src/languages/it/verbGroupInfinitive.ts) take an
  optional `objectForms`, which an avere participle agrees with.
  [`predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts) passes it for a
  third-person object clitic only: `la ha vista`, `li ha visti`, `la aveva mangiata`, `la deve aver
  vista`, `se il gatto la avesse vista`, `il cane che la ha vista`. With `mi` / `ti` / `ci` / `vi` the
  agreement is optional and left out (`mi ha visto`). `lo` still reads `lo ha visto`. The clitic is not
  elided (`la ha`, not `l'ha`); the pin accepts both.
- **French.** [`predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts) computes
  the object clitic before the verb group and passes its forms to `aspectVerbFr` as the preceding
  object, unless an object relative already passes its antecedent. Every person agrees (`l'a vue`,
  `les a vues`, `m'a vue`, `nous a vues`, `l'avait vue`, `si le chat l'avait vue`). A group resumed by
  its clitic (A53) agrees as the group (`nous a vus, lui et moi`).

Every table row now renders as wanted. A noun object, the masculine singular and the object relative
(A37) are unchanged.

Not changed here:

- A feminine plural Italian object still takes the clitic `li` (`li ha viste`), which is A72.
- A French clitic under a modal is still misplaced (`la doit avoir vu`), which is A88. Its participle
  is left alone until the clitic sits after the modal.
- A negated French perfect elides `ne` wrongly before the clitic (`n'l'a pas vue`), which is A93.

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → *known bugs: Italian / French participle agreement…*. Both pinning `test.fails` are now passing
  `test`s. New cases:
  - the modal, a hypothetical, the pluperfect, a relative clause, the other persons and the resumed
    group;
  - guards for `lo`, `mi`, a noun object, the progressive and the object relative.
- Unit tests:
  - `aspectVerb.test.ts` and `verbGroupInfinitive.test.ts` (it);
  - `predicateText.test.ts` (it, fr).
