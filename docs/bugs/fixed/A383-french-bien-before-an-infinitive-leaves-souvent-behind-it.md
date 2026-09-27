# A383. French puts *bien* before a bare infinitive and leaves *souvent* behind it

**Languages:** French

A bare infinitive with a frequency adverb and a short manner extra (P15) splits the two round the verb.
BIEN takes the place [A155](../fixed/A155-french-bien-after-nonfinite-verb.md) gives it before a
nonfinite verb, and SOUVENT stays behind the verb, where a lone frequency adverb goes. The result is
*bien manger souvent la souris*, which reads as two unrelated adverbs. A modal's infinitive already
keeps the two together, in the frequency-then-manner order: *doit souvent bien manger la souris*
(pinned in `multiple-adverbs.fr.test.ts`).

| Case | Now | Want |
|---|---|---|
| infinitive: EAT the MOUSE, OFTEN + WELL | `bien manger souvent la souris.` | `souvent bien manger la souris.` |
| … WELL + OFTEN (the translator ranks them the same way) | `bien manger souvent la souris.` | `souvent bien manger la souris.` |
| infinitive: EAT the MOUSE, OFTEN alone | `manger souvent la souris.` | unchanged |
| MUST EAT, OFTEN + WELL | `le chat doit souvent bien manger la souris.` | unchanged |

**Found by** P15's follow-ups ("French frequency after an infinitive"), re-probed at aa554c6b.

## Shape of the fix

When the manner extra goes before the infinitive
([verbGroupInfinitiveFr.ts](../../../packages/engine/src/languages/fr/verbGroupInfinitiveFr.ts),
[predicateText.ts](../../../packages/engine/src/languages/fr/predicateText.ts)), bring the frequency
primary with it, ahead of it, as the modal branch does. A lone frequency adverb keeps its place
after the infinitive.

**Decision for the fixer, not pinned:** the command (*mange souvent bien la souris*) keeps both after
the verb, which is grammatical. Leave it.

| | |
|---|---|
| **Test** | `multiple-adverbs.fr.test.ts` → *known bugs: French bien before an infinitive leaves souvent behind it (A383)* (1 `test.fails`, plus a regression test for the lone frequency adverb and the modal) |

## Resolved

**2026-09-27.** [`fr/predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts): where a short manner
extra leads the infinitive, a frequency primary (`frequencyLead`) goes with it, ahead of it, as under
a modal: *souvent bien manger la souris*. A lone frequency adverb keeps its place behind the
infinitive (*manger souvent*), and a negative one stays the negator (*ne jamais bien manger*). The
passive infinitive gets the same order before its participe, *être souvent bien mangée*, and so does
the instruction register, which shares `negateInfinitive`. The command is left as it was (the
decision the file left open).

- **Tests:** [`multiple-adverbs.fr.test.ts`](../../../packages/engine/test/multiple-adverbs.fr.test.ts) → *known bugs:
  French bien before an infinitive leaves souvent behind it (A383)*. The pinning `test.fails` is now a
  passing `test`; added: WELL + OFTEN in the other ranking, the negated infinitive (*ne pas souvent
  bien*, *ne pas encore bien*), a clitic object (*toujours bien me manger*), the passive, and a
  regression for a long manner extra (*manger souvent lentement*) and a negative primary.
