# A340. The Spanish personal *a* drops, or loses the numeral of, a counted human object

**Languages:** Spanish

A Spanish human direct object takes the personal *a*: *ve a un amigo*, *ve a unos amigos*, *ve al
amigo*. A numeral breaks it two ways. With no article of its own (the indefinite, the bare head, an
approximator), the head reaches `takesPersonalA` as a bare noun, and a bare noun takes no *a*: *ve dos
amigos*. With a definite or demonstrative, the *a* is written but the phrase is built by
`prepObjectText`, which drops the numeral: *ve a los amigos* for "sees the two friends".

| Case | Now | Want |
|---|---|---|
| the CAT SEEs two FRIENDs (indefinite, or bare) | `el gato ve dos amigos.` | `el gato ve a dos amigos.` |
| … three WOMEN | `el gato ve tres mujeres.` | `el gato ve a tres mujeres.` |
| … one FRIEND (indefinite) | `el gato ve un amigo.` | `el gato ve a un amigo.` |
| … negated | `el gato no ve dos amigos.` | `el gato no ve a dos amigos.` |
| … about two FRIENDs | `el gato ve unos dos amigos.` | `el gato ve a unos dos amigos.` |
| … the two FRIENDs | `el gato ve a los amigos.` | `el gato ve a los dos amigos.` |
| … these two FRIENDs | `el gato ve a estos amigos.` | `el gato ve a estos dos amigos.` |

**Already right.** A counted animal takes no *a* (`ve dos perros`). An uncounted human object (`ve a
unos amigos`, `ve al amigo`). The other six (`the cat sees the two friends`, `vede i due amici`, `vê
os dois amigos`).

## Shape of the fix

Two sites, one construct:

- [es/takesPersonalA.ts](../../../packages/engine/src/languages/es/takesPersonalA.ts) should read a
  head made bare by its numeral (or approximator) as the counted phrase it is, not as a bare
  generic noun.
- [es/prepObjectText.ts](../../../packages/engine/src/languages/es/prepObjectText.ts) should join the
  numeral through `numeralText`, as `nounPhrase.ts` does (A291 did the same for the complements).

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: the Spanish personal a drops or loses the numeral of a counted human object (A340)* (3 `test.fails`: no article, negated and approximated, definite and demonstrative; plus a regression test for an animal, an uncounted human object and the other languages) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.
