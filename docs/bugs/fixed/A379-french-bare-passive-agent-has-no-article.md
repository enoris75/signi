# A379. French writes a bare passive agent with no article

**Language:** French

A bare plural or bare mass passive agent keeps no article in French: "la nourriture est mangée par
chats". French cannot leave a count plural or a mass noun bare after *par*; it takes *des* / *de l'*.
Every other complement already does ("avec des chiens", "à des enfants", "dans des maisons"), and so
does a bare object (`objectArtFor`, A149). The indefinite plural agent is right, "par des chats".

| Case | Now | Want |
|---|---|---|
| the FOOD is EATen by CAT (bare, plural) | `la nourriture est mangée par chats.` | `la nourriture est mangée par des chats.` |
| past | `la nourriture fut mangée par chats.` | `la nourriture fut mangée par des chats.` |
| the BOOK is MOVEd by WATER (bare) | `le livre est déplacé par eau.` | `le livre est déplacé par de l'eau.` |

The **Want** column is written by hand.

**Already right.** Italian, Spanish and Portuguese leave the agent bare, which they allow: *da gatti*,
*por gatos*. English and German: `by cats`, `von Katern`.

**Found by** the A376 lane (2026-09-25). A376 changed only the subject slot, so the agent was not its to fix.

| | |
|---|---|
| **Test** | `voice.test.ts` → *known bugs: French writes a bare passive agent with no article (A379)* (1 `test.fails`; plus a regression test for the indefinite agent, the other languages and a bare comitative) |

## Resolved

2026-09-25. French [agentPhrase.ts](../../../packages/engine/src/languages/fr/agentPhrase.ts) writes a
noun agent through the direct object's `objectNpText` (never negated) in place of `npText`, so a bare
agent takes the object's partitive: `par des chats`, `par de l'eau`, `par des femmes`, `par des chats et
des chiens`, and *de* before a prenominal adjective as the object has it (`par de grands chats`). A
definite, quantified or pronoun agent is unchanged (`par le chat`, `par quelques chats`, `par moi`); the
other languages keep their bare agent.

Guarded by `voice.test.ts` → *known bugs: French writes a bare passive agent with no article (A379)*:
the former `test.fails`, now a plain test, a new test for a feminine, coordinated and adjective-led
agent, a definite / quantified / pronoun regression, and the original regression. `fr/agentPhrase` has no
colocated test file.
