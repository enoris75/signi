# C16. UI strings — the possessive pronoun on a pointed-to owner's line

**Kind:** hardcoded UI string. Once unblocked it becomes a rendered possessive, driven by the
[`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** **agreement with a value known only at render time.** When a noun's possessor points
to another noun ("the boy and **his** horse"), the canvas draws a dashed line to that noun with a chip
naming the pronoun the link will render. The chip comes from
[`possessiveHintEn`](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L97),
a fixed English table keyed on the antecedent's person, number and gender. It shows "his" whatever
the UI language.

The English form depends only on the antecedent. That is a finite set, so
[A15](../done/A15-ui-slot-scoped-commands.md)'s one-key-per-value workaround would cover English. The
Romance languages and German also agree the possessive with the **possessed** noun, whose gender is a
per-language lexical fact: fr *son* / *sa* / *ses*, it *il suo* / *la sua*, pt *o seu* / *a sua*,
es *su* / *sus*, de *sein* / *seine* (and case). A catalog entry renders once at boot without
arguments ([C14](../done/C14-ui-runtime-values.md)), so it can't supply the word. These forms illustrate the
agreement; they are not engine renders.

## Strings

| literal | where | value |
|---|---|---|
| my · your · his · her · its · our · their (chip on the dashed line) | built by [`possessiveHintEn`](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L97) in [possessionEdges.ts:67](../../../packages/frontend/src/components/PhraseBuilder/functions/possessionEdges.ts#L67), drawn by [OwnerRings.tsx:70](../../../packages/frontend/src/components/PhraseBuilder/OwnerRings.tsx#L70) | the antecedent's person, number and gender, plus the possessed noun's gender and number (and in German, case) in the UI language |
| the same word in the possessor control's tooltip, Possessor: boy (“**his**”) — click to remove | [decoratePerimeterControls.ts:67](../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L67) | as above. The rest of that tooltip shipped with [C12](../done/C12-ui-purpose-and-object-complements.md): the antecedent's word is in the UI language now, and "click to remove" is a catalog entry. The chip reads `pronoun.possessive.*`, which is right only for the antecedent-driven languages |

## To unblock (pick one)

1. **Render the possessed noun phrase live.** The link already is a plan fragment: the possessed noun
   with a pronominal possessor. Render that noun phrase in the UI language and show it on the chip:
   "his horse", fr *son cheval*, de *sein Pferd*. Showing the whole phrase rather than the bare
   pronoun sidesteps agreement, and keeps what the chip is for. It needs on-request rendering
   ([C14](../done/C14-ui-runtime-values.md) option 1, which C14 did not build: it kept its values
   outside the phrase), or the chip can read the phrase out of the translation the panel already
   fetches.
2. **Name the antecedent instead of the pronoun.** Label the chip with the antecedent's word in the UI
   language. That needs no agreement, but the chip then no longer shows which pronoun the link will
   render, which is its whole job. Take this only if option 1 stalls.

Either way, delete `possessiveHintEn` once nothing reads it.

## Tests that select on these literals

`his` on the chip → `PhraseBuilder.test.tsx`, `e2e/possessor-reference.spec.ts`; `(“his”)` in the
tooltip → `PhraseBuilder.test.tsx`, `functions/decoratePerimeterControls.test.ts`; the chip's pronoun →
`functions/possessionEdges.test.ts`; `possessiveHintEn` itself → `CorefPickContext.test.tsx`.
