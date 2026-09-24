# A292. French writes *de* before a bare numeral in a complement

**Languages:** French

A numeral takes the place of the indefinite article (C31): "avec trois chiens", "dans deux maisons",
with nothing in front of it. French does keep the numeral inside a complement, unlike A291's three
languages. But A196's rewrite, which turns a bare plural complement into the indefinite so French does
not leave it without an article ("dans des parenthèses"), also reaches a counted phrase. `artFor` then
applies the rule that the plural *des* becomes *de* before a prenominal adjective ("de grands
chiens"). It finds the numeral leading where the noun should, so it writes *de*. The result is `avec
de trois chiens`, which is not French.

| Case | Now | Want |
|---|---|---|
| the CAT PLAYs with three DOGs (comitative, bare) | `le chat joue avec de trois chiens.` | `le chat joue avec trois chiens.` |
| … picked as `indefinite` | `le chat joue avec de trois chiens.` | `le chat joue avec trois chiens.` |
| … with BIG | `le chat joue avec de trois grands chiens.` | `le chat joue avec trois grands chiens.` |
| the CAT RUNs in three HOUSEs (locative, bare) | `le chat court dans de trois maisons.` | `le chat court dans trois maisons.` |
| the CAT RUNs under two HOUSEs (locative, `under`) | `le chat court sous de deux maisons.` | `le chat court sous deux maisons.` |
| the CAT RUNs to two HOUSEs (direction) | `le chat court à de deux maisons.` | `le chat court à deux maisons.` |
| the CAT PLAYs against three DOGs (opponent) | `le chat joue contre de trois chiens.` | `le chat joue contre trois chiens.` |
| the CAT CUTs with two STICKs (instrumental) | `le chat coupe avec de deux bâtons.` | `le chat coupe avec deux bâtons.` |

Every Want string was rendered by the engine with the fix sketched below applied to a throwaway copy
of the tree.

**Already right.** A bare plural with no numeral keeps its *des* (`avec des chiens`, `dans des
maisons`), and its *de* before an adjective (`avec de grands chiens`). A counted complement with a
determiner is right: `avec les trois chiens`, `avec ces trois chiens`, `avec mes trois chiens`, `avec
les deux bâtons`. So is a relation that governs *de* itself (`vient de deux maisons`, `à cause de deux
chiens`). The other six languages write no article before a bare counted companion (`with three
dogs`, `con tre cani`, 三匹の犬と; for de/es/pt see A291).

**Related:** [A289](A289-french-definite-object-with-a-numeral-drops-its-article.md) is the
opposite problem on the direct object. There `objectArtFor` drops the definite article of a counted
object (`lit deux livres` for *the two books*). The two bugs share C31's rule, that a numeral replaces
only the indefinite, but they are in different code and neither fix touches the other's rows.

**Found by** probing complements with a numeral at 1229928, next to A289.

## Shape of the fix

Two places in French:

- [fr/artFor.ts](../../../packages/engine/src/languages/fr/artFor.ts), `case 'indefinite'`: a counted
  phrase (`forms['numeral'] !== undefined`) returns `''`, because the numeral is its article. Both
  A196's `headFor` rewrite in
  [fr/complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts) and
  `partitiveArtFor` (the instrument's *avec* + partitive) reach it through this case, so this one guard
  covers every branch in the table.
- The instrumental branch in `complementsPhrase.ts` writes `` `avec ${partitiveArtFor(…)}` ``, which
  leaves a double space once the article is empty (`avec  deux bâtons`). It should join the non-empty
  parts, as `prepDet` does.

In the trial, every row rendered its Want and the engine suite stayed green. Narrowing the `headFor`
rewrite itself (skipping it for a counted head) was tried first. It fixes the prepositions that go
through `prepDet`, but not the instrument, which gets its partitive from `partitiveArtFor`. It also
turns the temporal case below into `en deux jours`.

**Not settled here:** a bare counted time, *the cat runs on two days*, says `le chat court de deux
jours.` (from `aDet` over the rewritten indefinite). It is wrong, but the right reading of the bare
`at` relation over a count is not clear. The `artFor` guard gives `le chat court deux jours.`
(*for two days*), and `en deux jours` means *within two days*. It has no row here. A bare singular
`one` in the plain locative gives `court en une maison`, from A219's bare-singular *en*. That is also
separate.

| | |
|---|---|
| **Test** | `complements/numerals-in-complements.test.ts` → *known bugs: french writes de before a bare numeral in a complement (A292)* (8 `test.fails`, one per row, plus a regression test for the bare plural's *des*/*de*, the counted phrase with a determiner, the *de*-governing relations and the other six languages) |
