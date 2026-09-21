# B49. AGENT_GRAMMAR — seed PARTICIPANT_GRAMMAR: a participant that acts

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. The agent is a role,
defined by its relation to a clause ("the one that acts"). A relative clause needs a head noun,
and nothing seeded named a participant. C05 named the word and did not probe it. **Done
2026-09-21**, as planned, the Japanese accepted: see [Done](#done-2026-09-21).)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| PARTICIPANT_GRAMMAR | noun | one of the entities an event involves (grammar) | participant | partecipante | participant | Partizipant | participante | 参与者 (さんよしゃ) | participante |

Seeded as proposed, just above AGENT_GRAMMAR in the grammar terms of
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L1994).

- **The grammar sense only**, suffixed like AGENT_GRAMMAR and with `synonym: 'grammar'`, because
  the everyday word is a different one in two languages. German *Teilnehmer* and Japanese 参加者 are
  attendees. *Partizipant* and 参与者 are what grammars say.
- **German** *Partizipant* is a weak masculine (*des Partizipanten*), seeded `weak: '1'`. The
  adjectival noun *Beteiligter* (*ein Beteiligter*, *der Beteiligte*) is not something a noun seed can
  decline.
- **The hierarchy.** AGENT_GRAMMAR now hangs under it (`/attach`). AGENT_GRAMMAR was a root, so the
  move is a pure insertion: it had no ancestors to lose.
- **Its own gloss.** PARTICIPANT_GRAMMAR has none: it is a genus with nothing above it, as FEELING
  is ([C05](C05-non-distinguishing-genera.md#feeling)).

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| AGENT_GRAMMAR | `whoGloss('PARTICIPANT_GRAMMAR', 'ACT')` | a participant that acts |

### Probe renders (2026-09-21, the seeded word and definition, lexicon seeded in memory, engine source)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| AGENT_GRAMMAR | a participant that acts | un partecipante che agisce | un participant qui agit | ein Partizipant, der handelt | un participante que actúa | 行動する参与者 | um participante que age |

The same as the ticket's wrapper probe.

**The Japanese, judged: accepted.** ACT's 行動する is "to act, to behave", said of people. A grammar
says 動作をする (AGENT_GRAMMAR is 動作主, the doer of an action), but 行動する参与者 still reads as "a
participant that acts".

SUBJECT_GRAMMAR and OBJECT_GRAMMAR stay in C05. The subject is a syntactic function, not a
participant. The object would need a verb for undergoing an action, and "a participant that one
acts on" is not what a grammar says.

## Coverage

AGENT_GRAMMAR in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and German (ein Partizipant, der handelt).

## Done (2026-09-21)

**AGENT_GRAMMAR → "a participant that acts"**, the plan above, on its seed block in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L2017), which now also carries
`isA: 'PARTICIPANT_GRAMMAR'`. The backend renders it in all seven languages at boot.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| AGENT_GRAMMAR | a participant that acts | un partecipante che agisce | un participant qui agit | ein Partizipant, der handelt | un participante que actúa | 行動する参与者 | um participante que age |

The word itself, and the weak German declension:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PARTICIPANT_GRAMMAR, a / the plural | a participant / the participants | un partecipante / i partecipanti | un participant / les participants | ein Partizipant / die Partizipanten | un participante / los participantes | 参与者 | um participante / os participantes |
| the participant's name | the participant's name | il nome del partecipante | le nom du participant | der Name des **Partizipanten** | el nombre del participante | 参与者の名前 | o nome do participante |

What landed differently from the plan:

1. **Nothing in the plan.** The word took the proposed forms, and the definition rendered exactly as
   the wrapper probe had it. The Japanese was judged and accepted as it stands.
2. **No feminine.** PARTICIPANT_GRAMMAR is a grammar term, not a person noun, so it has no `fem`
   forms (it *una partecipante*, fr *une participante*), as QUANTITY and CATEGORY have none. Nor is it
   `animate`: Spanish takes no personal *a* before it (*el gato ve el participante*).

- Seed: [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (PARTICIPANT_GRAMMAR;
  AGENT_GRAMMAR's `definition` and `isA`).
- Tests: the word, its plural and the German weak declension, and the gloss, in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); en + de in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
