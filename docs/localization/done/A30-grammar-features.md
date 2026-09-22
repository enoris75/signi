# A30. TENSE, ASPECT, VOICE and the other grammar features — "a feature that indicates times"

_(from the unsorted sweep of 2026-09-22, and the ticket that most changed the sweep's mind. These
eleven were drafted as a C — a grammar feature names a position in a system, which sounded like the
[C05](../done/C05-non-distinguishing-genera.md) case — and the probe said otherwise: FEATURE and
CATEGORY are both seeded, INDICATE is seeded, and **what a feature indicates is exactly what tells
one feature from another**. Ten of eleven glosses shipped, with no new word and no new construct.)_

## Plan

Inline on each seed block in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | plan | gloss (en) |
|---|---|---|
| TENSE | `whoGloss('FEATURE', 'INDICATE', 'TIME')` | a feature that indicates times |
| ASPECT | `whoGloss('FEATURE', 'INDICATE', 'PERIOD_TIME')` | a feature that indicates periods |
| VOICE | `whoGloss('FEATURE', 'INDICATE', 'PARTICIPANT_GRAMMAR')` | a feature that indicates participants |
| DEGREE_GRAMMAR | `whoGloss('FEATURE', 'INDICATE', 'LEVEL')` | a feature that indicates levels |
| SENTIMENT | `whoGloss('FEATURE', 'INDICATE', 'FEELING')` | a feature that indicates feelings |
| POLARITY | `whoGloss('FEATURE', 'NEGATE', 'CLAUSE')` | a feature that negates clauses |
| GENDER | `whoGloss('CATEGORY', 'GOVERN', 'WORD')` | a category that governs words |
| PERSON_GRAMMAR | `whoGloss('CATEGORY', 'INDICATE', 'SPEAKER')` | a category that indicates speakers |
| NOUN_PHRASE | `whoGloss('PHRASE', 'HAVE', 'NOUN')` | a phrase that has nouns |
| COORDINATION | `whoGloss('RELATIONSHIP', 'LINK', 'CLAUSE')` | a relationship that links clauses |

**The set was checked for collisions against itself and against what is already shipped.** All
eleven differ in the object of the relative clause, which is the whole point of the shape; and none
repeats AGENT_GRAMMAR's "a participant that acts" ([B49](../done/B49-participant.md)),
DETERMINER's "a word that specifies nouns" ([B51](../done/B51-specify.md)) or the five
[A27](A27-grammar-participants-and-clause-types.md) ships.

## Vocabulary

All seeded: the genera FEATURE, CATEGORY, PHRASE, RELATIONSHIP; the verbs INDICATE, NEGATE, GOVERN,
HAVE, LINK; the objects TIME, PERIOD_TIME, PARTICIPANT_GRAMMAR, LEVEL, FEELING, CONDITION, CLAUSE,
WORD, SPEAKER, NOUN. Several are themselves on the literal — FEATURE, CATEGORY, LEVEL and TIME are
[C26](../C-needs-engine/C26-root-nouns-on-the-literal.md), SPEAKER is
[B57](B57-ui-nouns-needing-a-word.md) — and none of that blocks this ticket.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TENSE | a feature that indicates times | una caratteristica che indica tempi | une caractéristique qui indique des temps | ein Merkmal, das Zeiten bezeichnet | una característica que indica tiempos | 時間を示す特徴 | uma característica que indica tempos |
| ASPECT | a feature that indicates periods | una caratteristica che indica periodi | une caractéristique qui indique des périodes | ein Merkmal, das Zeiträume bezeichnet | una característica que indica períodos | 期間を示す特徴 | uma característica que indica períodos |
| VOICE | a feature that indicates participants | una caratteristica che indica partecipanti | une caractéristique qui indique des participants | ein Merkmal, das Partizipanten bezeichnet | una característica que indica participantes | 参与者を示す特徴 | uma característica que indica participantes |
| DEGREE_GRAMMAR | a feature that indicates levels | una caratteristica che indica livelli | une caractéristique qui indique des niveaux | ein Merkmal, das Ebenen bezeichnet | una característica que indica niveles | 段階を示す特徴 | uma característica que indica níveis |
| SENTIMENT | a feature that indicates feelings | una caratteristica che indica sentimenti | une caractéristique qui indique des sentiments | ein Merkmal, das Gefühle bezeichnet | una característica que indica sentimientos | 感情を示す特徴 | uma característica que indica sentimentos |
| POLARITY | a feature that negates clauses | una caratteristica che nega proposizioni | une caractéristique qui nie des propositions | ein Merkmal, das Sätze verneint | una característica que niega oraciones | 節を否定する特徴 | uma característica que nega orações |
| GENDER | a category that governs words | una categoria che regge parole | une catégorie qui régit des mots | eine Kategorie, die Wörter regiert | una categoría que rige palabras | 単語を支配する範疇 | uma categoria que rege palavras |
| PERSON_GRAMMAR | a category that indicates speakers | una categoria che indica parlanti | une catégorie qui indique des locuteurs | eine Kategorie, die Sprecher bezeichnet | una categoría que indica hablantes | 話し手を示す範疇 | uma categoria que indica falantes |
| NOUN_PHRASE | a phrase that has nouns | una frase che ha sostantivi | une phrase qui a des noms | eine Phrase, die Substantive hat | una frase que tiene sustantivos | 名詞があるフレーズ | uma frase que tem substantivos |
| COORDINATION | a relationship that links clauses | una relazione che collega proposizioni | une relation qui relie des propositions | eine Beziehung, die Sätze verbindet | una relación que enlaza oraciones | 節をつなぐ関係 | uma relação que liga orações |

