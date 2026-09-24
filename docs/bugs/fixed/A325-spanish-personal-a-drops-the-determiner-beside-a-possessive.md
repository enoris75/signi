# A325. The Spanish personal *a* drops the determiner beside a possessive

**Languages:** Spanish

A Spanish possessive and a determiner can stand together only one way: the determiner keeps its
slot and the possessive follows the noun in its stressed form (*un amigo mío*, *este amigo mío*,
*ningún amigo mío*; A187, A277). *Todos* is the one that keeps the unstressed possessive, *todos mis
amigos* (A237). The engine does this everywhere except on a human direct object. There the personal
*a* builds the phrase, and that builder puts the prenominal possessive in place of whatever
determiner the head has. So *a friend of mine*, *this friend of mine*, *some friends of mine*, *no
friend of mine* and *all my friends* all come out as *my friend(s)*.

| Case | Now | Want |
|---|---|---|
| the CAT SEEs FRIEND {indefinite, possessor: 1sg} | `el gato ve a mi amigo.` | `el gato ve a un amigo mío.` |
| … FRIEND {indefinite, plural} | `el gato ve a mis amigos.` | `el gato ve a unos amigos míos.` |
| … FRIEND {this} | `el gato ve a mi amigo.` | `el gato ve a este amigo mío.` |
| … FRIEND {some, plural} | `el gato ve a mis amigos.` | `el gato ve a algunos amigos míos.` |
| … FRIEND {no} | `el gato no ve a mi amigo.` | `el gato no ve a ningún amigo mío.` |
| … FRIEND {all, plural} | `el gato ve a mis amigos.` | `el gato ve a todos mis amigos.` |
| … FRIEND {indefinite}, negated | `el gato no ve a mi amigo.` | `el gato no ve a un amigo mío.` |
| the MAN SEEs FRIEND {indefinite, possessor: coreferent subject} (P11-E2) | `el hombre ve a su amigo.` | `el hombre ve a un amigo suyo.` |

Every Want string was rendered by the engine with the fix below applied to a throwaway copy of the
packages. The *no* row shows the loss is more than a missing article: the negative determiner goes
and the sentence denies a definite friend.

**Already right.**

- A thing takes no personal *a*, and is right: `el gato ve una casa mía.`
- So is every complement, which has its own builder: `corre con un amigo mío`, `da el libro a este
  amigo mío`.
- The definite is right (`ve a mi amigo`), and so is the plain indefinite (`ve a un amigo`).
- The other six render all eight rows correctly (`the cat sees a friend of mine`, `vede un mio
  amico`, `voit un ami à moi`, `sieht einen Freund von mir`, `vê um amigo meu`).

**Why it was missed.** The *this*, *some* and *no* rows go back to A187. A277 added the indefinite,
and its "every slot keeps the indefinite" test leaves Spanish out of the object row.

## Shape of the fix

[`es/objectNounText.ts`](../../../packages/engine/src/languages/es/objectNounText.ts) sends a human
object to
[`prepObjectText(np, 'a')`](../../../packages/engine/src/languages/es/prepObjectText.ts). That
builds its head from `possessedHeadForms(np, 'bare')` and puts `esPossessiveWord(np)` in front of the
noun, with no `KEPT_BESIDE_POSSESSIVE` check. The complement builder
(`es/complementsPhrase.ts`, A202) and `es/possessorText.ts` (A234, A237) both have that check.

The trial fix was one early return in `prepObjectText`. When the phrase has a possessive and its own
determiner is `all` or in `KEPT_BESIDE_POSSESSIVE`, it returns `` `${prep} ${npText(np)}` ``. That is
what `possessorText` already does for *de*. None of those determiners fuses with *a*, and `npText`
already writes the detached (or *todos*) phrase. With it, every row rendered its Want and the rest
of the engine suite stayed green. `prepObjectText` has other callers: a verb's own object preposition
(`predicateText`, *clica en*), a fronted prepositional object (`renderClause`), a relative's
preposition-led head (`withRelative`) and a domain standard (`esStandard`). They probably share the
defect, but they were not probed. The fixer should check that the return is right for each of
them. The complements have their own builder and did not change in
the trial.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: the Spanish personal a drops the determiner beside a possessive (A325)* (8 `test.fails`, one per row, plus a regression test for a thing, the definite, the plain indefinite, the comitative and the terminus) |

Found on 2026-09-24 by the P11-E4 / A277 coverage audit (lane P1).

## Resolved

Fixed on 2026-09-24 with the trial's early return, in
[es/prepObjectText.ts](../../../packages/engine/src/languages/es/prepObjectText.ts). When the phrase
has a possessive and its own determiner is `all` or kept beside it (`keptBesidePossessive`, which
since A329 also takes a head whose indefinite gave way to a numeral), the function returns
`` `${prep} ${npText(np)}` ``. None of those determiners fuses with the preposition.

The other callers were checked. A verb's own object preposition takes the same return (*depende de
una condición mía*, *de esta condición mía*, *de todas mis condiciones*; the definite is still *de mi
condición*). A relative's preposition-led head and a domain standard hand it a relativizer or a
standard, not a possessed phrase. The fronted prepositional object goes through the same function.

The 8 `test.fails` in `known bugs: the Spanish personal a drops the determiner beside a possessive
(A325)` in [possession.test.ts](../../../packages/engine/test/possession.test.ts) are plain tests now.
The same block gained the verb's own preposition, a relative clause (*a un amigo mío que corre*) and
an adjective (*a una mujer vieja mía*). The colocated `prepObjectText.test.ts` gained a case for the
kept determiners and *todos*.

This also answers A330's unsettled Spanish plural object: *los perros ven a unos amigos míos*.
