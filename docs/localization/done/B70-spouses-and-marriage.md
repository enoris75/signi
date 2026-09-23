# B70. Spouses and marriage — four words, four glosses, and the copula that must not take an object

_(from the P11 family-and-relationships sweep of 2026-09-22. SPOUSE, HUSBAND and WIFE of
[P11](../../features/P-planning/P11-family-and-relationships/README.md) §4, and the verb **MARRY**.
All four gloss. HUSBAND and WIFE are the pair D12 keeps on `glossOf(genus, MALE / FEMALE)`, and they
work because *coniuge*, *conjoint*, *Ehepartner*, *cónyuge*, *cônjuge* and 配偶者 are neutral in every
language.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. **(k)** is the Italian
`kinship: '1'` flag (P11 D9), "own" the ja `possessed` column and fr/de `possessed` of D6 — no
definition reads either.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| SPOUSE | noun, isA RELATIVE | spouse | coniuge *m*, fem coniuge | conjoint, fem conjointe | Ehepartner, fem Ehepartnerin | cónyuge *m*, fem cónyuge | 配偶者 (はいぐうしゃ) | cônjuge *m*, fem cônjuge |
| HUSBAND | noun, isA SPOUSE | husband | marito (k) | mari | Ehemann, pl. Ehemänner · own Mann | marido | 夫 (おっと) · other's ご主人 | marido |
| WIFE | noun, isA SPOUSE | wife, pl. wives | moglie *f*, pl. mogli (k) | épouse *f* · own femme | Ehefrau *f* · own Frau | esposa *f* | 妻 (つま) · other's 奥さん | esposa *f* |
| MARRY | verb, transitive | marry | sposare | épouser | heiraten | casarse, `object_prep` con | 結婚する (けっこんする), `object_particle` と | casar, `object_prep` com |

Two things for the seed author:

- **MARRY is data only in six languages** — the Spanish and Portuguese `object_prep` and the
  Japanese `object_particle` are columns the engine already reads ("mi hijo se casa **con** tu hija",
  "娘**と**結婚します"). Spanish *casarse* is stored reflexive, as the seeded MOVE_ONESELF verbs are
  ([C17](C17-motion-verbs-reflexive-genus.md)).
- **French *épouse* and German *Ehefrau* are the citation forms**, and *femme* / *Frau* the
  `possessed` ones D6 adds. Without a possessor the short word reads as "woman", so the gloss below
  and the picker label both want the long one.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| SPOUSE | `patientGloss('PERSON', 'MARRY')` | a person who one marries |
| HUSBAND | `glossOf('SPOUSE', 'MALE')` | a male spouse |
| WIFE | `{ subject: { concept: 'SPOUSE', definiteness: 'indefinite', gender: 'fem', adjectives: ['FEMALE'] } }` | a female spouse |
| MARRY | `infinitiveGloss('BECOME', { complements: { predicative: { phrase: { concept: 'SPOUSE', definiteness: 'indefinite' } } } })` | to become a spouse |

All four.

## Renders (shipped 2026-09-22, from the seeded corpus; pinned in `packages/engine/test/kinship.test.ts`)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SPOUSE | a person who one marries | una persona che si sposa | une personne qu'on épouse | eine Person, die man heiratet | una persona con la que uno se casa | 結婚する人 | uma pessoa com a qual se casa |
| HUSBAND | a male spouse | un coniuge maschile | un conjoint masculin | ein männlicher Ehepartner | un cónyuge masculino | 男性の配偶者 | um cônjuge masculino |
| WIFE | a female spouse | una coniuge femminile | une conjointe féminine | eine weibliche Ehepartnerin | una cónyuge femenina | 女性の配偶者 | uma cônjuge feminina |
| MARRY | to become a spouse | diventare un coniuge | devenir un conjoint | ein Ehepartner werden | volverse un cónyuge | 配偶者になる | tornar-se um cônjuge |

No proposed render collides with a shipped gloss or with another in the P11 batch, in any language.
Three readings to judge on authoring:

1. **MARRY's spouse is a predicative, not an object.** Written as `{ object: 'SPOUSE' }` the same
   gloss comes out wrong in three languages — de *einen Ehepartner werden* (accusative where the
   copula wants the nominative), es *volverse a un cónyuge* (the personal *a* again, and
   [B69](B69-brothers-and-sisters.md) reading 2 does not cover it: this one is *volverse*, not
   *tener*), ja 配偶者**を**なる for になる. Through `complements.predicative` all seven are right.
   This is [C09](C09-modal-verbs.md)'s copular slot doing what it was built for.
2. **SPOUSE and MARRY define each other**, the verb-and-its-typical-object kind the corpus accepts
   (EAT ↔ FOOD, BITE ↔ TOOTH); named here for the cycle walk. The alternative, SPOUSE as "a husband
   or a wife" (the coordination [B68](B68-the-family.md) uses for CHILD_OFFSPRING), renders in all
   seven — *un marito o una moglie*, 夫か妻 — but would close a genus-and-species circle with
   HUSBAND and WIFE, which is the kind that gets refused.
3. **WIFE takes the noun gender control, HUSBAND needs none** — the same split as MOTHER and FATHER
   in B68, and for the same reason: without it Italian reads *un coniuge femminile*.

## Not solved by this seed

1. **What a spouse is married to, in the gloss.** "To become a spouse **with a person**" renders
   (it *diventare un coniuge con una persona*, ja 人と配偶者になる), and it says no more than "to
   become a spouse" does; the comitative was dropped for that reason, not blocked.
2. **MARRIED, SINGLE and DIVORCE** are P11's own follow-ups and no concept here needs them. MARRIED
   would sharpen [B74](B74-partners-and-friends.md)'s BOYFRIEND ("a partner one is not married to"),
   which is where its forms should be proposed.
3. **The husband-and-wife asymmetry of Japanese** (own 夫 / 妻 against another's ご主人 / 奥さん) is
   P11 D2's lexeme work, not a definition's: a gloss has no possessor, so it always reads the `base`.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
MARRY in German and Japanese (*ein Ehepartner werden*, 配偶者になる), which pins reading 1 — the
predicative that keeps the nominative and に.

## Done (2026-09-22)

All four shipped, each on the plan the ticket proposed, with no change to any of them. The seeds are
in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) and
[verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) (MARRY, with its
te-form and participles in [nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts)),
pinned in [kinship.test.ts](../../../packages/engine/test/kinship.test.ts) and covered by the MARRY
row of [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).

What landed differently from the plan:

1. **Nothing in the renders.** All four came out character for character as the ticket's table
   forecast, reading 1 included: through `complements.predicative` German keeps the nominative (*ein
   Ehepartner werden*), Spanish takes no personal a (*volverse un cónyuge*) and Japanese に (配偶者に
   なる).
2. **MARRY is data in six languages, as promised, and the sentence-level pins prove it**: "mi hijo se
   casa **con** tu hija", "o meu filho casa **com** a sua filha", 息子はあなたの娘さん**と**結婚します。
   Its Italian compound past joins the exhaustive table in
   [verb.test.ts](../../../packages/engine/test/verb.test.ts) (*la gatta ha sposato*).
3. **The `possessed` columns of D6 are seeded and the glosses do not read them.** HUSBAND and WIFE
   carry *Mann* / *Frau* and *femme*, which a possessor selects ("ma femme", "die Frau des Jungen"),
   while their own tooltips keep the citation form. What made that true of
   [B73](B73-in-laws-and-step-parents.md)'s glosses too — where the head *does* carry a
   genitive — is the specificity rule B68 records.
4. **MARRIED, SINGLE and DIVORCE stay unseeded**, as *Not solved* 2 says. Nothing in the batch needed
   them, and [B74](B74-partners-and-friends.md)'s BOYFRIEND shipped on the sex adjective
   rather than on the marriage.
