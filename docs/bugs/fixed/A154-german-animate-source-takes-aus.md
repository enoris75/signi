# A154. A German source that is a person or an animal takes "aus"

**Language:** German

German marks every `source` with `aus` + dative. `aus` means "out of" an enclosure. That is right for a
house or a continent (`aus dem Haus`, `aus Afrika`), but a person or an animal is not something one comes
out of. A living source takes `von`, which fuses to `vom` before `dem`:

| Clause | Now | Want |
|---|---|---|
| CAT COME, source the CHILD | `der Kater kommt aus dem Kind.` | `der Kater kommt vom Kind.` |
| CAT COME, source the WOMAN | `der Kater kommt aus der Frau.` | `der Kater kommt von der Frau.` |
| CAT RUN, source the DOGs | `der Kater läuft aus den Hunden.` | `der Kater läuft von den Hunden.` |
| few GOOD OXen CAN not GO, source that less WHOLE COLD ANGEL | `wenige gute Ochsen können aus jenem weniger ganzen kalten Engel nicht gehen.` | `wenige gute Ochsen können von jenem weniger ganzen kalten Engel nicht gehen.` |
| relative: the MAN the DOG GOes from | `der Mann, aus dem der Hund geht, läuft.` | `der Mann, von dem der Hund geht, läuft.` |

It applies to every verb that licenses a source, including the transitive ones (`verschiebt das Buch aus
dem Kind`). The direction side is already right: `zu` fits any goal (`zum Kind`, `zum Haus`).

Found by reviewing the random phrase "few good oxen cannot go from that less whole cold angel".

## Shape of the fix

In [`de/complementsPhrase/complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts),
the source branch is `prepDet('aus', f, 'dat', plural)`. Pick `von` when `f['animate'] === '1'`.
`prepDet` fuses `zu`/`in` with `dem`. It needs `von` + `dem` → `vom` as well, for a definite article
only, as [`possessorText.ts`](../../../packages/engine/src/languages/de/possessorText.ts) already does
(`vom Kind`). The relativizer stand-in (`definiteness === 'relative'`) goes through the same branch, so
it becomes `von dem`.

Expect one passing test to change: `complements/source.test.ts` pins the A8 weak masculine as
`der Kater kommt aus dem Jungen.`, which becomes `vom Jungen`.

Out of scope: a surface is also no enclosure (`der Kater springt aus der Wand`, where `von der Wand` is
right, and `aus dem Markt`, where `vom Markt` is more natural). The corpus does not mark containers, so
that part needs a new noun feature.

| | |
|---|---|
| **Test** | `complements/source.test.ts` → *known bugs: German animate source takes "aus"* (2 `test.fails`, plus a regression test that a place keeps `aus`) |

## Resolved

Fixed on 2026-09-20. The source branch of
[`de/complementsPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
picks 'von' when the conjunct's head is animate and keeps 'aus' otherwise, and
[`prepDet`](../../../packages/engine/src/languages/de/prepDet.ts) gained the von+dem → vom fusion,
for a definite article only, as `possessorText` already had it. The relativizer stand-in goes through
the same branch, so it becomes 'von dem'.

A surface is still no enclosure ('springt aus der Wand'), which needs a noun feature the corpus does
not carry — out of scope, as the file has it.

Guarded by `complements/source.test.ts` → *known bugs: German animate source takes 'aus'*: both
former `test.fails` now pass, plus every determiner and an adjective through the fusion, and a
transitive verb that licenses a source; the regression that a place keeps 'aus' is unchanged.
`prepDet.test.ts` pins the fusion and the pairs that do not contract.

Expected re-record: A8's weak-masculine source was pinned as 'aus dem Jungen' and is now 'vom
Jungen' — the -n it pins is unchanged.
