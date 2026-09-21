# A27. Grammar meta-nouns that a seeded verb already tells apart

_(from the unsorted sweep of 2026-09-22. Five of the corpus's grammar nouns whose differentia is a
seeded verb or adjective. The other twenty-one are [C27](../C-needs-engine/C27-grammar-meta-nouns.md):
they name a position in a system rather than a property, and no phrase composes that.)_

## Plan

Inline on each seed block in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | plan | gloss (en) |
|---|---|---|
| SUBJECT_GRAMMAR | `whoGloss('PARTICIPANT_GRAMMAR', 'GOVERN', 'VERB')` | a participant that governs verbs |
| OBJECT_GRAMMAR | `patientGloss('PARTICIPANT_GRAMMAR', 'INDICATE')` | a participant that one indicates |
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
VERB, and the adjectives POSITIVE and CONDITIONAL.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SUBJECT_GRAMMAR | a participant that governs verbs | un partecipante che regge verbi | un participant qui régit des verbes | ein Partizipant, der Verben regiert | un participante que rige verbos | 動詞を支配する参与者 | um participante que rege verbos |
| OBJECT_GRAMMAR | a participant that one indicates | un partecipante che si indica | un participant qu'on indique | ein Partizipant, den man bezeichnet | un participante que se indica | 示す参与者 | um participante que se indica |
| DEMONSTRATIVE | a determiner that indicates | un determinante che indica | un déterminant qui indique | ein Determinativ, das bezeichnet | un determinante que indica | 示す限定詞 | um determinante que indica |
| POSITIVE_DEGREE | a positive degree | un grado positivo | un degré positif | eine positive Steigerungsstufe | un grado positivo | 肯定の程度 | um grau positivo |
| CONDITION | a conditional clause | una proposizione condizionale | une proposition conditionnelle | ein konditionaler Satz | una oración condicional | 条件節 | uma oração condicional |

All five render in all seven. Two readings to judge on authoring:

1. **OBJECT_GRAMMAR, "a participant that one indicates", is the weak one.** The differentia wanted
   is "the one the verb's action falls on", which needs a relative clause whose gap is the object of
   a *nested* clause — the construct [C27](../C-needs-engine/C27-grammar-meta-nouns.md) names. The
   shipped form says only that an object is pointed at, which is true of a subject too. Ship it only
   if the authoring probe finds it reads as distinguishing beside SUBJECT_GRAMMAR's; otherwise move
   it to C27.
2. **DEMONSTRATIVE and ARTICLE would collide**, which is why ARTICLE is not here. Both are
   determiners, and the only thing that separates them — identifiability versus pointing — is what
   DEFINITE and PROXIMAL mean, and both are adjectives with no gloss of their own
   ([C24](../C-needs-engine/C24-grammar-feature-adjectives.md)). ARTICLE is in C27 with that reason.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts):
SUBJECT_GRAMMAR in English and German, where the relative clause puts the verb last and the
bare-plural object before it (*der Verben regiert*).
