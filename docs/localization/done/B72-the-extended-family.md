# B72. Uncles, aunts and cousins — five words, five glosses, and the first genitive inside a genitive

_(from the P11 family-and-relationships sweep of 2026-09-22. The extended family of
[P11](../../features/P-planning/P11-family-and-relationships/README.md) §4: UNCLE, AUNT, COUSIN,
NEPHEW and NIECE. All five gloss, each naming the relative it hangs off — a parent's brother, a
sibling's son — and COUSIN chains two genitives, which no shipped definition does yet.)_

**Shipped on 2026-09-22** — see [Done](#done-2026-09-22). The one thing this file did not foresee is
that its glosses *are* genitives, so they did read P11's honorific column until the engine learned
that an indefinite possessor names nobody in particular.

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. **(k)** is the Italian
`kinship: '1'` flag (P11 D9); "other's" is the ja `honorific` column of D2, which no definition reads.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| UNCLE | noun, isA RELATIVE | uncle | zio, pl. zii (k) | oncle | Onkel | tío | おじ · other's おじさん | tio |
| AUNT | noun, isA RELATIVE | aunt | zia *f* (k) | tante *f* | Tante *f* | tía *f* | おば · other's おばさん | tia *f* |
| COUSIN | noun, isA RELATIVE | cousin | cugino, fem cugina (k) | cousin, fem cousine | Cousin, fem Cousine | primo, fem prima | いとこ | primo, fem prima |
| NEPHEW | noun, isA RELATIVE | nephew | nipote *m* (k) | neveu, pl. neveux | Neffe (`weak`) | sobrino | 甥 (おい) · other's 甥御さん | sobrinho |
| NIECE | noun, isA RELATIVE | niece | nipote *f* (k) | nièce *f* | Nichte *f* | sobrina *f* | 姪 (めい) · other's 姪御さん | sobrinha *f* |

Three things for the seed author:

- **おじ, おば and いとこ are kana on purpose** (P11 §4): the kanji encode what the concept does not
  say — 伯父 is older than the parent and 叔父 younger, and 従兄 / 従弟 / 従姉 / 従妹 are the four
  cousins. Writing one would guess, as [C20](C20-pronoun-agreement.md)'s その人 refuses to
  guess a sex.
- **German *Neffe* is a weak noun** (`weak: '1'`, "ich sehe meinen Neffen"), which the engine already
  declines.
- **Italian *nipote* is NEPHEW, NIECE, GRANDSON and GRANDDAUGHTER at once**, so these two and
  [B71](B71-grandparents-and-grandchildren.md)'s two share one Italian surface; the four tooltips are
  what separate them in the picker, and none of them collides (checked across the batch).

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| UNCLE | `{ subject: { concept: 'BROTHER', definiteness: 'indefinite', possessor: { concept: 'PARENT', definiteness: 'indefinite' } } }` | a parent's brother |
| AUNT | the same, head SISTER | a parent's sister |
| COUSIN | `{ subject: { concept: 'CHILD_OFFSPRING', definiteness: 'indefinite', possessor: { concept: 'SIBLING', definiteness: 'indefinite', possessor: { concept: 'PARENT', definiteness: 'indefinite' } } } }` | a parent's sibling's child |
| NEPHEW | head SON, possessor SIBLING | a sibling's son |
| NIECE | head DAUGHTER, possessor SIBLING | a sibling's daughter |

All five. They stand on [B68](B68-the-family.md)'s CHILD_OFFSPRING, SON and DAUGHTER and on
[B69](B69-brothers-and-sisters.md)'s SIBLING, BROTHER and SISTER, so author those two first. SON and
DAUGHTER carry no gloss of their own (B68), which costs these nothing: a gloss may stand on a word
the corpus leaves on the literal, as the root nouns of
[C26](C26-root-nouns-on-the-literal.md) do throughout.

## Renders (shipped 2026-09-22, from the seeded corpus; pinned in `packages/engine/test/kinship.test.ts`)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| UNCLE | a parent's brother | un fratello di un genitore | un frère d'un parent | ein Bruder eines Elternteils | un hermano de un progenitor | 親の兄弟 | um irmão de um progenitor |
| AUNT | a parent's sister | una sorella di un genitore | une sœur d'un parent | eine Schwester eines Elternteils | una hermana de un progenitor | 親の姉妹 | uma irmã de um progenitor |
| COUSIN | a parent's sibling's child | un figlio di un fratello di un genitore | un enfant d'un frère d'un parent | ein Kind eines Geschwisters eines Elternteils | un hijo de un hermano de un progenitor | 親の兄弟の子供 | um filho de um irmão de um progenitor |
| NEPHEW | a sibling's son | un figlio di un fratello | un fils d'un frère | ein Sohn eines Geschwisters | un hijo de un hermano | 兄弟の息子 | um filho de um irmão |
| NIECE | a sibling's daughter | una figlia di un fratello | une fille d'un frère | eine Tochter eines Geschwisters | una hija de un hermano | 兄弟の娘 | uma filha de um irmão |

No proposed render collides with a shipped gloss or with another in the P11 batch, in any language.
Three readings to judge on authoring:

1. **COUSIN chains two genitives, and nothing in the corpus does yet.** No shipped `definition` puts
   a possessor inside a possessor; the plan shape allows it (the shared type's own example is "the
   cat's owner's book") and all seven render — Japanese stacks の twice (親の兄弟の子供) and German
   two genitives (*eines Geschwisters eines Elternteils*), which is heavy but grammatical. The
   shorter lead, "a child of an uncle", is in **Not solved**.
2. **The Romance masculine reads as the male relative, and here that is harmless.** *Un fratello di
   un genitore* is exactly what an uncle is, and *una sorella di un genitore* an aunt: unlike
   [B69](B69-brothers-and-sisters.md)'s BROTHER, these concepts *are* sexed, so the genus word being
   the masculine costs nothing. Only German's *Geschwister* stays neutral, and "ein Bruder eines
   Elternteils" says it anyway.
3. **In Japanese the glosses are longer than the words they gloss** (親の兄弟 for おじ), which is the
   point: おじ alone does not say which side or which generation, and the tooltip does.

## Not solved by this seed

1. **The shorter COUSIN lead**, kept for whoever prefers it:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | a CHILD_OFFSPRING of an UNCLE | an uncle's child | un figlio di uno zio | un enfant d'un oncle | ein Kind eines Onkels | un hijo de un tío | おじの子供 | um filho de um tio |

   It renders in all seven and is half the length, and it is narrower than the word: an aunt's child
   is a cousin too, and no gloss can say "an uncle or an aunt" as a possessor — a coordination is a
   noun element, and a possessor takes a single phrase. The chained gloss says both at once through
   SIBLING.
2. **Which side the relative is on** (mother's brother against father's brother) is what Japanese
   writes in the kanji this seed avoids, and what Russian and Ukrainian will need for the in-laws
   ([P11's *Later languages*](../../features/P-planning/P11-family-and-relationships/README.md#later-languages)).
   A gloss cannot say it without the coordination above.
3. **No word is seeded here that only an unwritable tooltip would use** — all five are P11 §4 rows.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
COUSIN in Japanese and German (親の兄弟の子供, *ein Kind eines Geschwisters eines Elternteils*),
which pins the chained genitive of reading 1.

## Done (2026-09-22)

All five shipped, on the plans the ticket proposed — four on the `kinGloss` genitive
[B71](B71-grandparents-and-grandchildren.md) introduced, and COUSIN on the chain of two, which
is still the only one in the corpus. Pinned in
[kinship.test.ts](../../../packages/engine/test/kinship.test.ts), with COUSIN in Japanese and German in
[definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).

What landed differently from the plan:

1. **Nothing in the renders.** All five came out as the table forecast, the chained genitive included
   (親の兄弟の子供, *ein Kind eines Geschwisters eines Elternteils*) — once the honorific was kept
   out of the glosses, which is the engine rule [B68](B68-the-family.md) records. Before it,
   UNCLE read 親の**ご兄弟** and NEPHEW 兄弟の**息子さん**.
2. **The kana stayed kana.** おじ, おば and いとこ are seeded without kanji and without a `reading`,
   because a word written in kana reads as itself; their honorifics (おじさん, おばさん) are seeded,
   and いとこ has none.
3. **German *Neffe* is seeded `weak: '1'`** and the engine already declined it — "ich sehe meinen
   Neffen" needed no work here.
4. **Reading 2 held**: the Romance masculine says exactly what an uncle is (*un fratello di un
   genitore*), and only German's *Geschwister* stays neutral, where "ein Bruder eines Elternteils"
   says it anyway.
5. **The shorter COUSIN lead stays in *Not solved*.** "An uncle's child" is narrower than the word,
   and a possessor cannot be a coordination; the chain through SIBLING is what says both sides at once.
