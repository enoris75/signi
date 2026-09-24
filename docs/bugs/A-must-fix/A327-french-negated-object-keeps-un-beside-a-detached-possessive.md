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
