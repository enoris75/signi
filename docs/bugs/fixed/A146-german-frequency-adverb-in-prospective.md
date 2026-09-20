# A146. A German frequency adverb falls inside the prospective's zu-group

**Language:** German

A52 made the prospective the predicate `im Begriff sein` plus a zu-infinitive group, and put the
main verb's adverb into that group. The group is right for a **manner** adverb (`im Begriff, schnell
zu essen`, about to eat quickly). A **frequency** adverb, though, then scopes over the infinitive
alone. With `nie` that inverts the sentence the way `nicht` did before A19: *was about to never
love* in place of *was never about to love*.

| Clause | Now | Want |
|---|---|---|
| that MAN LOVE this ANGEL, past, NEVER | `jener Mann war im Begriff, nie diesen Engel zu lieben.` | `jener Mann war nie im Begriff, diesen Engel zu lieben.` |
| the same, ALWAYS | `jener Mann war im Begriff, immer diesen Engel zu lieben.` | `jener Mann war immer im Begriff, diesen Engel zu lieben.` |
| CAT EAT, ALWAYS | `der Kater ist im Begriff, immer zu essen.` | `der Kater ist immer im Begriff zu essen.` |
| relative: the DOG that EATs the MOUSE, NEVER | `der Hund, der im Begriff ist, nie die Maus zu essen, läuft.` | `der Hund, der nie im Begriff ist, die Maus zu essen, läuft.` |

The other six languages give the adverb the whole prospective: `that man was never about to love
this angel`, `cet homme n'était jamais sur le point d'aimer cet ange`, `esse homem nunca estava
prestes a amar este anjo`, `その男はこの天使を決して愛するところではありませんでした`. (Italian also gets the position
wrong, but not the scope; see A147.)

Found by reviewing the rendered phrase "that man was never about to love this angel".

## Shape of the fix

[`prospectiveFrame.ts`](../../../packages/engine/src/languages/de/prospectiveFrame.ts) already puts
`nicht` and the modals' adverbs ahead of `im Begriff`, because they scope over the whole predicate
(`muss immer im Begriff sein`). A frequency adverb (`subtype: 'frequency'`) on the main verb belongs
in the same slot. A manner adverb stays in the group.

`prospectiveFrame` gets the adverb as text, so the split has to happen in its two callers,
[`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) and
[`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts). Either
pass a frequency adverb ahead of `im Begriff` alongside `modalAdverbs`, or give the frame a new
field for it. The order ahead of `im Begriff` should match the other aspects: `nicht` before a
positive frequency adverb (`ist nicht immer im Begriff`).

Out of scope: a frequency adverb on the main verb **under a modal** (`muss im Begriff sein, nie …
zu lieben`). English reads it as `must never be about to love`, but German `muss nie` means *need
never*, so the target there is a separate judgement.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: German frequency adverb in the prospective* (2 `test.fails`, plus a regression test that the other six already scope the adverb over the prospective) |

## Resolved

Fixed on 2026-09-20.
[`prospectiveFrame`](../../../packages/engine/src/languages/de/prospectiveFrame.ts) gained a
`frequencyAdverb` field, rendered in the slot ahead of 'im Begriff' that `nicht` and the modals'
adverbs already use — so 'nicht' leads a positive one ('ist nicht immer im Begriff'), as the file
asked. Both callers,
[`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) and
[`subordinateClause`](../../../packages/engine/src/languages/de/subordinateClause.ts), do the split:
a `subtype: 'frequency'` adverb on the main verb goes to the new field, a manner adverb stays in the
group. Under a modal the adverb keeps the group, which is what the file put out of scope.

Guarded by `verb.test.ts` → *known bugs: German frequency adverb in the prospective*: both former
`test.fails` now pass, plus 'nicht' leading a positive adverb, a manner adverb staying in the group,
and a modal keeping the old placement. `prospectiveFrame.test.ts` pins the frame's own slot in V2 and
verb-final order.

Expected re-records: `renderClause.test.ts`, `subordinateClause.test.ts` and `objectPronoun.test.ts`
each held one prospective line whose frequency adverb was inside the group.
