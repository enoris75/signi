# A327. A French negated object keeps *un* beside a detached possessive

**Languages:** French

Under a negation, a French direct object's indefinite or partitive article becomes *de*: *le chat
ne voit pas d'ami*, *ne boit pas d'eau* (`objectArtFor`). A possessed object skips that step, which
was harmless while the possessive replaced the article (*ne voit pas mon ami*). A277 now keeps the
indefinite beside a detached possessive, and that kept article escapes the negative *de*.

| Case | Now | Want |
|---|---|---|
| the CAT does not SEE FRIEND {indefinite, possessor: 1sg} | `le chat ne voit pas un ami à moi.` | `le chat ne voit pas d'ami à moi.` |
| … HOUSE {indefinite} | `le chat ne voit pas une maison à moi.` | `le chat ne voit pas de maison à moi.` |
| … FRIEND {indefinite, plural} | `le chat ne voit pas des amis à moi.` | `le chat ne voit pas d'amis à moi.` |
| the CAT does not DRINK WATER {indefinite, possessor: 1sg} | `le chat ne boit pas de l'eau à moi.` | `le chat ne boit pas d'eau à moi.` |

Every Want string was rendered by the engine with the fix below applied to a throwaway copy of the
packages. Each is the negated plan without the possessive (`pas d'ami`, `pas de maison`, `pas
d'amis`, `pas d'eau`) with *à moi* added.

**Reached only since A277.**

**Already right.**

- The positive is right: `le chat voit un ami à moi.`
- So is every other determiner under a negation: `ne voit pas mon ami`, `ne voit pas cet ami à moi`.
- So is Italian: `il gatto non vede un mio amico.` German writes *keinen Freund von mir*. English
  and Portuguese keep the article, as they should.
- Spanish `no ve a mi amigo` is wrong, but that is A325.

## Shape of the fix

[`fr/objectNpText.ts`](../../../packages/engine/src/languages/fr/objectNpText.ts) returns
`npText(np)` for every pronominal possessor, so `objectArtFor`'s negated *de* is never asked. The
trial did two things:

- It sent a negated object whose own determiner is in `KEPT_BESIDE_POSSESSIVE` through `renderNP`,
  with `objectArtFor` over the head's own forms (without `proper`).
- It gave [`fr/renderNP.ts`](../../../packages/engine/src/languages/fr/renderNP.ts) an optional
  own-determiner head. When a detached phrase has one, `renderNP` uses it and leaves out its own
  `detWord`.

`objectArtFor` returns the ordinary article for *this*, *no* and *some*, so they did not change. With
that, every row rendered its Want and the rest of the engine suite stayed green. The same hook would
serve A326. Fixing both together, with one way for a detached head to hand its determiner to the
caller, is the natural shape.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: a French negated object keeps un beside a detached possessive (A327)* (2 `test.fails`: the indefinite across six languages, Spanish left to A325; the thing, the plural and the mass noun. Plus a regression test for the unpossessed negation, the definite, *this*, the positive and Italian) |

Found on 2026-09-24 by the P11-E4 / A277 coverage audit (lane P1).

## Resolved

Fixed on 2026-09-24 as the trial did, with one hook that A326 shares.

- [fr/renderNP.ts](../../../packages/engine/src/languages/fr/renderNP.ts) takes an optional
  `ownHeadFor`, the caller's determiner builder over the head's own forms. A detached head that is
  given one takes its whole determiner from it, and `renderNP` writes no article of its own.
- [fr/objectNpText.ts](../../../packages/engine/src/languages/fr/objectNpText.ts): a negated object
  whose determiner is kept beside the possessive (`keptBesidePossessive`) goes through `renderNP` with
  `objectArtFor` over `ownHeadForms(np)`. Every other possessed object still goes through `npText`.

Both `test.fails` in `known bugs: a French negated object keeps un beside a detached possessive
(A327)` in [possession.test.ts](../../../packages/engine/test/possession.test.ts) are plain tests now.
The same block gained *no* (*ne voit aucun ami à moi*), *some* (*ne voit pas quelques amis à moi*), a
prenominal adjective (*ne voit pas de vieil ami à moi*), a counted object (*ne voit pas deux amis à
moi*) and another person (*ne voit pas de maison à elle*). The colocated `objectNpText.test.ts`
gained the negated and positive kept indefinite.
