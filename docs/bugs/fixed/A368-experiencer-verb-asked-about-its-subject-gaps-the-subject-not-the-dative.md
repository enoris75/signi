# A368. An experiencer verb asked about its subject gaps the subject, not the dative

**Languages:** Italian, Spanish

When a wh-question asks about the one who likes, the plan gaps the subject
(`questionRole: 'subject'`). Italian *piacere* and Spanish *gustar* turn LIKE round, so the one who
likes is the dative there (localization C34). `resolvePhrase` turns the clause round, but the gap
stays the subject. The question word is written as a subject (*chi*, *quién*). The wordless stand-in
it replaces falls into the dative's slot, where only the preposition is left: *chi piace a?*. The
relative clause already moves its gap to the dative (*il gatto al quale il cane piace*, see
`experiencerRemap`).

| Case | Now | Want |
|---|---|---|
| who likes the dog? | it `chi piace a?` · es `¿quién le gusta a?` | it `a chi piace il cane?` · es `¿a quién le gusta el perro?` |
| who likes the dogs? | it `chi piacciono a?` · es `¿quién le gustan a?` | it `a chi piacciono i cani?` · es `¿a quién le gustan los perros?` |
| who likes me? | it `chi piaccio a?` · es `¿quién le gusto a?` | it `a chi piaccio?` · es `¿a quién le gusto?` |

The thing liked disappears from the Now as well, because the subject slot that should hold it holds
the question word.

**Already right.** English, French, German, Japanese and Portuguese (`who likes me?`, `qui m'aime ?`,
`wer mag mich?`, `誰が私が好きですか？`, `quem gosta de mim?`). A complement question (*dove piace al
gatto il cane?*) and the yes/no question.

## Shape of the fix

The other half of [A367](A367-experiencer-verb-asked-about-its-object-keeps-the-one-who-likes-as-the-subject.md):
move the gap with the slots. The one who likes, gapped as the subject, is the `terminus` gap, and the
thing liked is the subject. Spanish doubles a dative gap with *le*, as its relative clause does
(`gapComplement === 'terminus'` in `es/predicateText.ts`).

| | |
|---|---|
| **Test** | `experiencer-verb.test.ts` → *known bugs: an experiencer verb asked about its subject gaps the subject, not the dative (A368)* (1 `test.fails`: a noun, a plural and a pronoun thing liked; plus a regression test for the five plain transitive languages, a complement question and the yes/no question) |

Found beside A367, 2026-09-24.

## Resolved

2026-09-24. [experiencerGap.ts](../../../packages/engine/src/translator/functions/experiencerGap.ts)
sends a subject gap to `terminus`, and
[resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts) writes no dative
for the one who likes when the dative is the gap. The existing complement-question path renders
*a chi* / *a quién*. [es/renderClause.ts](../../../packages/engine/src/languages/es/renderClause.ts)
now hands a `terminus` gap to `predicateText`, as it already did a `locative` one, so the verb takes
the *le* its relative takes: *¿a quién le gusta el perro?*.

Guarded by `experiencer-verb.test.ts` → *known bugs: an experiencer verb asked about its subject gaps
the subject, not the dative (A368)*: the former `test.fails`, now a plain test, and the regression
test; `experiencerGap.test.ts` for the placement.
