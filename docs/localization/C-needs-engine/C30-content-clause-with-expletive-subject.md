# C30. SHOULD and MIGHT — "it is right / possible that one acts" needs the act as a subject

**Kind:** blocked on a construct. Two P09 modals whose meaning is a judgment **about the act**, not
a property of the one who acts. MUST, CAN and WILL ship on the C09 shape "to be obliged / able / to
desire to act", where the adjective is said of the actor; *right* and *possible* are said of the
action, and no plan can make an action a subject.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E4** (content clauses). Both words are seeded by [B63](../done/B63-modal-verbs-may-should-might.md),
which probes every lead; this ticket owns their glosses. **Both were seeded on 2026-09-22**, when
B63 was authored — with the English, German and Japanese modal work their paradigms needed — and
each shows the English literal in its tooltip until this construct lands.)_

## The concepts

| concept | seeded by | the gloss it waits for |
|---|---|---|
| SHOULD | B63 | it is right that one acts (it *è giusto che si agisca*, fr *il est juste qu'on agisse*, de *es ist richtig, dass man handelt*, ja 行動することが正しい) |
| MIGHT | B63 | it is possible that one acts (*è possibile che si agisca*, *es ist möglich, dass man handelt*) — not "to be able to act", which is CAN's gloss character for character |

EVEN's gloss ("also, though one does not expect it") needs this construct too, but EVEN cannot be
seeded until [C39](C39-focus-particle-on-a-noun-phrase.md) lands, and is owned there.

## Blocked on

**A content clause as the subject of an evaluative predicate, with its expletive.** Probed
2026-09-22, engine source at HEAD, RIGHT_CORRECT and POSSIBLE seeded in memory with an
`infinitive_link`:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BE + RIGHT_CORRECT + ACT | to be right to act. | essere giusto di agire. | être juste d'agir. | richtig sein, zu handeln. | ser correcto de actuar. | 行動することが正しい。 | ser certo de agir. |
| BE + POSSIBLE + ACT | to be possible to act. | essere possibile di agire. | être possible d'agir. | möglich sein, zu handeln. | ser posible de actuar. | 行動することがありうるである。 | ser possível de agir. |
| BE + OBLIGED at `less` + ACT | to be less obliged to act. | essere meno obbligato ad agire. | être moins obligé d'agir. | weniger verpflichtet sein, zu handeln. | estar menos obligado a actuar. | 行動することがそれほど義務的ではない。 | estar menos obrigado a agir. |

The infinitive complement is controlled by the subject, so *giusto*, *juste*, *richtig*, *correcto*
and *certo* are said of the one who acts ("the person is right to act") — wrong in five languages.
Only Japanese reads right, because its こと clause is already the adjective's subject. OBLIGED at
`less` denies the obligation in Japanese and is a comparative with no standard (E5).

## What would move it

A clause that can be the **subject** of BE + an adjective, extraposed behind an expletive where the
language has one (en *it*, fr *il*, de *es*; none in it/es/pt/ja), its verb in the present
subjunctive in the four Romance languages (*si agisca*, *qu'on agisse*, *se actúe*, *se aja* — the
mood exists already, `presentSubjunctive` in the engine's `Mood`). In a gloss the clause's subject is
the generic "one". It is one slice of P09's E4 — the "say *that* …" object clause is the other, and
would serve SAY, THINK, BELIEVE and TELL beyond their glosses.
