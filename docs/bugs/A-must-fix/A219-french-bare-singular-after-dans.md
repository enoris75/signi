# A219. A French bare singular follows "dans" with no article

**Language:** French

French "dans" needs a determiner after it: *dans le groupe*, *dans un groupe*, never *dans groupe*.
The preposition French puts before a bare noun is "en": *en groupe*, *en petit groupe*, *en
prison*, *en parenthèse*. It is the same "en" the engine already gives the two other article-less
heads of a plain locative, the bare continent (*en Europe*) and the tonic pronoun (*en lui*, A203).

[`complementsPhrase`](../../../packages/engine/src/languages/fr/complementsPhrase.ts) sends every
other plain locative to [`spatialHead`](../../../packages/engine/src/languages/fr/spatialHead.ts),
whose `in` is "dans", and "dans" takes whatever `artFor` gives a `bare` head, which is nothing.
[A196](../fixed/A196-french-bare-plural-after-a-preposition.md) gave the bare **plural** its *des*
(*dans des parenthèses*) and left the singular as it was, because making it partitive would reach
the manner of means (*avec soin*). "en" reaches nothing else.

A mass noun has no "en" reading of that kind (*en eau* does not say "in water"). It takes the
partitive after "dans" instead, as a bare mass object does (A149): *dans de l'eau*.

| Case | Now | Want |
|---|---|---|
| the CAT EATs in GROUP (bare) | `le chat mange dans groupe.` | `le chat mange en groupe.` |
| … in small GROUP | `le chat mange dans petit groupe.` | `le chat mange en petit groupe.` |
| the CAT IS in PRISON | `le chat est dans prison.` | `le chat est en prison.` |
| the CAT IS in BRACKET | `le chat est dans parenthèse.` | `le chat est en parenthèse.` |
| the CAT IS in WATER (mass) | `le chat est dans eau.` | `le chat est dans de l'eau.` |
| the locative gloss of a bare GROUP (C25) | `dans groupe.` | `en groupe.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** Every other determiner (`dans le groupe`, `dans un groupe`), the possessive,
whose `bare` is the possessive taking the article's place (`dans mon groupe`), A196's bare plural
(`dans des groupes`), the bare continent and land (`en Europe`, `au Japon`), the tonic pronoun (`en
lui`), the hearth idiom (`à la maison`) and the bare manner of means (`avec soin`). Italian, Spanish,
Portuguese and Japanese allow the bare noun (`in gruppo`, `en grupo`, `em grupo`, `グループで`).

**Not filed: English and German.** They render the same plan `in group` and `in Gruppe`. Both
languages take a bare singular after "in" for some nouns (*in prison*, *in water*, *in Wasser*, *in
kleiner Gruppe*) and not for others (*in group*, *in house*). Which noun does is lexical, so no one
**Want** can be written for the rule.

**Nothing shipped shows it.** Every concept definition and UI string renders byte-identically under
the trial fix.

Found authoring the C23–C28 localization sweep.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

In the locative branch of `headFor` in `complementsPhrase`, beside the pronoun's "en", a head that is
bare, singular, not a proper name and not a possessor's (`!possessive`) takes "en" when it is
countable and "dans" + `partitiveArtFor` when it is `uncountable`:

```ts
!possessive && !plural && locSpec === 'in' && (nf['definiteness'] ?? 'definite') === 'bare' && nf['proper'] !== '1'
  ? (nf['uncountable'] === '1' ? `dans ${partitiveArtFor(nf, plural, lead)}` : 'en') :
```

The guards are A196's: the possessor's `bare` is no zero article, and the bare name keeps its own
continent preposition.

**Decisions for the fixer:**

- **A count noun "en" does not suit.** The trial gives `en lieu`, `en maison` and `en marché`, which
  are French but lexically marked. They are better than `dans lieu`, which is not French. Not
  pinned.
- **The other relations.** *sous groupe*, *derrière groupe* are as bare as *dans groupe*, and have no
  "en" of their own. Not pinned.
- **A direction into the relation.** *va dans groupe* (the direction's `in`) is untouched by the
  trial. Not pinned.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: a French bare singular after "dans" (A219)* (1 `test.fails`, plus a regression test for the other determiners, the possessive, the plural, a name, a pronoun, the idiom, the manner and the other six) |
