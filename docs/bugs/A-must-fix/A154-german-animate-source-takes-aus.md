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
