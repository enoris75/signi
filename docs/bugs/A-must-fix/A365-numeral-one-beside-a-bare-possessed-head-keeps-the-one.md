# A365. The numeral one beside a bare head with a pronominal possessive keeps the one

**Languages:** Italian, French, Spanish, Portuguese, German

[A357](../fixed/A357-numeral-one-beside-a-possessive-keeps-the-one.md) left the numeral one out beside a
definite or demonstrative head with a pronominal possessive (*il suo amico*, *son ami*) and had German
decline it with the mixed ending (*ihr einer Freund*). A head the plan marks `bare` renders the same
way with a possessive and no numeral (*il suo amico corre*, *ihr Freund läuft*), but with the numeral
one it takes neither path: it is not A329's indefinite, whose slot the possessive takes
(`indefinite_dropped`), and not an identifying determiner (`oneBesideDeterminer`). So the one is kept
after the possessive, and German leaves *ein* undeclined.

| Case | Now | Want |
|---|---|---|
| her one FRIEND RUNs (bare) | it `il suo un amico corre.` · fr `son un ami court.` · es `su un amigo corre.` · pt `o seu um amigo corre.` · de `ihr ein Freund läuft.` | it `il suo amico corre.` · fr `son ami court.` · es `su amigo corre.` · pt `o seu amigo corre.` · de `ihr einer Freund läuft.` |
| the CAT SEEs her one FRIEND | it `vede il suo un amico` · fr `voit son un ami` · es `ve a su un amigo` · pt `vê o seu um amigo` · de `sieht ihren ein Freund` | it `il gatto vede il suo amico.` · fr `le chat voit son ami.` · es `el gato ve a su amigo.` · pt `o gato vê o seu amigo.` · de `der Kater sieht ihren einen Freund.` |
| the CAT READs the BOOK of her one FRIEND | it `del suo un amico` · fr `de son un ami` · es `de su un amigo` · pt `do seu um amigo` · de `ihres ein Freundes` | it `del suo amico` · fr `de son ami` · es `de su amigo` · pt `do seu amigo` · de `ihres einen Freundes` |
| the CAT RUNs with her one FRIEND | it `con il suo un amico` · fr `avec son un ami` · es `con su un amigo` · pt `com o seu um amigo` · de `mit ihrem ein Freund` | it `con il suo amico` · fr `avec son ami` · es `con su amigo` · pt `com o seu amigo` · de `mit ihrem einen Freund` |
| the CAT DEPENDs on her one CONDITION | it `dalla sua una condizione` · fr `de sa une condition` · es `de su una condición` · pt `da sua uma condição` · de `von ihrer eine Bedingung ab` | it `dalla sua condizione` · fr `de sa condition` · es `de su condición` · pt `da sua condição` · de `von ihrer einen Bedingung ab` |

The Wants are A357's, since the bare possessed head renders as the definite one does.

**Already right.** English and Japanese (`her one friend runs.`, 彼女の一人の友達は走ります。). The bare
possessed head with no numeral (`il suo amico corre.`), the bare two (`i suoi due amici corrono.`),
and the bare one with no possessive (`un amico corre.`). The definite, demonstrative and indefinite
one beside a possessive (A357, A329).

## Shape of the fix

A357 dropped `&& !possessive` at every caller of
[oneBesideDeterminer.ts](../../../packages/engine/src/functions/oneBesideDeterminer.ts), which asks
whether the head's determiner is definite or demonstrative. A `bare` head with a pronominal
possessive should answer yes there as well, since the possessive stands in the determiner's place,
while a bare head with no possessive keeps its one (*un amico*). German's
[numeralDe.ts](../../../packages/engine/src/languages/de/numeralDe.ts) then declines it with the mixed
ending, as it does after a definite with a possessive.

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: the numeral one beside a bare head with a pronominal possessive keeps the one (A365)* (3 `test.fails`: the subject and the object, the possessor and the comitative, a verb's own preposition; plus a regression test for English and Japanese, no numeral, the bare two and the bare one with no possessive) |

Found by the A357 lane, 2026-09-24.
