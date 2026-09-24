# A319. The numeral one beside a definite or demonstrative determiner

**Languages:** Italian, French, Spanish, Portuguese, German

A counted phrase with the numeral one and a definite or demonstrative determiner (*the one dog*,
*this one dog*) writes the determiner and then the numeral as it stands alone. In Romance the
numeral one *is* the indefinite article, so the phrase says "the a dog". German leaves *ein*
undeclined, where after *der* or *dieser* it declines like an adjective.

| Case | Now | Want |
|---|---|---|
| the one DOG RUNs | it `l'un cane corre.` · fr `l'un chien court.` · es `el un perro corre.` · pt `o um cão corre.` · de `der ein Hund läuft.` | `il cane corre.` · `le chien court.` · `el perro corre.` · `o cão corre.` · `der eine Hund läuft.` |
| the CAT SEEs the one DOG | it `il gatto vede l'un cane.` · es `el gato ve el un perro.` · pt `o gato vê o um cão.` · de `der Kater sieht den ein Hund.` | `il gatto vede il cane.` · `el gato ve el perro.` · `o gato vê o cão.` · `der Kater sieht den einen Hund.` |
| this one DOG RUNs | it `quest'un cane corre.` · fr `cet un chien court.` · es `este un perro corre.` · pt `este um cão corre.` · de `dieser ein Hund läuft.` | `questo cane corre.` · `ce chien court.` · `este perro corre.` · `este cão corre.` · `dieser eine Hund läuft.` |
| the CAT RUNs with the one DOG | it `il gatto corre con l'un cane.` · fr `le chat court avec l'un chien.` · de `der Kater läuft mit dem Hund.` (A291) | `il gatto corre con il cane.` · `le chat court avec le chien.` · `der Kater läuft mit dem einen Hund.` |

**Why this target.**
- **Romance:** drop the one. A definite or demonstrative that counts one is simply the singular.
  The alternatives *l'unico / le seul / el único / o único* mean *the only*, which changes the
  meaning. The Romance Wants are what the same plan renders without the numeral (pinned as the
  regression).
- **German:** *ein* takes the weak adjective ending after a determiner that shows the case: *der
  eine Hund*, *den einen Hund*, *dem einen Hund*, *dieser eine Hund*. These were written from the
  weak ending the engine already gives an adjective in that slot (`den alten Hund`, pinned beside
  it). They were not rendered, because the engine has no form for them yet. The fixer must render
  them before flipping the pin.

**Already right.** English *the one dog* and *this one dog*; Japanese 一匹の犬; the indefinite one
in every language (*un cane*, *ein Hund*); the definite two (*i due cani*, *die zwei Hunde*).

**Not here.**
- The French object (`le chat voit un chien.` for *le chien*) is A289, the French definite numeral
  object dropping its article.
- The German complement drops the numeral altogether today (`mit dem Hund`, A291). Another session's
  A291 fix makes it `mit dem ein Hund`, still this bug.
- A numeral one beside a possessive (*il mio un amico*) is A329's.

**Shape of the fix.** Where the counted head's determiner and numeral are joined (the numeral
path each engine shares with A289 and A329): at one, with a definite or demonstrative determiner,
Romance writes no numeral and German writes *ein* with the weak ending of the determiner's case.

Pinned by `known bugs: the numeral one beside a definite or demonstrative determiner (A319)` in
[numerals.test.ts](../../../packages/engine/test/numerals.test.ts).

Found on 2026-09-24 by the A277 / P11-E4 coverage lane (and seen independently by another session's
P09-E25–E43 lane, which left it to this file, with the complement slot).

## Resolved

2026-09-24. A shared test, [oneBesideDeterminer.ts](../../../packages/engine/src/functions/oneBesideDeterminer.ts),
says whether a phrase counts one beside a definite or demonstrative determiner. Where each Romance
engine joins the numeral to its phrase, it then writes none, and the phrase is the singular it counts:
Italian [renderNP.ts](../../../packages/engine/src/languages/it/renderNP.ts), French
[renderNP.ts](../../../packages/engine/src/languages/fr/renderNP.ts), and Spanish and Portuguese
`nounPhrase.ts` and `complementsPhrase.ts`
([es](../../../packages/engine/src/languages/es/nounPhrase.ts), [pt](../../../packages/engine/src/languages/pt/nounPhrase.ts)).
German's new [numeralDe.ts](../../../packages/engine/src/languages/de/numeralDe.ts) declines *ein*
as an adjective after that determiner (`der eine Hund`, `den einen Hund`, `dem einen Hund`, `dieser eine
Hund`, `während der einen Stunde`). It is called from [nounPhrase.ts](../../../packages/engine/src/languages/de/nounPhrase.ts)
and [complementsPhrase.ts](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts).
A pronominal possessive in the determiner's place (*il mio un amico*) is left as it was, for A329.

Guarded by the four tests of *known bugs: the numeral one beside a definite or demonstrative
determiner (A319)* in [numerals.test.ts](../../../packages/engine/test/numerals.test.ts), now plain
tests with their assertions unchanged. The same block gained a new case: the distal, the feminine, an
adjective, the Spanish and Portuguese comitative, the German dative recipient and genitive, and the
French object, negated or not. It also gained the colocated
[oneBesideDeterminer.test.ts](../../../packages/engine/src/functions/oneBesideDeterminer.test.ts) and
[numeralDe.test.ts](../../../packages/engine/src/languages/de/numeralDe.test.ts).

Still open, left alone because they are possessor paths: a Spanish or Portuguese *noun* possessor
counted by one beside the definite (`el libro del un hombre`, `o livro do um homem`, from the
`numeralText` call in each `possessorText.ts`), and the German possessor question (`wessen ein
Buch`).
