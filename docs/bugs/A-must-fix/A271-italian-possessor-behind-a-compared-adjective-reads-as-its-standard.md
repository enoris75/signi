# A271. An Italian possessor behind a compared adjective reads as its standard

**Languages:** Italian

Italian writes a noun's possessor after the noun and its post-nominal adjectives. Behind an adjective
with a degree, that is exactly where the standard of comparison goes, and Italian marks its standard
with *di*, the preposition its possessor takes. *Un gatto più piccolo della donna* says *a cat smaller
than the woman*, not *the woman's smaller cat*.

| Case | Now | Want |
|---|---|---|
| the MAN SEEs a smaller (`more`) CAT of the WOMAN | `l'uomo vede un gatto più piccolo della donna.` | `l'uomo vede un gatto della donna più piccolo.` |
| … a less SMALL (`less`) CAT | `l'uomo vede un gatto meno piccolo della donna.` | `l'uomo vede un gatto della donna meno piccolo.` |
| … smaller CATs | `l'uomo vede gatti più piccoli della donna.` | `l'uomo vede gatti della donna più piccoli.` |

**Why this target, and why A.** With the possessor ahead of the compared adjective, a *di* phrase no
longer follows the comparative, so the standard reading is gone. The adjective's agreement then ties
it to its noun: *più piccolo* is masculine singular like *gatto*, and cannot be *della donna*'s. An
epicene adjective such as *grande* over a possessor of the same number keeps an ordinary attachment
ambiguity (*un gatto della donna più grande*, "of the bigger woman"). Italian has that ambiguity
for every adjective after a *di* phrase, and it is milder than a sentence that reads as a comparison
the plan does not make. So there is an order that fixes the misreading, and this is filed as A rather
than as a B simplification. A superlative (`most`, `least`) keeps today's order: its *di* is the
partitive a superlative takes, and with the article the reading is C01's homophony.

**Spanish, French and Portuguese are not affected.** Their standard is *que* / *que* / *(do) que*. A
*de* after a comparative there introduces only a number (*más de tres*), so `un gato más pequeño de
la mujer`, `un chat plus petit de la femme` and `um gato menor da mulher` read as the possessor. With
the definite article they read as a superlative (*el gato más pequeño de la mujer*), which is C01.
They are pinned as they are.

**Already right.** A positive adjective (`un piccolo gatto della donna`), a compared adjective with
no possessor (`un gatto più grande`), and German, English and Japanese (`einen kleineren Kater der
Frau`, `the woman's smaller cat`, 女のもっと小さい猫).

**Shape of the fix.** In the Italian noun phrase, a possessor goes before the post-nominal adjectives
when one of them carries a `more`, `less` or `equally` degree.

**Nothing shipped shows it**: no gloss has an attributive comparative beside a possessor.

Pinned by `known bugs: an Italian possessor behind a compared adjective reads as its standard (A271)`
in [possession.test.ts](../../../packages/engine/test/possession.test.ts).

Found by P09-E12 while its tasks were being written.
