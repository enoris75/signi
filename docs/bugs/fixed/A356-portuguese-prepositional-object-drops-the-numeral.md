# A356. The Portuguese prepositional object drops the numeral

**Languages:** Portuguese

A verb that takes its object with a preposition of its own (DEPEND's *de*, CLICK's *em*,
[A139](../fixed/A139-click-prepositional-object.md)) builds that object in `prepObjectText`, which
writes the preposition, the determiner, a possessive and the noun, and never the numeral. So a counted
object loses its count after every determiner: *the two conditions* reads *the conditions*, *two
conditions* reads the bare plural *condições*, and the indefinite *one button* loses its article
altogether (*clica em botão*). [A340](../fixed/A340-spanish-personal-a-drops-or-loses-the-numeral-of-a-counted-human-object.md)
fixed the same gap in Spanish (*depende de las dos condiciones*).

| Case | Now | Want |
|---|---|---|
| the CAT DEPENDs on the two CONDITIONs | `o gato depende das condições.` | `o gato depende das duas condições.` |
| … negated | `o gato não depende das condições.` | `o gato não depende das duas condições.` |
| … on two CONDITIONs (indefinite) | `o gato depende de condições.` | `o gato depende de duas condições.` |
| … on these two CONDITIONs | `o gato depende destas condições.` | `o gato depende destas duas condições.` |
| … on those three CONDITIONs | `o gato depende dessas condições.` | `o gato depende dessas três condições.` |
| … on my two CONDITIONs | `o gato depende das minhas condições.` | `o gato depende das minhas duas condições.` |
| the CAT CLICKs the two BUTTONs | `o gato clica nos botões.` | `o gato clica nos dois botões.` |
| … one BUTTON (indefinite) | `o gato clica em botão.` | `o gato clica em um botão.` |

The Wants are what Portuguese writes for the plain object (`o gato vê as duas condições.`) and in a
complement since [A291](../fixed/A291-german-spanish-portuguese-drop-the-numeral-inside-a-complement.md),
after the fused preposition.

**Already right.** The one beside a definite, which A319 leaves out (`o gato depende da condição.`).
The plain object (`o gato vê as duas condições.`). An uncounted plural (`o gato depende das
condições.`). Spanish since A340, and the other five languages (`depends on the two conditions`,
`dipende dalle due condizioni`, `dépend des deux conditions`, `hängt von den zwei Bedingungen ab`,
二つの条件に依存しています).

## Shape of the fix

A340's, in [pt/prepObjectText.ts](../../../packages/engine/src/languages/pt/prepObjectText.ts): write
the numeral through `numeralText(f, CARDINALS)`, after the determiner and the possessive and before
the noun, leaving it out where `oneBesideDeterminer` says so, as
[es/prepObjectText.ts](../../../packages/engine/src/languages/es/prepObjectText.ts) and
[pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts) do. The
indefinite one needs the numeral in the determiner's place (*em um botão*), which is where
`numeralText` puts *um*.

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: the Portuguese prepositional object drops the numeral (A356)* (3 `test.fails`: the definite and the indefinite, the demonstratives and the possessive, CLICK's *em*; plus a regression test for the one beside a definite, the plain object, the uncounted plural and the other languages) |

Found after fixing A340, whose Spanish *a verb's own preposition keeps the numeral* Portuguese lacks,
2026-09-24.

## Resolved

Fixed on 2026-09-24 in [pt/prepObjectText.ts](../../../packages/engine/src/languages/pt/prepObjectText.ts),
A340's shape: the numeral is written through `numeralText(f, CARDINALS)` after the fused determiner
and a prenominal possessive and before the noun and its adjective (after the determiner and before
the noun where a possessive detaches), leaving out the one beside a definite or demonstrative
(`oneBesideDeterminer`, A319), as `complementsPhrase.ts` does: *depende das duas condições*, *destas
duas condições*, *das minhas duas condições*, *de duas condições*, *clica em um botão*.

The 3 `test.fails` in `known bugs: the Portuguese prepositional object drops the numeral (A356)` in
[numerals.test.ts](../../../packages/engine/test/numerals.test.ts) are plain tests now. The same block
gained a detached possessive (*destas duas condições minhas*, *de duas condições minhas*, *de uma
condição minha*), the one beside *this* and the indefinite one under *de*, an adjective (*nos três
botões grandes*), the bare two, *that* (*nesses dois botões*) and an approximator (*em cerca de cinco
botões*). The colocated `prepObjectText.test.ts` gained the definite, demonstrative and possessive
numeral and the one beside a definite.
