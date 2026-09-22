# A27. Grammar meta-nouns that a seeded verb already tells apart

_(from the unsorted sweep of 2026-09-22. Five of the corpus's grammar nouns whose differentia is a
seeded verb or adjective. The other twenty-one are [C27](../done/C27-grammar-meta-nouns.md):
they name a position in a system rather than a property, and no phrase composes that.)_

## Plan

Inline on each seed block in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | plan | gloss (en) |
|---|---|---|
| SUBJECT_GRAMMAR | `whoGloss('PARTICIPANT_GRAMMAR', 'GOVERN', 'VERB')` | a participant that governs verbs |
| OBJECT_GRAMMAR | `patientOfGloss('PARTICIPANT_GRAMMAR', 'GOVERN', 'VERB')` | a participant that a verb governs |
| DEMONSTRATIVE | `whoGloss('DETERMINER', 'INDICATE')` | a determiner that indicates |
| POSITIVE_DEGREE | `glossOf('DEGREE_GRAMMAR', 'POSITIVE')` | a positive degree |
| CONDITION | `glossOf('CLAUSE', 'CONDITIONAL')` | a conditional clause |

**SUBJECT_GRAMMAR cannot be "a participant that acts".** That is already AGENT_GRAMMAR's shipped
gloss ([B49](../done/B49-participant.md)), and the two are different things — a passive clause's
subject is not its agent, which is the distinction AGENT_GRAMMAR was seeded to draw. GOVERN, seeded
for exactly this and still on the literal itself, gives the property that is true of every subject
and of no other participant: it is what the verb agrees with.

## Vocabulary

All seeded: PARTICIPANT_GRAMMAR (seeded by [B49](../done/B49-participant.md)), DETERMINER (glossed
by [B51](../done/B51-specify.md)), DEGREE_GRAMMAR, CLAUSE, the verbs GOVERN and INDICATE, the noun
VERB, and the adjectives POSITIVE and CONDITIONAL. GOVERN carries both subject glosses after the
reshape; INDICATE is left to DEMONSTRATIVE.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SUBJECT_GRAMMAR | a participant that governs verbs | un partecipante che regge verbi | un participant qui régit des verbes | ein Partizipant, der Verben regiert | un participante que rige verbos | 動詞を支配する参与者 | um participante que rege verbos |
| OBJECT_GRAMMAR | a participant that a verb governs | un partecipante che un verbo regge | un participant qu'un verbe régit | ein Partizipant, den ein Verb regiert | un participante que un verbo rige | 動詞が支配する参与者 | um participante que um verbo rege |
| DEMONSTRATIVE | a determiner that indicates | un determinante che indica | un déterminant qui indique | ein Determinativ, das bezeichnet | un determinante que indica | 示す限定詞 | um determinante que indica |
| POSITIVE_DEGREE | a positive degree | un grado positivo | un degré positif | eine positive Steigerungsstufe | un grado positivo | 肯定の程度 | um grau positivo |
| CONDITION | a conditional clause | una proposizione condizionale | une proposition conditionnelle | ein konditionaler Satz | una oración condicional | 条件節 | uma oração condicional |

All five render in all seven. Two readings were judged on authoring:

1. **OBJECT_GRAMMAR was reshaped rather than moved to C27.** "A participant that one indicates" is
   true of a subject too, as the reading said. What it wanted was not the nested-clause gap C27
   names but the gap it already had with a *named* agent in the subject: **a participant that a
   verb governs**. That is what a grammatical object is — the verb governs its case — and it is
   exactly SUBJECT_GRAMMAR's relation read the other way round, so the pair reads as one
   distinction in the picker. German shows it on the relative pronoun: *der Verben regiert* against
   *den ein Verb regiert*. The helper is `patientOfGloss`, new in this pass and used again by
   [B56](B56-countries-and-continents.md)'s COUNTRY.
2. **DEMONSTRATIVE and ARTICLE would collide**, which is why ARTICLE is not here. Both are
   determiners, and the only thing that separates them — identifiability versus pointing — is what
   DEFINITE and PROXIMAL mean, and both are adjectives with no gloss of their own
   ([C24](../done/C24-grammar-feature-adjectives.md)). ARTICLE is in C27 with that reason.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts):
SUBJECT_GRAMMAR in English and German, where the relative clause puts the verb last and the
bare-plural object before it (*der Verben regiert*).

## Done

Shipped 2026-09-22. Five `definition` plans in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), and one new helper. No word seeded,
no engine change.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SUBJECT_GRAMMAR | a participant that governs verbs | un partecipante che regge verbi | un participant qui régit des verbes | ein Partizipant, der Verben regiert | un participante que rige verbos | 動詞を支配する参与者 | um participante que rege verbos |
| OBJECT_GRAMMAR | a participant that a verb governs | un partecipante che un verbo regge | un participant qu'un verbe régit | ein Partizipant, den ein Verb regiert | un participante que un verbo rige | 動詞が支配する参与者 | um participante que um verbo rege |
| DEMONSTRATIVE | a determiner that indicates | un determinante che indica | un déterminant qui indique | ein Determinativ, das bezeichnet | un determinante que indica | 示す限定詞 | um determinante que indica |
| POSITIVE_DEGREE | a positive degree | un grado positivo | un degré positif | eine positive Steigerungsstufe | un grado positivo | 肯定の程度 | um grau positivo |
| CONDITION | a conditional clause | una proposizione condizionale | une proposition conditionnelle | ein konditionaler Satz | una oración condicional | 条件節 | uma oração condicional |

What landed differently from the plan:

1. **`patientOfGloss(genus, verb, agent)` is new**: `patientGloss`'s object-gap relative with an
   indefinite noun in the subject where "one" would stand. It is what let OBJECT_GRAMMAR say the
   relation instead of being moved to C27, and B56's COUNTRY ("land that a nation governs") is the
   second caller the same day.
2. **CONDITION's gloss is also what dropped MOOD.** [A30](A30-grammar-features.md) proposed
   MOOD as "a feature that indicates conditions"; with CONDITION shipping as "a conditional clause"
   on the same page, MOOD's gloss names its neighbour, so it went to C27 instead.
