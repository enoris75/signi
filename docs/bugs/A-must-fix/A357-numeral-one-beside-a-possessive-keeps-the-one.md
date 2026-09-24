# A357. The numeral one beside a pronominal possessive keeps the one

**Languages:** Italian, French, Spanish, Portuguese, German

[A319](../fixed/A319-numeral-one-beside-a-definite-or-demonstrative-determiner.md) ruled on the numeral
one beside a definite or demonstrative determiner: Romance leaves it out, since the cardinal one is
its indefinite article's own word and the phrase is simply the singular (*il cane*, *este perro*), and
German declines it as an adjective after the determiner (*der eine Hund*, *den einen Hund*). It left
a pronominal possessive in the determiner's place for
[A329](../fixed/A329-a-numeral-beside-a-possessive-ignores-the-indefinite.md), which fixed the
indefinite (*un mio amico*, *un amigo mío*) and recorded the definite as "not settled here … its own
defect, not catalogued yet". The caller still writes the one there
(`oneBesideDeterminer(f) && !possessive`), so every Romance language puts an indefinite article after
the possessive, and German leaves *ein* undeclined.

| Case | Now | Want |
|---|---|---|
| her one FRIEND RUNs | it `il suo un amico corre.` · fr `son un ami court.` · es `su un amigo corre.` · pt `o seu um amigo corre.` · de `ihr ein Freund läuft.` | it `il suo amico corre.` · fr `son ami court.` · es `su amigo corre.` · pt `o seu amigo corre.` · de `ihr einer Freund läuft.` |
| the CAT SEEs her one FRIEND | it `vede il suo un amico` · fr `voit son un ami` · es `ve a su un amigo` · pt `vê o seu um amigo` · de `sieht ihren ein Freund` | it `il gatto vede il suo amico.` · fr `le chat voit son ami.` · es `el gato ve a su amigo.` · pt `o gato vê o seu amigo.` · de `der Kater sieht ihren einen Freund.` |
| the CAT READs the BOOK of her one FRIEND | it `del suo un amico` · fr `de son un ami` · es `de su un amigo` · pt `do seu um amigo` · de `ihres ein Freundes` | it `il gatto legge il libro del suo amico.` · fr `le chat lit le livre de son ami.` · es `el gato lee el libro de su amigo.` · pt `o gato lê o livro do seu amigo.` · de `der Kater liest das Buch ihres einen Freundes.` |
| the CAT RUNs with her one FRIEND | it `con il suo un amico` · fr `avec son un ami` · es `con su un amigo` · pt `com o seu um amigo` · de `mit ihrem ein Freund` | it `il gatto corre con il suo amico.` · fr `le chat court avec son ami.` · es `el gato corre con su amigo.` · pt `o gato corre com o seu amigo.` · de `der Kater läuft mit ihrem einen Freund.` |
| this one FRIEND of hers RUNs | it `questo suo un amico` · fr `cet un ami à elle` · es `este un amigo suyo` · pt `este um amigo seu` · de `dieser ein Freund von ihr` | it `questo suo amico corre.` · fr `cet ami à elle court.` · es `este amigo suyo corre.` · pt `este amigo seu corre.` · de `dieser eine Freund von ihr läuft.` |
| the CAT READs the BOOK of this one FRIEND of hers | it `di questo suo un amico` · fr `de cet un ami à elle` · es `de este un amigo suyo` · pt `deste um amigo seu` · de `dieses ein Freundes von ihr` | it `il gatto legge il libro di questo suo amico.` · fr `le chat lit le livre de cet ami à elle.` · es `el gato lee el libro de este amigo suyo.` · pt `o gato lê o livro deste amigo seu.` · de `der Kater liest das Buch dieses einen Freundes von ihr.` |

Each Romance Want is the phrase the same plan renders without the numeral (`il gatto vede il suo
amico.`, `este amigo suyo corre.`), A319's target. Each German Want is A319's adjectival *ein*, with
the mixed ending an adjective takes after an ein-word (*ihr alter Freund*, *ihren alten Freund*).

**Already right.** English and Japanese (`her one friend runs.`, 彼女の一人の友達は走ります。). The
indefinite one (`un mio amico corre.`, `un amigo mío corre.`, `ein Freund von mir läuft.`, A329). The
same phrases without the numeral. The definite two (`mis dos amigos corren.`, `os meus dois amigos
correm.`).

## Shape of the fix

[oneBesideDeterminer.ts](../../../packages/engine/src/functions/oneBesideDeterminer.ts) says of the
possessive "the caller leaves it out", and every caller does: `oneBesideDeterminer(f) && !possessive ?
'' : numeralText(…)` in [es/nounPhrase.ts](../../../packages/engine/src/languages/es/nounPhrase.ts),
[pt/nounPhrase.ts](../../../packages/engine/src/languages/pt/nounPhrase.ts), the two
`complementsPhrase.ts`, the two `possessorText.ts` and
[es/prepObjectText.ts](../../../packages/engine/src/languages/es/prepObjectText.ts). A definite or
demonstrative head with a pronominal possessive is as identifying as one without, so the one should be
left out there too (drop `&& !possessive`, keeping the indefinite one that A329's
`keptBesidePossessive` gives its slot to). Italian and French have the same condition
(`&& !pronominalPoss`, `&& !pronominal`) in
[it/renderNP.ts](../../../packages/engine/src/languages/it/renderNP.ts) and
[fr/renderNP.ts](../../../packages/engine/src/languages/fr/renderNP.ts). German's
[numeralDe.ts](../../../packages/engine/src/languages/de/numeralDe.ts) declines *ein* after a
determiner but not when `possessed`; it should after a possessive too, with the mixed ending.

**Decisions for the fixer:**

- **German.** A329 asked whether one keeps its word under a definite (*der eine Freund*) or
  disappears; A319 kept it, declined. The Wants follow A319 (*ihr einer Freund*). *ihr einziger
  Freund* ("her only friend") says more than the plan does.

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: the numeral one beside a pronominal possessive keeps the one (A357)* (4 `test.fails`: the subject and the object, the possessor and the comitative, beside a demonstrative, German; plus a regression test for English and Japanese, the indefinite one, no numeral and the definite two) |

Found by the lanes' cross-lane probe after A319 and A329, 2026-09-24.