All ten render in all seven, and the German bare-plural object sits before its clause-final verb
in each (*das Zeiten bezeichnet*). Three readings were judged on authoring:

1. **MOOD went to [C27](../C-needs-engine/C27-grammar-meta-nouns.md)**, as the reading said it
   should. The two tickets were authored together, so the collision was plain on the page:
   [A27](A27-grammar-participants-and-clause-types.md) ships CONDITION as "a conditional
   clause", and MOOD would have sat above it saying it indicates conditions — which names its
   neighbour and misses the asserting, ordering and wishing that mood also is.
2. **POLARITY overstates.** Polarity is whether a clause is affirmed *or* negated; the gloss names
   only the negative half, because there is no seeded verb for "affirm". It is still distinguishing.
   The honest alternative is B-work: seed AFFIRM and gloss it as the feature that affirms *or*
   negates, which needs a coordinated relative clause the engine has not been asked for.
3. **POSITIVE_DEGREE is in [A27](A27-grammar-participants-and-clause-types.md), not here**, on
   `glossOf('DEGREE_GRAMMAR', 'POSITIVE')` — "a positive degree". Authoring the two tickets together
   is worth it: DEGREE_GRAMMAR is this ticket's head and that one's genus, so the pair reads as
   "a feature that indicates levels" / "a positive degree" in the picker, which is the point.

## Not in this ticket

PRESENT_TENSE, PAST_TENSE, FUTURE_TENSE, SINGULAR_GRAMMAR and PLURAL_GRAMMAR all hang under heads
this ticket glosses and each needs one adjective that is not seeded; they are
[B58](B58-tense-and-number-values.md). STATEMENT, ARTICLE and
PARTICIPANT_GRAMMAR were probed with the rest and did not survive: each rendered a gloss true of its
siblings too. They are [C27](../C-needs-engine/C27-grammar-meta-nouns.md).

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): TENSE in
English and German (the clause-final verb after a bare-plural object) and GENDER in English and
Japanese (単語を支配する範疇, the whole clause prenominal).

## Done

Shipped 2026-09-22. Ten `definition` plans in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts). No word seeded, no engine change.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TENSE | a feature that indicates times | una caratteristica che indica tempi | une caractéristique qui indique des temps | ein Merkmal, das Zeiten bezeichnet | una característica que indica tiempos | 時間を示す特徴 | uma característica que indica tempos |
| ASPECT | a feature that indicates periods | una caratteristica che indica periodi | une caractéristique qui indique des périodes | ein Merkmal, das Zeiträume bezeichnet | una característica que indica períodos | 期間を示す特徴 | uma característica que indica períodos |
| VOICE | a feature that indicates participants | una caratteristica che indica partecipanti | une caractéristique qui indique des participants | ein Merkmal, das Partizipanten bezeichnet | una característica que indica participantes | 参与者を示す特徴 | uma característica que indica participantes |
| DEGREE_GRAMMAR | a feature that indicates levels | una caratteristica che indica livelli | une caractéristique qui indique des niveaux | ein Merkmal, das Ebenen bezeichnet | una característica que indica niveles | 段階を示す特徴 | uma característica que indica níveis |
| SENTIMENT | a feature that indicates feelings | una caratteristica che indica sentimenti | une caractéristique qui indique des sentiments | ein Merkmal, das Gefühle bezeichnet | una característica que indica sentimientos | 感情を示す特徴 | uma característica que indica sentimentos |
| POLARITY | a feature that negates clauses | una caratteristica che nega proposizioni | une caractéristique qui nie des propositions | ein Merkmal, das Sätze verneint | una característica que niega oraciones | 節を否定する特徴 | uma característica que nega orações |
| GENDER | a category that governs words | una categoria che regge parole | une catégorie qui régit des mots | eine Kategorie, die Wörter regiert | una categoría que rige palabras | 単語を支配する範疇 | uma categoria que rege palavras |
| PERSON_GRAMMAR | a category that indicates speakers | una categoria che indica parlanti | une catégorie qui indique des locuteurs | eine Kategorie, die Sprecher bezeichnet | una categoría que indica hablantes | 話し手を示す範疇 | uma categoria que indica falantes |
| NOUN_PHRASE | a phrase that has nouns | una frase che ha sostantivi | une phrase qui a des noms | eine Phrase, die Substantive hat | una frase que tiene sustantivos | 名詞があるフレーズ | uma frase que tem substantivos |
| COORDINATION | a relationship that links clauses | una relazione che collega proposizioni | une relation qui relie des propositions | eine Beziehung, die Sätze verbindet | una relación que enlaza oraciones | 節をつなぐ関係 | uma relação que liga orações |

What landed differently from the plan:

1. **MOOD dropped, as reading 1 asked.** Ten of eleven.
2. **The ticket's advice to author it before B58 was followed**, and it paid: TENSE reads "a feature
   that indicates times" above [B58](B58-tense-and-number-values.md)'s "a present tense" in
   the picker, which is the pair the sweep wanted.
3. **PERSON_GRAMMAR's object SPEAKER is glossed now too**, by
   [B57](B57-ui-nouns-needing-a-word.md), which seeded SPEAK in the same pass: "a category
   that indicates speakers" sits above "a person who speaks".
