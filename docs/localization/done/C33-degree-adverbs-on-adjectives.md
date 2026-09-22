# C33. VERY and TOO — an adverb cannot modify an adjective

**Kind:** was blocked on a construct. Two P09 adverbs that only ever modify an adjective ("very big",
"too big"), where the engine attached adverbs to verbs alone.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E8**. **Done** on 2026-09-22: the intensifier slot shipped, both words are seeded, VERY is
glossed and TOO is literal by design; see [Done](#done).)_

## The concepts

| concept | role | forms |
|---|---|---|
| VERY | adverb (intensifier) | very, molto, très, sehr, muy, とても, muito |
| TOO | adverb (intensifier) | too, troppo, trop, zu, demasiado, 〜すぎる, demais |

## Was blocked on: a modifier slot on the adjective — resolved

`NounPhrase.adjectives` was a list of concept ids with a parallel `adjectiveDegrees`, and `Degree` is
comparison — `positive | more | most | less | least | equally` — not intensity. An adverb reached only
`VerbPhrase.modifier` (and a modal's own `modifier`). No plan could say "very big", so there was
nothing to probe: seeded as verb adverbs, "the cat runs very" is what the builder would have offered.

## Done

**2026-09-22.** `NounPhrase.adjectiveIntensifiers` (index-aligned with `adjectives`) and
`headIntensifier` (the predicate adjective's, beside `headDegree`). The intensifier is a **concept**,
not a value, so each language looks its own word up; where it stands is the word's business, which its
lexeme names (`position`): before the adjective in six languages and for pt *muito*, **after** it for
pt *demais*, and in Japanese not a word at all — 〜すぎる is a suffix on the adjective's stem.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| a **very** big cat runs | a very big cat runs. | un gatto molto grande corre. | un chat très grand court. | ein sehr großer Kater läuft. | un gato muy grande corre. | とても大きい猫は走ります。 | um gato muito grande corre. |
| a **too** big cat runs | a too big cat runs. | un gatto troppo grande corre. | un chat trop grand court. | ein zu großer Kater läuft. | un gato demasiado grande corre. | **大きすぎる猫は走ります。** | um gato **grande demais** corre. |
| the cat is **very** big | the cat is very big. | il gatto è molto grande. | le chat est très grand. | der Kater ist sehr groß. | el gato es muy grande. | 猫はとても大きいです。 | o gato é muito grande. |
| the cat is **too** big | the cat is too big. | il gatto è troppo grande. | le chat est trop grand. | der Kater ist zu groß. | el gato es demasiado grande. | **猫は大きすぎます。** | o gato é grande demais. |
| the cat was not **too** big | the cat was not too big. | il gatto non era troppo grande. | le chat n'était pas trop grand. | der Kater war nicht zu groß. | el gato no era demasiado grande. | **猫は大きすぎませんでした。** | o gato não era grande demais. |
| **too** happy (な-adjective) | | | | | | **幸せすぎる猫** | |
| **too** tired (た-adjective) | | | | | | **猫は疲れすぎます。** | |
| very bigger (outside a degree) | a very bigger cat | un gatto molto più grande | un chat très plus grand | ein sehr größerer Kater | un gato muy más grande | とてももっと大きい猫 | um gato muito maior |

What landed differently from the plan:

1. **Concepts, not a `Degree`-like field.** The file left that open. Concepts won because the word is
   lexical in three separate ways — pt *demais* follows, ja 〜すぎる is morphology, and the set can
   grow — and because a concept can carry a gloss, which is what this catalogue is for.
2. **Japanese needed a new adjective class.** 〜すぎる is an **ichidan verb**, so an adjective that
   takes it stops inflecting as an adjective: `jaAdjClass` gained a `ru` kind and the copula tables a
   row, and tense, negation, the たら form, a relative clause and a modal all compose on it. The suffix
   attaches to the stem each class gives — 大き, 幸せ, and a た-adjective's te-stem with its て taken
   back off (疲れて → 疲れ).
3. **An intensified adjective is postnominal in Romance**, as a compared one is — and OTHER then gives
   the indefinite article back ("un gatto molto altro", "un gato muy otro"), which it had been keeping
   because it stood where the article would. That last was a latent defect: a *compared* OTHER lost the
   article the same way, and does not any more.
4. **VERY is glossed, TOO is not.** VERY takes UP's direction complement on LEVEL —

   | | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | **VERY** | to a high level | a un livello alto | à un niveau haut | zu einer hohen Ebene | a un nivel alto | 高い段階へ | a um nível alto |

   — and TOO's "to an excessive level" has no word: the corpus has no *excessive*, and the leads that
   do render say something else ("to a higher level" is a comparative, "to a bad level" is a verdict).
   TOO keeps its English literal.
5. **The builder does not offer the slot yet.** Both words are flagged `intensifier`, which keeps them
   out of the verb-adverb picker exactly as `modal` keeps a modal out of the main-verb one — so the
   builder can never offer "the cat runs very". An intensifier control on the adjective, and the
   `UI_STRINGS` labels it would need, are what is left here.

Pinned in [`intensifiers.test.ts`](../../../packages/engine/test/intensifiers.test.ts).
