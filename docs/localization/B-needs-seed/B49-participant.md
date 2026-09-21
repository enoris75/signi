# B49. AGENT_GRAMMAR — seed PARTICIPANT_GRAMMAR: a participant that acts

_(split out of [C05](../done/C05-non-distinguishing-genera.md) on 2026-09-21. The agent is a role,
defined by its relation to a clause ("the one that acts"). A relative clause needs a head noun,
and nothing seeded named a participant. C05 named the word and did not probe it.)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| PARTICIPANT_GRAMMAR | noun | one of the entities an event involves (grammar) | participant | partecipante | participant | Partizipant | participante | 参与者 | participante |

- **The grammar sense only**, suffixed like AGENT_GRAMMAR and with `synonym: 'grammar'`, because
  the everyday word is a different one in two languages. German *Teilnehmer* and Japanese 参加者 are
  attendees. *Partizipant* and 参与者 are what grammars say.
- **German** *Partizipant* is a weak masculine (*des Partizipanten*), so seed `weak: '1'`. The
  adjectival noun *Beteiligter* (*ein Beteiligter*, *der Beteiligte*) is not something a noun seed can
  decline.
- **The hierarchy.** Hang AGENT_GRAMMAR under it (`/attach`). AGENT_GRAMMAR is a root today.
- **Its own gloss.** PARTICIPANT_GRAMMAR has none: it is a genus with nothing above it, as FEELING
  is ([C05](../done/C05-non-distinguishing-genera.md#feeling)).

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| AGENT_GRAMMAR | `whoGloss('PARTICIPANT_GRAMMAR', 'ACT')` | a participant that acts |

### Probe renders (2026-09-21, engine source at HEAD, PARTICIPANT_GRAMMAR through a lookup wrapper, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| AGENT_GRAMMAR | a participant that acts | un partecipante che agisce | un participant qui agit | ein Partizipant, der handelt | un participante que actúa | 行動する参与者 | um participante que age |

**Judge** the Japanese. ACT's 行動する is "to act, to behave", said of people. A grammar says 動作をする
(AGENT_GRAMMAR is 動作主, the doer of an action), but 行動する参与者 still reads as "a participant that
acts".

SUBJECT_GRAMMAR and OBJECT_GRAMMAR stay in C05. The subject is a syntactic function, not a
participant. The object would need a verb for undergoing an action, and "a participant that one
acts on" is not what a grammar says.

## Coverage

Add AGENT_GRAMMAR to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and German (ein Partizipant, der handelt).
