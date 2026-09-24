# A328. OWN beside a kept determiner stays on the head: *an own friend of mine*

**Languages:** English (pinned); French, Spanish, Portuguese (target undecided)

OWN (`possessorOwn`, C37) is bound to the possessor. It is not one of the head's adjectives, and
English writes it after the possessive: *my own friend*. C37 did not seed it as an ordinary
adjective, to avoid *an own cat*. The possessor detaches when the head keeps a determiner: *this
friend of mine* (A187), and since A277 *a friend of mine*. But OWN stays with the head's prenominal
adjectives, so it lands behind the article, and the engine writes exactly the *an own* phrase C37
ruled out. English puts OWN on the detached possessive: *a friend of my own*.

| Case | Now | Want |
|---|---|---|
| FRIEND {indefinite, possessor: 1sg, possessorOwn} RUNs | `an own friend of mine runs.` | `a friend of my own runs.` |
| FRIEND {this, …} | `this own friend of mine runs.` | `this friend of my own runs.` |
| FRIEND {no, …} | `no own friend of mine runs.` | `no friend of my own runs.` |
| FRIEND {indefinite, OLD, …} | `an own old friend of mine runs.` | `an old friend of my own runs.` |
| FRIEND {indefinite, plural, possessor: 3sg fem, possessorOwn} | `own friends of hers run.` | `friends of her own run.` |

The English Want strings were rendered by the engine with a trial fix applied to a throwaway copy
of the packages: in `en/nounPhrase.ts`'s detached branch, OWN comes off the adjectives and the
possessor is written `of ${possessiveEn(…)} own`. The rest of the engine suite stayed green.

**Since when.** *this* and *no* go back to A187. The indefinite rows are new with A277.

**The same shape elsewhere, target undecided.**

| lang | now (indefinite) | now (*this*) |
|---|---|---|
| fr | `un propre ami à moi court.` | `ce propre ami à moi court.` |
| es | `un propio amigo mío corre.` | `este propio amigo mío corre.` |
| pt | `um próprio amigo meu corre.` | `este próprio amigo meu corre.` |

Prenominal *propre* / *propio* / *próprio* works right after a possessive (*mon propre ami*, *mi
propio amigo*). Separated from it by an article, it reads as *a proper friend* or *the very friend*,
not as ownership.

**Already right.** The definite, in all seven: `my own friend runs.`, `il mio proprio amico corre.`,
`mon propre ami court.`, `mein eigener Freund läuft.`, `mi propio amigo corre.`, `o meu próprio amigo
corre.`, `自分の友達は走ります。`. Italian stacks OWN after the possessive: `un mio proprio amico`,
`questo mio proprio amico`. German `ein eigener Freund von mir` is grammatical, if redundant. It is
not filed.

## Shape of the fix

OWN is resolved with `possessor_bound: '1'` and put at the head of the adjectives
(`resolveNounPhrase.ts`, `functions/possessorBound.ts`). Each detached branch should pull it out with
`possessorBound(np)` and write it with the possessor:

- **English**: [`en/nounPhrase.ts`](../../../packages/engine/src/languages/en/nounPhrase.ts), the
  `keepsDeterminerBesidePossessive` branch. This writes `of my own` instead of `of mine` (the
  dependent possessive with *own*, not the independent one). The article is then chosen against the
  new first word (*an old friend of my own*). The trial matched OWN in the adjective string. The real
  fix should use `possessorBound`, since `nounPhrase` takes the adjectives as one string.
- **French / Spanish / Portuguese**: the detached branches in `fr/renderNP.ts`, `es/nounPhrase.ts`
  and `pt/nounPhrase.ts`, once the targets below are chosen.

## DECISION FOR THE FIXER

1. **French.** Options:
   - `un ami à moi`: drop OWN. It loses the emphasis, but it is what the phrase means.
   - `un ami bien à moi`: *bien à moi* is the idiomatic emphatic ownership (*une maison bien à moi*).
     Not verified: the engine cannot render *bien* inside the possessor, and no trial was made.
   - `un ami à moi-même`: possible, but marked.

   Recommendation: *bien à moi* (`ce livre bien à elle`), falling back to dropping OWN.
2. **Spanish / Portuguese.** Options:
   - `un amigo mío propio`: rendered in the trial, by moving *propio* behind the stressed possessive
     in `es/nounPhrase.ts`, giving `un amigo mío propio`, `este amigo mío propio`, `ningún amigo mío
     propio` and `unos amigos suyos propios`. With an adjective it is clumsy: `un amigo viejo mío
     propio`.
   - `un amigo propio`: idiomatic for *one of one's own* (*una casa propia*), but it drops the person
     of the possessor.
   - Drop OWN: `un amigo mío`.

   Portuguese has the same options (*um amigo meu próprio*, *uma casa própria*).
3. **Whether English *no* should read *none of my own friends*.** Not proposed: `no friend of my own`
   is fine.

Until these are settled, only English is pinned.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: OWN beside a kept determiner stays on the head (A328)* (5 `test.fails`, English only, one per row; plus a regression test for the definite in all seven and Italian's indefinite and *this*) |

Found on 2026-09-24 by the P11-E4 / A277 coverage audit (lane P1).
