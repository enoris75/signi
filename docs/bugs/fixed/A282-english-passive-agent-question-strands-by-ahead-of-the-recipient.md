# A282. An English passive agent question strands *by* ahead of the recipient

**Languages:** English

English asks a passive's agent by stranding *by*
([P09-E16](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E16-passive-question.md) D2): "who
is the food eaten **by**?". The engine writes the bare *by* in the by-phrase's own slot, right after
the participle. In the statement that slot comes ahead of the recipient ("the book is given by the man
to the child"). In the question, *by* is then left between the participle and an argument of the verb,
where it reads as the start of a by-phrase that never comes: *by to the child*.

| Case | Now | Want |
|---|---|---|
| who is the BOOK given to the CHILD by (passive GIVE, `subject` gap, animate) | `who is the book given by to the child?` | `who is the book given to the child by?` |
| what is the BOOK given to the CHILD by (inanimate) | `what is the book given by to the child?` | `what is the book given to the child by?` |

**Why this target.** A stranded preposition closes the phrase it belongs to, after the verb's
arguments. Both Want strings were verified by applying a trial fix to a throwaway copy of the tree.
The fix wrote the recipient between the participle and the bare *by* for an agent gap only. The same
copy renders the past as "who was the book given to the child by?".

**Already right.** The other six front the whole agent phrase and have nothing to strand: it "da chi
è dato al bambino il libro?", fr "par qui est-ce que le livre est donné à l'enfant ?", de "von wem wird
das Buch dem Kind gegeben?", es "¿por quién es dado el libro al niño?", ja "本は誰によって子供にあげられますか？",
pt "por quem o livro é dado à criança?". The statement's order (by-phrase, then recipient) is right.

**Decision for the fixer.** P09-E16's D2 accepted the stranded *by* keeping the by-phrase's slot
ahead of an **adjunct**, and a passing test pins it: "who is the food eaten by in the house?" (`the
stranded by keeps the by-phrase's slot` in questions.test.ts). This bug is only about an
**argument** PP, the terminus. The fixer must choose between two rules:

1. **By strands after the arguments only.** An argument complement (the terminus here) moves ahead of
   *by*, and an adjunct stays after it. "who is the book given to the child by in the house?". The D2
   pin keeps passing. This is the trial fix, and this file's recommendation: *by* then closes the
   verb's argument structure, which is what English strands against.
2. **By strands clause-finally.** Adjuncts move too: "who is the food eaten in the house by?". This
   reads more naturally in speech, but it overturns D2 and flips its pin. It would need a ruling
   recorded against P09-E16.

Only the argument case is pinned, so either rule turns the pin green.

**Shape of the fix.** In
[en/predicateParts.ts](../../../packages/engine/src/languages/en/predicateParts.ts)'s
`predicateWords`, the passive's `objectText` is the participle plus `agentPhrase(agent)`. For an agent
gap (the agent's head carries `question`, see
[agentPhrase.ts](../../../packages/engine/src/languages/en/agentPhrase.ts)), write the terminus
complement between the two and drop it from `trailingComplements`. Under rule 2, move the whole
complements text ahead of *by* instead.
[renderClause.ts](../../../packages/engine/src/languages/en/renderClause.ts) already closes up the
double space the empty stand-in leaves.

Pinned by `known bugs: an English passive agent question strands by ahead of the recipient (A282)` in
[questions.test.ts](../../../packages/engine/test/questions.test.ts).

Found by the P09-E16 coverage audit on 2026-09-24.

## Resolved

Fixed 2026-09-24 under **rule 1**: *by* strands after the verb's arguments only.
[en/predicateParts.ts](../../../packages/engine/src/languages/en/predicateParts.ts)'s `predicateWords`
now writes the terminus between the participle and the bare *by* when the agent is the question's gap
(`agentPhrase` returns the lone `AGENT_PREP`), and drops it from the trailing complements. An adjunct
keeps the by-phrase's slot after it, so P09-E16 D2's "who is the food eaten by in the house?" is
unchanged, and so is every statement ("the book is given by the man to the child").

- **Tests:** [questions.test.ts](../../../packages/engine/test/questions.test.ts) → *known bugs: an
  English passive agent question strands by ahead of the recipient (A282)*: both pins now pass, plus
  the past, the negative ("who is the book not given to the child by?"), a plural patient, a pronoun
  recipient ("who is the book given to him by?"), and rule 1 with an adjunct ("who is the book given
  to the child by in the house?") beside its statement.
