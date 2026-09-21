# A196. A French bare plural loses its article after a preposition

**Language:** French

French has no zero article on a plural noun phrase. Where English writes a bare plural after a
preposition ("the cat is in brackets"), French writes *des*: *dans **des** parenthèses*. The engine
writes nothing, so a `bare` plural in a spatial or comitative complement comes out as
*dans parenthèses*, *à parenthèses*, *avec parenthèses*.

This is the complement half of [A149](../fixed/A149-french-object-zero-article.md), which made a
direct object, a prepositional object and the *instrumental* take the article French cannot leave
out (*mange des souris*, *clique sur des boutons*, *avec des mots*) and listed what it did not
cover: "a bare object after *à*. `aDet` still gives a lone *à*." The other adposition-bearing
complements were never brought along.

[`complementsPhrase`](../../../packages/engine/src/languages/fr/complementsPhrase.ts) builds each
complement's head with [`prepDet`](../../../packages/engine/src/languages/fr/prepDet.ts),
[`aDet`](../../../packages/engine/src/languages/fr/aDet.ts) and
[`spatialHead`](../../../packages/engine/src/languages/fr/spatialHead.ts), all of which read
[`artFor`](../../../packages/engine/src/languages/fr/artFor.ts) — and `artFor` answers `bare` with
the empty string, which is right for a subject complement (*il est médecin*) and wrong here. Only
the instrumental branch goes through
[`partitiveArtFor`](../../../packages/engine/src/languages/fr/partitiveArtFor.ts), the helper A149
added for exactly this.

| Complement | Now | Want |
|---|---|---|
| locative, *in* | `le chat est dans parenthèses.` | `le chat est dans des parenthèses.` |
| locative, *under* | `le chat est sous parenthèses.` | `le chat est sous des parenthèses.` |
| locative, *behind* | `le chat est derrière parenthèses.` | `le chat est derrière des parenthèses.` |
| locative, *in front of* | `le chat est devant parenthèses.` | `le chat est devant des parenthèses.` |
| locative, *through* | `le chat est à travers parenthèses.` | `le chat est à travers des parenthèses.` |
| route, *over* | `le chat est par-dessus parenthèses.` | `le chat est par-dessus des parenthèses.` |
| terminus | `le chat est à parenthèses.` | `le chat est à des parenthèses.` |
| direction | `le chat est à parenthèses.` | `le chat est à des parenthèses.` |
| comitative | `le chat est avec parenthèses.` | `le chat est avec des parenthèses.` |
| manner, similative | `le chat est comme parenthèses.` | `le chat est comme des parenthèses.` |
| a masculine noun | `le chat est dans mots.` | `le chat est dans des mots.` |
| … with a prenominal adjective | `le chat est dans grands mots.` | `le chat est dans de grands mots.` |
| with a verb, not the copula | `le chat court dans parenthèses.` | `le chat court dans des parenthèses.` |
| … a direction | `le chat va à parenthèses.` | `le chat va à des parenthèses.` |

Every **Want** was rendered by a trial fix applied to HEAD, not written by hand, and reverted after.
The prenominal-adjective row falls out of `artFor` on its own: written French writes *de* for *des*
before a preposed adjective, as it already does for the indefinite (*de grandes souris*).

**Already right.** The instrumental, which A149 covered (`le chat est avec des parenthèses.`, and
the singular `avec de la parenthèse`). Every relation that governs *de* — the source, *au-dessus
de*, *autour de* — because French drops *des* after *de* and
[`deDet`](../../../packages/engine/src/languages/fr/deDet.ts) already does (`le chat est de
parenthèses.`, `au-dessus de parenthèses.`, `autour de parenthèses.`). Every other determiner on the
same complement (`dans les parenthèses`, `dans des parenthèses`, `dans quelques parenthèses`,
`n'est dans aucune parenthèse`, `dans beaucoup de parenthèses`, `dans peu de parenthèses`, `dans
toutes les parenthèses`, `dans ces parenthèses`). A pronominal possessor, whose `bare` is the
possessive taking the article's place and no zero article at all (`le chat mange dans nos
maisons.`). A proper name (`le chat est en Europe.`). The manner of means, bare by idiom (`le chat
est avec soin.`). The direct object and the prepositional object, which A149 fixed (`le chat mange
des souris.`, `le chat clique sur des boutons.`).

**The other six are right and stay untouched.** English has a bare plural (`the cat is in
brackets.`); Italian, Spanish and Portuguese allow one after a preposition (`in parentesi`, `en
paréntesis`, `em parênteses`); German has no article to write (`in Klammern`); Japanese marks the
place with a particle (`猫は括弧にいます。`).

**Nothing shipped shows it.** The 5,180 strings the app ships — every concept `definition` and every
UI string, in all seven languages — render byte-identically at HEAD and under the trial fix. No
gloss puts a bare plural in a spatial complement: the place glosses
([B32](../../localization/done/B32-place-glosses.md)) gap the locative rather than filling it.

Found while probing the localization catalogue.

## Shape of the fix

Verified by applying it to HEAD. It renders every **Want** above, leaves `npm run typecheck` and the
whole unit suite green (8,808 passing, 23 expected failures), and moves no passing test.

In [`complementsPhrase`](../../../packages/engine/src/languages/fr/complementsPhrase.ts), the
`headFor` builder that every complement shares rewrites a plural `bare` to `indefinite` before it
reaches `prepDet` / `aDet` / `spatialHead` / `deDet`:

```ts
const nf = !possessive && plural && (nf0['definiteness'] ?? 'definite') === 'bare'
  && nf0['uncountable'] !== '1' && nf0['proper'] !== '1'
  ? { ...nf0, definiteness: 'indefinite' } : nf0;
```

One rewrite covers every branch, and it is why the *de*-governed relations need no special case:
`deDet` already drops an indefinite plural's article, so *de* + *des* stays *de*.

The two guards matter. `possessive` is the flag `headFor` already takes for a pronominal possessor —
`possessedHeadForms` sets that head's determiner to `bare` so the possessive can take the article's
place, and `partitiveArtFor` says in as many words that such a caller must not come to it. Without
the guard the suite fails on `possessivePronoun.test.ts` with *dans **de** nos maisons*. `proper`
keeps the bare continent prepositions (*en Europe*).

**Decisions for the fixer:**

- **The bare singular.** Left as it is: `dans parenthèse`, `dans eau`. Making it partitive would give
  *dans de la parenthèse* — which is what the instrumental already says (*avec de la parenthèse*), so
  it would at least be consistent. But the same rewrite would reach the manner of means, whose bare
  singular is an idiom French wants (*avec soin*, never *avec du soin*), so it needs a guard of its
  own. A149 took the same view of the singular in a subject complement. Not pinned.
- **Where to put the rewrite.** The trial puts it in the French `complementsPhrase` because that is
  where `possessive` is known. Pushing it into `prepDet` alone is not enough — `aDet`, `deDet` and
  `spatialHead` all reach `artFor` by other routes, and none of them knows about the possessor.
- **Whether `bare` should mean this at all.** The plan's `bare` is "the language spells neither"
  (see `Definiteness`). French spells one here whatever the plan says, exactly as it does for an
  object. If the product would rather let the user say "in brackets" and get nothing, this is a B,
  not an A — but A149 already ruled the other way for the object.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: a French bare plural after a preposition* (2 `test.fails` — the locative across its spatial relations and with a real verb, and the sister complements: route, terminus, direction, comitative, manner — plus a regression test for the instrumental, the *de*-governed relations, the other determiners, the possessor, the proper name and the other six languages) |
