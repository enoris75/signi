# C16. UI strings — the possessive pronoun on a pointed-to owner's line

**Kind:** hardcoded UI string. Once unblocked it becomes a rendered possessive, driven by the
[`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Was blocked on:** **agreement with a value known only at render time.** When a noun's possessor
points to another noun ("the boy and **his** horse"), the canvas draws a dashed line to that noun
with a chip naming the pronoun the link will render.

The English form depends only on the antecedent. That is a finite set, so
[A15](A15-ui-slot-scoped-commands.md)'s one-key-per-value workaround covered English — and shipped,
as `pronoun.possessive.*`. The Romance languages and German also agree the possessive with the
**possessed** noun, whose gender is a per-language lexical fact: fr *son* / *sa* / *ses*, it *il
suo* / *la sua*, pt *o seu* / *a sua*, es *su* / *sus*, de *sein* / *seine* (and case). A catalog
entry renders once at boot without arguments ([C14](C14-ui-runtime-values.md)), so it could not
supply the word: cited on the grammar noun NOUN it said "suo" whatever was possessed.

## Strings

| literal | where | value |
|---|---|---|
| my · your · his · her · its · our · their (chip on the dashed line) | [`possessiveHintKey`](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx) in [possessionEdges.ts](../../../packages/frontend/src/components/PhraseBuilder/functions/possessionEdges.ts), drawn by [OwnerRings.tsx](../../../packages/frontend/src/components/PhraseBuilder/OwnerRings.tsx) | the antecedent's person, number and gender, plus the possessed noun's gender and number (and in German, case) in the UI language |
| the same word in the possessor control's tooltip, Possessor: boy (“**his**”) — click to remove | [decoratePerimeterControls.ts](../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts) | as above. The rest of that tooltip shipped with [C12](C12-ui-purpose-and-object-complements.md) |

## Done

**2026-09-21.** Took **option 1**: the chip shows the **possessed noun phrase** the link will
render — "his horse", fr *son cheval*, de *sein Pferd* — rather than the bare possessive. Showing
the whole phrase sidesteps the agreement by letting the engine do it, and keeps what the chip is
for.

| possessed | antecedent | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| DOG (masc in it) | boy, 3sg masc | his dog | il suo cane | son chien | sein Hund | su perro | 彼の犬 | o seu cão |
| HOUSE (**fem** in it/fr/es/pt) | boy, 3sg masc | his house | **la sua** casa | **sa** maison | sein Haus | su casa | 彼の家 | a sua casa |

The second row is the whole point: the antecedent is the same boy, and Italian and French change
the word because the *possessed* noun did. The old chip said "suo" for both.

### How it renders on request

C14 had listed on-request rendering as its option 1 and not built it; this is that, in the one
place that needs it. [`usePossessivePhrases`](../../../packages/frontend/src/i18n/usePossessivePhrase.ts)
takes the (noun, antecedent) pairs a canvas needs and renders each as a bare noun phrase through
the `/api/translate` route the app already has — one call per distinct pair, cached forever, since
a render depends only on the plan and the lexicon. `PhraseBuilder` collects the pairs with
[`possessiveRequests`](../../../packages/frontend/src/components/PhraseBuilder/functions/possessiveRequests.ts)
and hands the lookup to both surfaces, the chip and the control's tooltip.

It did **not** become a catalog entry kind. A plan with a slot in it is what C14's option 1
described, and nothing here needs one: the phrase is an ordinary plan the frontend already knows
how to build, and the translate route already renders arbitrary plans live. What was missing was
only the decision to call it.

### `possessiveHintEn` stayed, as the fallback

This file said to delete it "once nothing reads it". Something does: until the render comes back —
one request, the first time a link is drawn — the chip and the tooltip show the catalog's bare
`pronoun.possessive.*`, which is right in English, German and Japanese and approximate in the
Romance languages, and never blank. That is the same graceful degradation every catalog entry's
`fallback` provides, so the key-per-value table earns its keep as the thing shown while the exact
answer is in flight.

### Not carried into the phrase

The chip renders the possessed noun in the singular, whatever number the canvas has set on it: a
`PointerSpot` carries the noun's concept, not its number. "his horses" would be the honest chip for
a plural possessed noun, and adding the number is a one-field change if it is ever wanted — the
agreement it would affect (it "i suoi cavalli") is already correct in the sentence itself.

## Tests that selected on these literals

`his` on the chip → `PhraseBuilder.test.tsx`, `e2e/possessor-reference.spec.ts`; `(“his”)` in the
tooltip → `PhraseBuilder.test.tsx`, `functions/decoratePerimeterControls.test.ts`; the chip's
pronoun → `functions/possessionEdges.test.ts`; `possessiveHintEn` itself →
`CorefPickContext.test.tsx`. The e2e spec now proves the agreement end to end, with a feminine
possessed noun: *il ragazzo vede **la sua casa***.
