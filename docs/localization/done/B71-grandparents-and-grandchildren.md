# B71. Grandparents and grandchildren — six words, six glosses, all on a genitive

_(from the P11 family-and-relationships sweep of 2026-09-22. The generation above the parents and
the one below the children, [P11](../../features/Z-Done/P11-family-and-relationships/README.md)
§4. All six gloss, four on a kin genitive ("a parent's parent") and two on the sex adjective, which
works here where [B69](B69-brothers-and-sisters.md) had to go around it: *nipote*, *petit-enfant*,
*Enkelkind* and 孫 are neutral.)_

**Shipped on 2026-09-22** — see [Done](#done-2026-09-22). The one thing this file did not foresee is
that its glosses *are* genitives, so they did read P11's honorific column until the engine learned
that an indefinite possessor names nobody in particular.

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. **(k)** is the Italian
`kinship: '1'` flag (P11 D9); "other's" is the ja `honorific` column of D2, which no definition reads.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| GRANDPARENT | noun, isA RELATIVE | grandparent | nonno, fem nonna (k) | grand-parent, pl. grands-parents | Großelternteil, pl. **Großeltern** | abuelo, fem abuela | 祖父母 (そふぼ) | avô, pl. **avós**; fem avó |
| GRANDFATHER | noun, isA GRANDPARENT | grandfather | nonno (k) | grand-père, pl. grands-pères | Großvater, pl. Großväter | abuelo | 祖父 (そふ) · other's おじいさん | avô, pl. avôs |
| GRANDMOTHER | noun, isA GRANDPARENT | grandmother | nonna *f* (k) | grand-mère *f*, pl. grands-mères | Großmutter *f* | abuela *f* | 祖母 (そぼ) · other's おばあさん | avó *f*, pl. avós |
| GRANDCHILD | noun, isA RELATIVE | grandchild, pl. grandchildren | nipote *m*, fem nipote (k) | petit-enfant, pl. petits-enfants | Enkelkind *n* | nieto, fem nieta | 孫 (まご) · other's お孫さん | neto, fem neta |
| GRANDSON | noun, isA GRANDCHILD | grandson | nipote *m* (k) | petit-fils, pl. petits-fils | Enkel | nieto | 孫息子 (まごむすこ) | neto |
| GRANDDAUGHTER | noun, isA GRANDCHILD | granddaughter | nipote *f* (k) | petite-fille *f*, pl. petites-filles | Enkelin *f* | nieta *f* | 孫娘 (まごむすめ) | neta *f* |

Three things for the seed author:

- **Three plurals are another word** (P11 D7): de *Großeltern*, fr *grands-parents*, pt *avós*,
  which is also the plural of *avó*. They are stored surfaces and no gloss below reads them — every
  one of these six is singular.
- **Italian *nipote* is four relatives at once** — grandson, granddaughter, nephew and niece — so
  four concepts share one Italian surface and the picker tells them apart by their tooltips. The
  glosses here and in [B72](B72-the-extended-family.md) are what does it: *un nipote maschile*
  against *un figlio di un fratello*.
- **GRANDCHILD's gloss stands on CHILD_OFFSPRING**, which [B68](B68-the-family.md) seeds. Author B68
  first.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| GRANDPARENT | `{ subject: { concept: 'PARENT', definiteness: 'indefinite', possessor: { concept: 'PARENT', definiteness: 'indefinite' } } }` | a parent's parent |
| GRANDFATHER | the same, head FATHER and `definiteness: 'definite'` | a parent's father |
| GRANDMOTHER | the same, head MOTHER | a parent's mother |
| GRANDCHILD | head CHILD_OFFSPRING, possessor CHILD_OFFSPRING | a child's child |
| GRANDSON | `glossOf('GRANDCHILD', 'MALE')` | a male grandchild |
| GRANDDAUGHTER | `{ subject: { concept: 'GRANDCHILD', definiteness: 'indefinite', gender: 'fem', adjectives: ['FEMALE'] } }` | a female grandchild |

All six.

## Renders (shipped 2026-09-22, from the seeded corpus; pinned in `packages/engine/test/kinship.test.ts`)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GRANDPARENT | a parent's parent | un genitore di un genitore | un parent d'un parent | ein Elternteil eines Elternteils | un progenitor de un progenitor | 親の親 | um progenitor de um progenitor |
| GRANDFATHER | a parent's father | il padre di un genitore | le père d'un parent | der Vater eines Elternteils | el padre de un progenitor | 親の父親 | o pai de um progenitor |
| GRANDMOTHER | a parent's mother | la madre di un genitore | la mère d'un parent | die Mutter eines Elternteils | la madre de un progenitor | 親の母親 | a mãe de um progenitor |
| GRANDCHILD | a child's child | un figlio di un figlio | un enfant d'un enfant | ein Kind eines Kindes | un hijo de un hijo | 子供の子供 | um filho de um filho |
| GRANDSON | a male grandchild | un nipote maschile | un petit-enfant masculin | ein männliches Enkelkind | un nieto masculino | 男性の孫 | um neto masculino |
| GRANDDAUGHTER | a female grandchild | una nipote femminile | un petit-enfant féminin | ein weibliches Enkelkind | una nieta femenina | 女性の孫 | uma neta feminina |

No proposed render collides with a shipped gloss or with another in the P11 batch, in any language.
Four readings to judge on authoring:

1. **English says the genitive where the other six say *of*.** "A parent's father" is the Saxon
   genitive the plain `possessor` gives, and it is what an English speaker says; the six others
   render the genitive they already had (*il padre di un genitore*, 親の父). One consequence: English
   loses the head's own determiner, so the definite heads here read "a parent's father", not "the
   father of a parent", while Italian keeps *il*. [C26](C26-root-nouns-on-the-literal.md)'s
   `possessorRole: 'whole'` would force the of-phrase in English too ("a parent of a parent" —
   probed), but a father is not a *part* of a parent, and the flag is the part-whole relation by
   definition. The default `owner` role is the right one, and the English surface is idiomatic either
   way.
2. **The definite heads are the unique relations.** One has one father and one mother per parent, so
   GRANDFATHER and GRANDMOTHER take `definite`; a parent can have several parents' worth of kin only
   in the plural, so GRANDPARENT and GRANDCHILD stay indefinite.
3. **GRANDSON cannot use the genitive route, because Italian would repeat itself.** "A child's son"
   renders *un figlio di un figlio* in Italian, Spanish and Portuguese — the same string as
   GRANDCHILD's, which
   [`sweep-definitions.test.ts`](../../../packages/engine/test/sweep-definitions.test.ts) refuses.
   The sex adjective on GRANDCHILD avoids it and reads well in all seven, because the word for a
   grandchild is neutral everywhere (it *nipote*, fr *petit-enfant*, de *Enkelkind*, ja 孫). Spanish
   and Portuguese are the exception in kind — *nieto* and *neto* are the masculine — so their
   GRANDSON reads "a male grandson"; *una nieta femenina* for GRANDDAUGHTER is the gender control
   doing its work.
4. **Japanese 祖父母 is a compound of the two words below it** (祖父 + 祖母) and takes no honorific,
   which is why P11's table gives one to GRANDFATHER and GRANDMOTHER but not to GRANDPARENT.

## Not solved by this seed

1. **The coordination route for GRANDPARENT and GRANDCHILD** renders — "a grandfather or a
   grandmother" (it *un nonno o una nonna*), "a grandson or a granddaughter" (ja 孫息子か孫娘) — and
   is refused for the reason [B68](B68-the-family.md) gives: a genus glossed by its two species,
   which are glossed by the genus, is a circle. B68 spends the corpus's one coordinated gloss on
   CHILD_OFFSPRING, where the Italian word is genuinely ambiguous.
2. **Great-grandparents, and the Japanese counters** (曽祖父, 三代) are out of P11's scope; the
   genitive shape above would chain for them ("a grandparent's parent") without a new construct.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
GRANDSON in Italian (*un nipote maschile*), which pins reading 3 — the one route that does not
collide with GRANDCHILD — and GRANDPARENT in English (*a parent's parent*), which pins the genitive.

## Done (2026-09-22)

All six shipped, on the plans the ticket proposed. Four are the kin genitive, which is now the
`kinGloss` helper in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) and carries eleven of
this batch's glosses; two are the sex adjective. Pinned in
[kinship.test.ts](../../../packages/engine/test/kinship.test.ts), with GRANDPARENT (English) and
GRANDSON (Italian) in [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).

What landed differently from the plan:

1. **GRANDFATHER's Japanese is 親の父親, where the table said 親の父.** FATHER's lexeme was re-seeded
   with P11 D2's three columns ([B68](B68-the-family.md)), so its citation form is now the
   nobody's-in-particular 父親 and 父 is what a possessor selects. GRANDMOTHER reads 親の母親 for the
   same reason, which is what the table already said.
2. **The honorific had to be kept out of the glosses.** With D2's columns seeded, "a parent's
   father" first rendered 親の**お父さん** — the engine took an indefinite PARENT for a person outside
   the speaker's family. The rule now is that the own and honorific words presuppose somebody in
   particular, so an indefinite or bare possessor leaves the citation form (B68's report; the pins are
   in [applyPossessorForm.test.ts](../../../packages/engine/src/translator/functions/applyPossessorForm.test.ts)).
3. **Reading 2's definite heads are what shipped**, and English shows none of it: "a parent's father"
   either way, because the Saxon genitive takes the possessor's determiner. Italian, French, German,
   Spanish and Portuguese all write *il padre di…*, *der Vater eines…*.
4. **Reading 3 held.** GRANDSON on the genitive would have been *un figlio di un figlio* — GRANDCHILD's
   own Italian gloss, which [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts)
   refuses. The sex adjective on the neutral word for a grandchild ships instead, in all seven.
5. **The three plurals that are another word are seeded and no gloss reads one** (de *Großeltern*, fr
   *grands-parents*, pt *avós*); "meine Großeltern" and "os meus avós" are pinned in the kinship test
   instead.
