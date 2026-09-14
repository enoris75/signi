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

## Resolved

Fixed 2026-09-14. The adjective uses German's existing inherent-adjective key rather than a new
`lead_adjective`: YOUNG_WOMAN's `adjective: 'jung'` already declines through `adjPhrase`.

- **Corpus:** the six German names ([`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts)) are
  `base: 'Bestimmung'`, `plural: 'Bestimmungen'`, `adjective: 'adverbial'`, with the fixed genitive in
  `postnominal` (`'des Ortes'`). `citation` keeps the whole name for the picker. The dev database needs
  `npm run seed`.
- **Engine:** [`postnominal`](../../../packages/engine/src/languages/de/postnominal.ts) (new) appends the fixed
  words after the declined head in [`nounPhrase`](../../../packages/engine/src/languages/de/nounPhrase.ts),
  [`possessorText`](../../../packages/engine/src/languages/de/possessorText.ts) and
  [`complementsPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts). The
  dative-plural *-n* therefore goes on the head: "den adverbialen Bestimmungen der Richtung", never
  "*Richtungn".
- **Backend:** the noun label in [`index.ts`](../../../packages/backend/src/index.ts) prefers a `citation`
  form, so the German picker still shows "adverbiale Bestimmung des Ortes".
- **Tests:** [`nounPhrase.test.ts`](../../../packages/engine/test/nounPhrase.test.ts) → *known bugs: the
  adjective inside a German multiword noun*. Both pinning `test.fails` are now passing `test`s. New cases
  cover the dative plural, a possessor's *von*, the accusative plural and the phrase's own adjective. The
  regression guard adds *keine*, *eine* and *viele*.
  - The grammar-noun table in the same file now reads "die adverbialen Bestimmungen" for LOCATIVE,
    DIRECTION, SOURCE, ROUTE and CAUSE_COMPLEMENT.
  - Unit tests: `de/postnominal.test.ts`, `nounPhrase`, `possessorText`, `complementsPhrase`.
  - Backend: `index.test.ts` (the citation label) and `concepts/index.test.ts` (a `postnominal` noun's
    citation spells the whole name).

Not changed: YOUNG_WOMAN's German label is still its head alone ("Frau"). It could take a `citation`
("junge Frau") the same way.
