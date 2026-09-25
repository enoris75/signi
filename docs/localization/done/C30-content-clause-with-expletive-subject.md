# C30. SHOULD and MIGHT — "it is right / possible that one acts" needs the act as a subject

**Kind:** was blocked on a construct. Two P09 modals whose meaning is a judgment **about the act**,
not a property of the one who acts. MUST, CAN, WILL and MAY ship on the C09 shape "to be obliged /
able / allowed to act", where the adjective is said of the actor; *right* and *possible* are said of
the action, and no plan could make an action a subject.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/Z-Done/P09-core-vocabulary/README.md)
§3, **E4** (content clauses). Both words are seeded by [B63](B63-modal-verbs-may-should-might.md),
which probes every lead; this ticket owned their glosses. **Done** on 2026-09-22: the content clause
shipped and both are glossed; see [Done](#done).)_

## The concepts

| concept | seeded by | the gloss it waited for |
|---|---|---|
| SHOULD | B63 | it is right that one acts |
| MIGHT | B63 | it is possible that one acts — not "to be able to act", which is CAN's gloss character for character |

## Was blocked on: a content clause as the subject — resolved

Probed 2026-09-22, engine source at HEAD, RIGHT_CORRECT and POSSIBLE seeded in memory with an
`infinitive_link`:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BE + RIGHT_CORRECT + ACT | to be right to act. | essere giusto di agire. | être juste d'agir. | richtig sein, zu handeln. | ser correcto de actuar. | 行動することが正しい。 | ser certo de agir. |
| BE + POSSIBLE + ACT | to be possible to act. | essere possibile di agire. | être possible d'agir. | möglich sein, zu handeln. | ser posible de actuar. | 行動することがありうるである。 | ser possível de agir. |
| BE + OBLIGED at `less` + ACT | to be less obliged to act. | essere meno obbligato ad agire. | être moins obligé d'agir. | weniger verpflichtet sein, zu handeln. | estar menos obligado a actuar. | 行動することがそれほど義務的ではない。 | estar menos obrigado a agir. |

The infinitive complement is controlled by the subject, so *giusto*, *juste*, *richtig*, *correcto*
and *certo* were said of the one who acts ("the person is right to act") — wrong in five languages.
Only Japanese read right, because its こと clause is already the adjective's subject.

## Done

**2026-09-22.** `PhrasePlan.contentSubject` — a finite clause standing where the subject would. The
plan's own `subject` is not rendered when it is present; it is the throwaway a subjectless clause
carries, as an infinitive citation's is. What agrees with the slot agrees with a **clause**: 3rd
singular, masculine where the language genders a predicate adjective, which is what makes it "è
giusto" and not the "è giusta" the throwaway noun would have given.

Each language does its own thing with it, and every one of those things already had a name:

- **en, fr, de** write an **expletive** in the slot the clause left — *it*, *il*, *es* — and
  extrapose the clause behind the predicate, under *that* / *que* / *dass*; German's is verb-final
  behind a comma, as every subordinate clause is.
- **it, es, pt** write no subject pronoun at all, and put the clause in the **present subjunctive**.
- **ja** leaves it where it is: nominalized with こと and marked が, it really is the subject, so
  there is no expletive and nothing to extrapose.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **SHOULD**: it is right that one acts | it is right that one acts. | è giusto che si agisca. | il est juste qu'on agisse. | es ist richtig, dass man handelt. | es correcto que se actúe. | 行動することが正しいです。 | é certo que se aja. |
| **MIGHT**: it is possible that one acts | it is possible that one acts. | è possibile che si agisca. | il est possible qu'on agisse. | es ist möglich, dass man handelt. | es posible que se actúe. | 行動することが起こり得ます。 | é possível que se aja. |
| it is right that the cat eats the food | it is right that the cat eats the food. | è giusto che il gatto mangi il cibo. | il est juste que le chat mange la nourriture. | es ist richtig, dass der Kater das Essen frisst. | es correcto que el gato coma la comida. | 猫が食べ物を食べることが正しいです。 | é certo que o gato coma a comida. |
| it is good that one acts | it is good that one acts. | è buono che si agisca. | il est bon qu'on agisse. | es ist gut, dass man handelt. | es bueno que se actúe. | 行動することが良いです。 | é bom que se aja. |

What landed differently from the plan:

1. **The present subjunctive was Spanish and Portuguese only, and is now Romance-wide.** The mood
   existed but two languages had no forms. Both derive from a present the lexicon already stores, so
   no paradigm was seeded: **Italian** from the 1st singular (agisco → agisca, faccio → faccia, dico
   → dica), **French** from the 3rd plural (agissent → agisse, courent → coure) — in each case the
   form that carries the irregular stem — with a short override list for the verbs whose stored form
   does not (essere, avere, dovere; être, avoir, aller, pouvoir, faire, savoir, vouloir). An -iare
   verb writes one i, not two: *mangi*, not *mangii*.
2. **POSSIBLE was seeded, and its Japanese is not ABLE's.** 可能な is ABLE's word, and a gloss that
   used it would have made MIGHT and CAN the same sentence in Japanese — which is exactly what this
   ticket was filed to avoid. POSSIBLE takes 起こり得る, said of the act coming about; it is 得る, an
   ichidan verb, so the predicate inflects as a **verb** and not through the copula (`ja_verbal`,
   which reuses the `ru` adjective class [C33](C33-degree-adverbs-on-adjectives.md) built).
3. **EVEN's gloss, which this file was also holding, never needed it.** [C39](C39-focus-particle-on-a-noun-phrase.md)
   made EVEN a focus **value** rather than a concept, and a value has no tooltip.
4. **The other slice of E4 is still open.** The "say *that* …" **object** clause — which would serve
   SAY, THINK, BELIEVE and TELL beyond their glosses — is a different slot and a different
   construct; `contentSubject` is the subject's alone.

Pinned in [`content-clause.test.ts`](../../../packages/engine/test/content-clause.test.ts), including
that MIGHT and CAN do not say the same thing.
