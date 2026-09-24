# A337. French HOUR does not elide

**Languages:** French

French elides *le* / *la* before a vowel sound, and "heure" opens on one: its h is muet, so the
article is "l'heure", never "la heure". The engine elides on its own before a written vowel
("l'année"), but an h says nothing about how it sounds ("l'homme" but "la hauteur"), so the lexeme
must say so with `elides: '1'`, as MAN ("homme"), GRASS ("herbe") and STORY ("histoire") already
do. HOUR's French form has no flag, so every definite HOUR comes out "la heure", in any slot.

| Case | Now | Want |
|---|---|---|
| the HOUR RUNs (subject) | `la heure court.` | `l'heure court.` |
| the CAT RUNs during the HOUR (temporal) | `le chat court pendant la heure.` | `le chat court pendant l'heure.` |
| the CAT RUNs between the DAY and the HOUR (P09-E20) | `le chat court entre le jour et la heure.` | `le chat court entre le jour et l'heure.` |
| the CAT SEEs the BOOK of the HOUR (possessor, not pinned) | `le chat voit le livre de la heure.` | `le chat voit le livre de l'heure.` |

Every Want string was rendered by the engine, with the fix applied to a throwaway copy of the tree
(HOUR's `fr` form given `elides: '1'`, the harness reseeding from source). Each differs from Now only
by the elision. The same copy renders "les heures courent." and "cette heure court." unchanged.

**Already right.** Vowel-initial times elide by themselves: "l'année court.", "pendant l'année".
The demonstrative is right ("cette heure", since *cette* never elides). The other six languages
are fine: en "during the hour", it "durante l'ora", de "während der Stunde", es "durante la hora",
pt "durante a hora", ja 時間の間に.

**Same defect elsewhere (not pinned).** Of the corpus's French nouns that start with an h, one more
is h muet with no flag: HYPERNYM, "hyperonyme", which renders `le hyperonyme court.` for
*l'hyperonyme court.* (verified with the same trial fix). HEIGHT's "hauteur" is h aspiré and is right
without the flag ("la hauteur"). The adjective "heureux" was not probed.

## Shape of the fix

Data, not engine. In [nouns.ts](../../../packages/backend/src/concepts/nouns.ts), add
`elides: '1'` to HOUR's `fr` form (`{ base: 'heure', … }`), and to HYPERNYM's (`{ base: 'hyperonyme', … }`)
while there, then reseed `signi.db`. Nothing for the fixer to decide.

Pinned by `known bugs: French HOUR does not elide (A337)` in
[temporal.test.ts](../../../packages/engine/test/complements/temporal.test.ts).

Found on 2026-09-24 by the P09-E20 coverage audit, rendering `between` over the DAY and the HOUR.

## Resolved

Fixed on 2026-09-24 while landing P09-E25 to E43, whose `within` and `for` relations (E34, E35) put
HOUR behind a definite in every row of their tables. HOUR's `fr` form in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts) has `elides: '1'`, and so has
**HYPERNYM**'s (`l'hyperonyme`, pinned in [nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts),
*French HYPERNYM elides its article*). The two `test.fails` in
[temporal.test.ts](../../../packages/engine/test/complements/temporal.test.ts) are plain tests now,
assertions unchanged. `signi.db` is reseeded.
