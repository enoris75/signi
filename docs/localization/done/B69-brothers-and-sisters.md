# B69. Brothers and sisters — five glosses on one shape, and the Spanish *a* that has to go

_(from the P11 family-and-relationships sweep of 2026-09-22. SIBLING, BROTHER and SISTER of
[P11](../../features/P-planning/P11-family-and-relationships/README.md) §4, and the two adjectives
**ELDER** and **YOUNGER** that D5 seeds for the Japanese fusion. All five gloss. The route is not
the one P11 D12 assumed — see reading 1 — and it meets one Spanish defect, which the seed has to fix
(reading 2).)_

**Shipped on 2026-09-22** — see [Done](#done-2026-09-22). The Spanish defect was fixed with the
seed, as reading 2 asked.

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. **(k)** is the Italian
`kinship: '1'` flag (P11 D9). The Japanese `with_ELDER` / `with_YOUNGER` fusion columns (兄, 弟, 姉,
妹 and their honorifics) are in [P11
§4](../../features/P-planning/P11-family-and-relationships/README.md#the-family); no definition
reads them, so the tooltips do not wait on P11 §2–§3.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| SIBLING | noun, isA RELATIVE | sibling | fratello, fem sorella (k) | frère, fem sœur, pl. **frères et sœurs** | Geschwister *n*, pl. Geschwister | hermano, fem hermana | 兄弟 (きょうだい) | irmão, fem irmã |
| BROTHER | noun, isA SIBLING | brother | fratello (k) | frère | Bruder, pl. Brüder | hermano | 兄弟 (きょうだい) | irmão |
| SISTER | noun, isA SIBLING | sister | sorella *f* (k) | sœur *f* | Schwester *f* | hermana *f* | 姉妹 (しまい) | irmã *f* |
| ELDER | adjective | older | maggiore | aîné | älter | mayor | 上の (うえの) | mais velho |
| YOUNGER | adjective | younger | minore | cadet | jünger | menor | 下の (したの) | mais novo |

Two things for the seed author:

- **French YOUNGER is *cadet*, which the adjective rule gets wrong** (*cousines cadetes*): P11 §3
  adds `cadet: ['cadet', 'cadette', 'cadets', 'cadettes', 'cadet']` to
  [`FR_ADJ_IRREGULAR`](../../../packages/engine/src/languages/fr/fr.consts.ts#L23). The gloss below
  does not use the word, but the picker's own label and every phrase do, so the seed carries the fix.
- **The Japanese adjectives end in の** so that
  [`jaAdjClass`](../../../packages/engine/src/languages/ja/jaAdjClass.ts) links them (P11 D5: bare
  上 gave 上息子).

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| SIBLING | `{ subject: { concept: 'PERSON', definiteness: 'indefinite', relative: { verbPhrase: { verb: 'HAVE' }, directObject: { concept: 'PARENT', definiteness: 'definite', number: 'plural', adjectives: ['SAME'] } } } }` | a person who has the same parents |
| BROTHER | the same, `adjectives: ['MALE']` on the head | a male person who has the same parents |
| SISTER | the same, `adjectives: ['FEMALE']` on the head | a female person who has the same parents |
| ELDER | `{ subject: { concept: 'AGE', definiteness: 'bare', adjectives: ['GREAT'], adjectiveDegrees: ['more'], dimensionGloss: true } }` | of greater age |
| YOUNGER | the same with LOW | of lower age |

All five. The sibling shape is one plan with a different sex adjective on its head; ELDER and
YOUNGER are OLD's and YOUNG's own `dimGloss` at the comparative degree.

## Renders (shipped 2026-09-22, from the seeded corpus; pinned in `packages/engine/test/kinship.test.ts`)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SIBLING | a person who has the same parents | una persona che ha gli stessi genitori | une personne qui a les mêmes parents | eine Person, die die gleichen Eltern hat | una persona que tiene los mismos padres | 同じ両親を持つ人 | uma pessoa que tem os mesmos pais |
| BROTHER | a male person who has the same parents | una persona maschile che ha gli stessi genitori | une personne masculine qui a les mêmes parents | eine männliche Person, die die gleichen Eltern hat | una persona masculina que tiene los mismos padres | 同じ両親を持つ男性の人 | uma pessoa masculina que tem os mesmos pais |
| SISTER | a female person who has the same parents | una persona femminile che ha gli stessi genitori | une personne féminine qui a les mêmes parents | eine weibliche Person, die die gleichen Eltern hat | una persona femenina que tiene los mismos padres | 同じ両親を持つ女性の人 | uma pessoa feminina que tem os mesmos pais |
| ELDER | of greater age | di età più grande | d'âge plus grand | von größerem Alter | de edad más grande | 年齢がもっと大きい | de idade maior |
| YOUNGER | of lower age | di età più bassa | d'âge plus bas | von niedrigerem Alter | de edad más baja | 年齢がもっと低い | de idade mais baixa |
| OLD, YOUNG (shipped, for comparison) | of great age / of low age | di grande età / di età bassa | de grand âge / d'âge bas | von großem Alter / von niedrigem Alter | de edad grande / de edad baja | 年齢が大きい / 年齢が低い | de idade grande / de idade baixa |

No proposed render collides with a shipped gloss or with another in the P11 batch, in any language.
Four readings to judge on authoring:

1. **This overturns what P11 D12 expected.** D12 files BROTHER and SISTER as *no definition
   possible*, because the sex adjective on their genus gives "a female brother" — probed, and true:
   `glossOf('SIBLING', 'FEMALE')` is *una sorella femminile* in Italian and *un fratello maschile*
   for BROTHER. Romance has no neutral singular, so the genus route is dead. The **relative clause
   goes around it**: the head is PERSON, which is neutral in all seven, and the differentia is the
   parents, not the word for a sibling. The same move is what SIBLING itself needed (D12 says it
   needs SAME) and it turns out to gloss all three.
2. **Spanish must lose the personal *a* after *tener*, and the seed has to fix it.** "Una persona
   que tiene **a** los mismos padres" is wrong: *tener* takes no personal *a* when it says who one
   has (*tengo dos hermanos*, *tiene los mismos padres*), and the engine marks every determined human
   object ([`takesPersonalA.ts:12`](../../../packages/engine/src/languages/es/takesPersonalA.ts#L12)).
   Probed: *ver* keeps it and is right (*ve a los mismos padres*), a non-human object never takes it
   (*tiene los mismos libros*), and a bare object does not either (PARENT's own *tiene hijos*, which
   is why no shipped gloss shows the defect). **No bug file covers it.** Fix it with the seed —
   `tener` opting out by lexeme, as `object_a` opts in — or the three sibling tooltips ship wrong in
   Spanish.
3. **The German and Spanish readings depend on B68.** *Die gleichen Eltern* and *los mismos padres*
   are the D7 plurals [B68](B68-the-family.md) gives PARENT; against today's seed the same plan reads
   *die gleichen Elternteile* ("the same parent-parts") and *los mismos progenitores*. Author B68
   first, or author both in one pass.
4. **ELDER and YOUNGER say the dimension, not the comparison.** *Of greater age* is OLD's own gloss
   shape one degree up, and it renders in all seven — but what the words mean is older **than
   another relative**, and the engine has no standard of comparison to name (no *than* phrase;
   `Degree` is bare). Two other leads were probed: the superlative ("of the greatest age") is wrong
   and shows a fusion defect of its own (it *di l'età più grande*, pt *de a maior idade*), and OLD at
   `more` on a sibling ("an older sibling") is a phrase, not a gloss. The gap is recorded here rather
   than ticketed: nothing else in the corpus wants it, and these two ship without it.

## Not solved by this seed

1. **The genus route for BROTHER and SISTER**, kept for the record because D12 reasoned from it:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | `glossOf('SIBLING', 'MALE')` | a male sibling | un fratello maschile | un frère masculin | ein männliches Geschwister | un hermano masculino | 男性の兄弟 | um irmão masculino |
   | `glossOf('SIBLING', 'FEMALE')` + `gender: 'fem'` | a female sibling | una sorella femminile | une sœur féminine | ein weibliches Geschwister | una hermana femenina | 女性の兄弟 | uma irmã feminina |
   | a CHILD_OFFSPRING of a PARENT | a parent's child | un figlio di un genitore | un enfant d'un parent | ein Kind eines Elternteils | un hijo de un progenitor | 親の子供 | um filho de um progenitor |

   The first two read "a male brother" and "a female sister" in Romance. The third is true of every
   child, so it fails the [C05](C05-non-distinguishing-genera.md) test against
   CHILD_OFFSPRING.
2. **A standard of comparison** (*older than one's brother*) — reading 4. It would sharpen ELDER and
   YOUNGER, and nothing else in the corpus asks for it.
3. **Half- and step-siblings** are out of P11's scope, and Japanese splits them by the shared parent
   (異母兄弟 / 異父兄弟). The SAME-parents shape is what a later ticket would narrow.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
SISTER in Spanish and Japanese — Spanish pins the personal *a* reading 2 has to fix (*una persona
femenina que tiene los mismos padres*) and Japanese the adjective order (同じ親を持つ女性の人).

## Done (2026-09-22)

All five shipped: SIBLING, BROTHER and SISTER on the one relative-clause shape
([`sameParentsGloss`](../../../packages/backend/src/concepts/nouns.ts) in nouns.ts), and ELDER and
YOUNGER on `dimGloss` at the comparative degree, which the helper learned a third argument for.
Pinned in [kinship.test.ts](../../../packages/engine/test/kinship.test.ts), covered by the SISTER row
of [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).

What landed differently from the plan:

1. **The Spanish defect was fixed as reading 2 asked, by lexeme.** `tener` says `object_no_a: '1'`
   and [takesPersonalA](../../../packages/engine/src/languages/es/takesPersonalA.ts) returns false for
   it, so "tiene los mismos padres" — while *ver* on the very same object keeps the a ("ve a los
   mismos padres"), which is the pair the test pins. `object_a` opts in, `object_no_a` opts out, and
   nothing but HAVE's Spanish lexeme carries it.
2. **The Japanese reads 両親, not 親.** [B68](B68-the-family.md) seeded PARENT's D7 plurals in
   all four languages that have one, Japanese included, so the same plan now says 同じ**両親**を持つ人
   — the word a speaker uses for two parents.
3. **The Japanese adjectives are seeded but the glosses do not use them.** ELDER and YOUNGER exist
   for the fusion (兄, 弟, 姉, 妹), which is P11 D5's; their own tooltips are the dimension, 年齢が
   もっと大きい / もっと低い, and neither reads a `with_` column.
4. **French *cadet* needed no work here.** P11 §3 had already put it in
   [`FR_ADJ_IRREGULAR`](../../../packages/engine/src/languages/fr/fr.consts.ts), so seeding YOUNGER
   gave *ma sœur cadette* and *les cousines cadettes* straight away — pinned, because the rule alone
   would say *cadetes*.
5. **Reading 4 stands unchanged**: ELDER and YOUNGER say the dimension, not the comparison, and the
   standard of comparison the words really mean is still nothing the engine can name. It is recorded
   here, not ticketed — nothing else in the corpus asks for it.
