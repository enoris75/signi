# A18. Grammar nouns composable today — CLAUSE, RELATIVE_CLAUSE, PERIOD_SENTENCE, VERB_PHRASE, MODIFIER, MODAL, CAUSE_COMPLEMENT, LOCATIVE

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. C05 had the
grammar meta-nouns as "GENDER, NUMBER_GRAMMAR, … etc." and no list. These eight compose from seeded
words on shapes that already ship. The rest are sorted in C05 and in
[B37](B37-complement-names.md), [B38](B38-link.md) and
[B39](B39-quantity-and-category.md). **Done 2026-09-21**, all eight as planned: see
[Done](#done-2026-09-21).)_

## Plans

Each is the genus + relative-clause shape
([B06](B06-grammar-words.md), [B31](B31-complement-genus.md)). The verbs follow
B31's finding that INDICATE is the grammatical term in German (*bezeichnet*) and Japanese (示す),
where EXPRESS gives *vermittelt*. Two need the object that `whoGloss` cannot give, an indefinite
singular or an adjective, so they are written inline:

| concept | isA | seed | plan | gloss (en) |
|---|---|---|---|---|
| CLAUSE | PHRASE | [nouns.ts:2085](../../../packages/backend/src/concepts/nouns.ts#L2085) | inline: PHRASE, relative HAVE, object SUBJECT_GRAMMAR **indefinite singular** | a phrase that has a subject |
| RELATIVE_CLAUSE | CLAUSE | [nouns.ts:2116](../../../packages/backend/src/concepts/nouns.ts#L2116) | `whoGloss('CLAUSE', 'DESCRIBE', 'NOUN')` | a clause that describes nouns |
| PERIOD_SENTENCE | — | [nouns.ts:2315](../../../packages/backend/src/concepts/nouns.ts#L2315) | `whoGloss('PHRASE', 'HAVE', 'CLAUSE')` | a phrase that has clauses |
| VERB_PHRASE | PHRASE | [nouns.ts:2059](../../../packages/backend/src/concepts/nouns.ts#L2059) | `whoGloss('PHRASE', 'INDICATE', 'ACTION')` | a phrase that indicates actions |
| MODIFIER | WORD | [nouns.ts:2201](../../../packages/backend/src/concepts/nouns.ts#L2201) | inline: WORD, relative MODIFY, object WORD bare plural with `adjectives: ['OTHER']` | a word that modifies other words |
| MODAL | VERB | [nouns.ts:2676](../../../packages/backend/src/concepts/nouns.ts#L2676) | `whoGloss('VERB', 'MODIFY', 'VERB')` | a verb that modifies verbs |
| CAUSE_COMPLEMENT | COMPLEMENT_GRAMMAR | [nouns.ts:1911](../../../packages/backend/src/concepts/nouns.ts#L1911) | `whoGloss('COMPLEMENT_GRAMMAR', 'INDICATE', 'CAUSE')` | a complement that indicates causes |
| LOCATIVE | COMPLEMENT_GRAMMAR | [nouns.ts:1840](../../../packages/backend/src/concepts/nouns.ts#L1840) | `whoGloss('COMPLEMENT_GRAMMAR', 'INDICATE', 'PLACE')` | a complement that indicates places |

The three shapes tell one another apart. A clause has a subject, which a verb phrase does not. A
period has clauses. A relative clause is the clause that does to a noun what an adjective does.

## Vocabulary

All seeded: PHRASE, CLAUSE, WORD, VERB, NOUN, SUBJECT_GRAMMAR, ACTION, CAUSE, PLACE,
COMPLEMENT_GRAMMAR, OTHER, HAVE, DESCRIBE, INDICATE, MODIFY.

## Probe renders (2026-09-21, the seeded definitions, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CLAUSE | a phrase that has a subject | una frase che ha un soggetto | une phrase qui a un sujet | eine Phrase, die ein Subjekt hat | una frase que tiene un sujeto | 主語があるフレーズ | uma frase que tem um sujeito |
| RELATIVE_CLAUSE | a clause that describes nouns | una proposizione che descrive sostantivi | une proposition qui décrit des noms | ein Satz, der Substantive beschreibt | una oración que describe sustantivos | 名詞を描写する節 | uma oração que descreve substantivos |
| PERIOD_SENTENCE | a phrase that has clauses | una frase che ha proposizioni | une phrase qui a des propositions | eine Phrase, die Sätze hat | una frase que tiene oraciones | 節があるフレーズ | uma frase que tem orações |
| VERB_PHRASE | a phrase that indicates actions | una frase che indica azioni | une phrase qui indique des actions | eine Phrase, die Handlungen bezeichnet | una frase que indica acciones | 動作を示すフレーズ | uma frase que indica ações |
| MODIFIER | a word that modifies other words | una parola che modifica altre parole | un mot qui modifie d'autres mots | ein Wort, das andere Wörter modifiziert | una palabra que modifica otras palabras | 別の単語を修飾する単語 | uma palavra que modifica outras palavras |
| MODAL | a verb that modifies verbs | un verbo che modifica verbi | un verbe qui modifie des verbes | ein Verb, das Verben modifiziert | un verbo que modifica verbos | 動詞を修飾する動詞 | um verbo que modifica verbos |
| CAUSE_COMPLEMENT | a complement that indicates causes | un complemento che indica cause | un complément qui indique des causes | eine Ergänzung, die Ursachen bezeichnet | un complemento que indica causas | 原因を示す補語 | um complemento que indica causas |
| LOCATIVE | a complement that indicates places | un complemento che indica luoghi | un complément qui indique des lieux | eine Ergänzung, die Orte bezeichnet | un complemento que indica lugares | 場所を示す補語 | um complemento que indica lugares |

Japanese says the inanimate HAVE with ある (主語がある), per
[A150](../../bugs/fixed/A150-japanese-inanimate-owner-aru.md).

## Judgements made on the probe

Re-probed 2026-09-21; the alternatives below render as they did.

- **MODIFIER takes OTHER.** "A word that modifies words" renders too (ja 単語を修飾する単語, de "ein
  Wort, das Wörter modifiziert"), but it reads as though a word could modify itself.
- **MODAL is kept.** It is the weakest of the eight: its literal is "a verb that expresses
  necessity, ability or will". "Modifies verbs" is how a grammar describes what a modal does to the
  main verb, and the genus keeps it apart from ADVERB ("a word that modifies verbs").
- **VERB_PHRASE takes INDICATE, not EXPRESS**, although VERB's shipped gloss uses EXPRESS ("a word
  that expresses actions", de *vermittelt*). EXPRESS renders here too ("a phrase that expresses
  actions", de "eine Phrase, die Handlungen vermittelt", ja 動作を表すフレーズ). The pair are not
  parallel, and it is VERB's German that is weak.
- **DETERMINER** was probed as "a word that indicates nouns" (de "ein Wort, das Substantive
  bezeichnet", ja 名詞を示す単語). That renders, but it is not what a determiner does, so it stays
  in C05.

## Coverage

Two in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): CLAUSE (ja
主語があるフレーズ, the ある) and one complement name, LOCATIVE (de "eine Ergänzung, die Orte
bezeichnet").

## Done (2026-09-21)

**All eight shipped** with the plans in the table above, in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts). Six use `whoGloss`. CLAUSE and MODIFIER
are inline, because `whoGloss` gives only a bare plural object with no adjectives. The rendered
strings are the probe table above: the definitions rendered exactly as probed, and the backend
boots clean with all seven languages for each.

What landed differently from the plan:

1. **Nothing in the plans.** MODAL, which this file offered to drop, was kept on the ruling above.
   MODIFIER takes OTHER as planned.
2. **The seed comments carry the reasons.** They sit on the blocks where a later reader would
   otherwise change the plan: CLAUSE (why the object is indefinite and singular, and the ある),
   VERB_PHRASE (INDICATE, not VERB's EXPRESS), MODIFIER (OTHER) and MODAL (the genus against
   ADVERB). The other four are plain `whoGloss` lines.

- Seed: [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (the eight concepts).
- Tests: *a clause is a phrase that has a subject (localization A18: CLAUSE)*, en + ja, and *a
  place complement is glossed on its genus (localization A18: LOCATIVE)*, en + de, in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
