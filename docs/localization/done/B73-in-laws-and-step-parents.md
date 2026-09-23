# B73. In-laws and step-parents — eight words, eight glosses, two of which have to deny an identity

_(from the P11 family-and-relationships sweep of 2026-09-22. The relatives by marriage of
[P11](../../features/P-planning/P11-family-and-relationships/README.md) §4, and the two
step-parents. All eight gloss: six are one genitive ("a spouse's mother"), and STEPFATHER and
STEPMOTHER need a negated relative beside the genitive, because a mother's husband is otherwise just
a father.)_

**Shipped on 2026-09-22** — see [Done](#done-2026-09-22). The one thing this file did not foresee is
that its glosses *are* genitives, so they did read P11's honorific column until the engine learned
that an indefinite possessor names nobody in particular.

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. **(k)** is the Italian
`kinship: '1'` flag (P11 D9); "other's" is the ja `honorific` column of D2, which no definition reads.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| MOTHER_IN_LAW | noun, isA RELATIVE | mother-in-law, pl. mothers-in-law | suocera *f* (k) | belle-mère *f*, pl. belles-mères | Schwiegermutter *f* | suegra *f* | 義母 (ぎぼ) · other's お義母さん | sogra *f* |
| FATHER_IN_LAW | noun, isA RELATIVE | father-in-law | suocero (k) | beau-père, pl. beaux-pères | Schwiegervater | suegro | 義父 (ぎふ) · other's お義父さん | sogro |
| SON_IN_LAW | noun, isA RELATIVE | son-in-law | genero (k) | gendre | Schwiegersohn | yerno | 婿 (むこ) · other's お婿さん | genro |
| DAUGHTER_IN_LAW | noun, isA RELATIVE | daughter-in-law, pl. daughters-in-law | nuora *f* (k) | belle-fille *f*, pl. belles-filles | Schwiegertochter *f* | nuera *f* | 嫁 (よめ) · other's お嫁さん | nora *f* |
| BROTHER_IN_LAW | noun, isA RELATIVE | brother-in-law | cognato (k) | beau-frère, pl. beaux-frères | Schwager, pl. Schwäger | cuñado | 義理の兄弟 (ぎりのきょうだい) | cunhado |
| SISTER_IN_LAW | noun, isA RELATIVE | sister-in-law, pl. sisters-in-law | cognata *f* (k) | belle-sœur *f*, pl. belles-sœurs | Schwägerin *f* | cuñada *f* | 義理の姉妹 (ぎりのしまい) | cunhada *f* |
| STEPFATHER | noun, isA RELATIVE | stepfather | patrigno | beau-père | Stiefvater | padrastro | 継父 (けいふ) | padrasto |
| STEPMOTHER | noun, isA RELATIVE | stepmother | matrigna *f* | belle-mère *f* | Stiefmutter *f* | madrastra *f* | 継母 (けいぼ) | madrasta *f* |

Two things for the seed author:

- **French says *beau-père* and *belle-mère* for both the in-law and the step-parent**, and so does
  Japanese 義父 / 義母 in speech, which is why STEPFATHER and STEPMOTHER take the unambiguous 継父 /
  継母 (P11 §4). In French the two concepts share a surface and only the tooltips tell them apart:
  *le père d'un conjoint* against *un mari d'une mère qui n'est pas un père*.
- **The English plurals are irregular** (*mothers-in-law*, *sisters-in-law*), and the French ones
  inflect the first word (*belles-mères*, *beaux-frères*).

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| MOTHER_IN_LAW | `{ subject: { concept: 'MOTHER', definiteness: 'definite', possessor: { concept: 'SPOUSE', definiteness: 'indefinite' } } }` | a spouse's mother |
| FATHER_IN_LAW | the same, head FATHER | a spouse's father |
| SON_IN_LAW | head HUSBAND, possessor CHILD_OFFSPRING | a child's husband |
| DAUGHTER_IN_LAW | head WIFE, possessor CHILD_OFFSPRING | a child's wife |
| BROTHER_IN_LAW | head BROTHER, possessor SPOUSE | a spouse's brother |
| SISTER_IN_LAW | head SISTER, possessor SPOUSE | a spouse's sister |
| STEPFATHER | `{ subject: { concept: 'HUSBAND', definiteness: 'indefinite', possessor: { concept: 'MOTHER', definiteness: 'indefinite' }, relative: { verbPhrase: { verb: 'BE', negative: true }, complements: { predicative: { phrase: { concept: 'FATHER', definiteness: 'indefinite' } } } } } }` | a mother's husband who is not a father |
| STEPMOTHER | the same, head WIFE, possessor FATHER, predicative MOTHER | a father's wife who is not a mother |

All eight. They stand on [B68](B68-the-family.md)'s MOTHER and CHILD_OFFSPRING,
[B69](B69-brothers-and-sisters.md)'s BROTHER and SISTER and [B70](B70-spouses-and-marriage.md)'s
SPOUSE, HUSBAND and WIFE, so those three come first.

## Renders (shipped 2026-09-22, from the seeded corpus; pinned in `packages/engine/test/kinship.test.ts`)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MOTHER_IN_LAW | a spouse's mother | la madre di un coniuge | la mère d'un conjoint | die Mutter eines Ehepartners | la madre de un cónyuge | 配偶者の母親 | a mãe de um cônjuge |
| FATHER_IN_LAW | a spouse's father | il padre di un coniuge | le père d'un conjoint | der Vater eines Ehepartners | el padre de un cónyuge | 配偶者の父親 | o pai de um cônjuge |
| SON_IN_LAW | a child's husband | il marito di un figlio | le mari d'un enfant | der Ehemann eines Kindes | el marido de un hijo | 子供の夫 | o marido de um filho |
| DAUGHTER_IN_LAW | a child's wife | la moglie di un figlio | l'épouse d'un enfant | die Ehefrau eines Kindes | la esposa de un hijo | 子供の妻 | a esposa de um filho |
| BROTHER_IN_LAW | a spouse's brother | il fratello di un coniuge | le frère d'un conjoint | der Bruder eines Ehepartners | el hermano de un cónyuge | 配偶者の兄弟 | o irmão de um cônjuge |
| SISTER_IN_LAW | a spouse's sister | la sorella di un coniuge | la sœur d'un conjoint | die Schwester eines Ehepartners | la hermana de un cónyuge | 配偶者の姉妹 | a irmã de um cônjuge |
| STEPFATHER | a mother's husband who is not a father | un marito di una madre che non è un padre | un mari d'une mère qui n'est pas un père | ein Ehemann einer Mutter, der kein Vater ist | un marido de una madre que no es un padre | 父親ではない母親の夫 | um marido de uma mãe que não é um pai |
| STEPMOTHER | a father's wife who is not a mother | una moglie di un padre che non è una madre | une épouse d'un père qui n'est pas une mère | eine Ehefrau eines Vaters, die keine Mutter ist | una esposa de un padre que no es una madre | 母親ではない父親の妻 | uma esposa de um pai que não é uma mãe |

No proposed render collides with a shipped gloss or with another in the P11 batch, in any language.
Four readings to judge on authoring:

1. **The step-parents are the only two that have to say what they are not.** "A mother's husband" is
   true of every father, so it fails the [C05](C05-non-distinguishing-genera.md) test against
   FATHER; adding the negated copular relative fixes it, and German writes the negation in the
   article (*der **kein** Vater ist*) while Japanese puts the whole clause in front (父ではない母親の
   夫). The shape — a head carrying both a genitive and a relative clause — is
   [BLADE](../../../packages/backend/src/concepts/nouns.ts#L1346)'s, which the corpus already ships
   ("the part of an object that cuts").
2. **Definite heads, because the relation is unique.** One spouse has one mother; one child one
   husband. English shows none of it (the Saxon genitive takes the possessor's determiner, so it
   reads "a spouse's mother" either way — see [B71](B71-grandparents-and-grandchildren.md) reading
   1), and the other six do: *la madre di un coniuge*, *der Vater eines Ehepartners*. The
   step-parents keep the indefinite: a mother may have had more than one husband, which is the
   presupposition of the word.
3. **One route each, where two exist.** A brother-in-law is a spouse's brother *and* a sibling's
   husband; the second renders too (*un marito di un fratello*, 兄弟の夫, in **Not solved**), and one
   gloss says enough. The same holds of SISTER_IN_LAW.
4. **Japanese 義理の兄弟 already says "in-law" in the word**, and the gloss says it again in the other
   direction (配偶者の兄弟). Both are natural; the gloss is what tells 義理の兄弟 from 兄弟 in the
   picker.

## Not solved by this seed

1. **The other route for the two -in-law siblings**, kept for whoever prefers it:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | a HUSBAND of a SIBLING | a sibling's husband | un marito di un fratello | un mari d'un frère | ein Ehemann eines Geschwisters | un marido de un hermano | 兄弟の夫 | um marido de um irmão |
   | a WIFE of a SIBLING | a sibling's wife | una moglie di un fratello | une épouse d'un frère | eine Ehefrau eines Geschwisters | una esposa de un hermano | 兄弟の妻 | uma esposa de um irmão |

2. **Which spouse the in-law belongs to.** Russian and Ukrainian split the words by it (свекровь
   against тёща), and P11's *Later languages* section holds the question until
   [P06](../../features/P-planning/P06-russian/README.md) lands. The gloss above cannot say it
   either, and will not have to: it is the lexeme that would split, not the definition.
3. **Step-children and half-siblings** are out of P11's scope. Italian *fratellastro* is both the
   half- and the step-brother, so whoever seeds them should settle that first.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
STEPFATHER in German and Japanese (*ein Ehemann einer Mutter, der kein Vater ist*, 父ではない母親の
夫), which pins reading 1 — the genitive and the negated relative on one head.

## Done (2026-09-22)

All eight shipped, on the plans the ticket proposed: six on the `kinGloss` genitive and the two
step-parents on [`stepParentGloss`](../../../packages/backend/src/concepts/nouns.ts), which is that
genitive with a negated copular relative beside it. Pinned in
[kinship.test.ts](../../../packages/engine/test/kinship.test.ts), with STEPFATHER in German and
Japanese in [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).

What landed differently from the plan:

1. **Three Japanese cells moved, all for the same reason**: FATHER's citation form is now 父親
   ([B68](B68-the-family.md), P11 D2), so FATHER_IN_LAW reads 配偶者の父親 and the two
   step-parents 父親ではない母親の夫 / 母親ではない父親の妻.
2. **The `possessed` word stayed out of the definite-headed glosses.** SON_IN_LAW and DAUGHTER_IN_LAW
   read *der Ehemann eines Kindes* and *l'épouse d'un enfant*, not *der Mann* / *la femme*: an
   indefinite possessor is nobody in particular, which is the rule B68's report records. Under a real
   possessor the short word is still what comes out ("la femme du garçon"), and both are pinned.
3. **Reading 1 held in every language.** The negated copular relative is what keeps the step-parents
   off FATHER and MOTHER, and German writes the negation in the article (*der **kein** Vater ist*)
   while Japanese fronts the whole clause.
4. **Reading 2's definite heads shipped**, with the step-parents keeping the indefinite, as the ticket
   ruled: a mother may have had more than one husband.
5. **No word was seeded that only an unwritable tooltip would use** — all eight are P11 §4 rows, and
   all eight gloss.
