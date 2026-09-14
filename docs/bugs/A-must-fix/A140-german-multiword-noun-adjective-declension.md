# A140. The adjective inside a German multiword noun does not decline

**Language:** German

A grammar term that no two traditions cut the same way is seeded as one noun per language, and German's
often carries an attributive adjective: *adverbiale Bestimmung des Ortes* (LOCATIVE), plural *adverbiale
Bestimmungen des Ortes*. The adjective sits inside the stored forms, so it never declines. That reads right
only where its ending happens to be *-e*: the nominative and accusative singular, and the plural with no
article. After an article in the plural, and in the dative and genitive, it needs *-en*.

| Phrase | Now | Want |
|---|---|---|
| de: the LOCATIVEs | `die adverbiale Bestimmungen des Ortes.` | `die adverbialen Bestimmungen des Ortes.` |
| de: the ADVERBIAL_OF_MANNERs | `die adverbiale Bestimmungen der Art und Weise.` | `die adverbialen Bestimmungen der Art und Weise.` |
| de: CAT START with the LOCATIVE | `der Kater beginnt mit der adverbiale Bestimmung des Ortes.` | `der Kater beginnt mit der adverbialen Bestimmung des Ortes.` |

Already right: `diese adverbiale Bestimmung des Ortes`, the bare plural `adverbiale Bestimmungen des
Ortes`, and every UI string: the canvas names a complement in the singular nominative or accusative
("Die adverbiale Bestimmung des Ortes entfernen").

The nouns with this shape: LOCATIVE, DIRECTION, SOURCE, ROUTE, CAUSE_COMPLEMENT (seeded by
[B23](../../localization/done/B23-ui-complement-and-group-names.md)) and ADVERBIAL_OF_MANNER.

## Shape of the fix

Take the adjective out of the noun's forms and let the German engine decline it: a form key naming the
leading adjective's stem (`lead_adjective: 'adverbial'`, base `Bestimmung des Ortes`), declined with the
article's strength, case and number like any attributive adjective (see `adjPhrase.ts`). The tail after
the head noun (*des Ortes*) is a fixed genitive and does not change.

| | |
|---|---|
| **Test** | `nounPhrase.test.ts` → *known bugs: the adjective inside a German multiword noun* (2 `test.fails`, plus a regression test for the forms that already read right) |
