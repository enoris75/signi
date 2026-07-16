# A16. Inanimate terminus is marked with a bare dative

**Language:** German

German dativises an inanimate terminus exactly as it dativises a person, so "save the book to the
container" → `der Kater speichert dem Behälter das Buch` — which reads as *giving the book to the
container*, as though it were a recipient. A goal wants a preposition, not a bare dative.

| | |
|---|---|
| **Want** | Asserted negatively (which preposition — `in` / `an` / `zu` — is verb-dependent, a design call): not `der Kater speichert dem Behälter das Buch.` The other six languages are unaffected — their dative preposition doubles as a goal marker. |
| **Test** | `complements/terminus.test.ts` → *known bugs: terminus* (1 test) |

## Resolved

Fixed 2026-07-16. The German terminus now branches on the goal's animacy, in
[`packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts):

- **`splitDative`** hoists only an *animate* recipient into the pre-object bare-dative slot ("gibt
  dem Hund das Buch"). An inanimate goal is not a recipient, so it stays in `rest` and trails the
  object like any adjunct.
- **The terminus branch of `complementsPhrase`** renders an inanimate goal with the directional
  preposition "in" + the accusative of motion-into ("speichert das Buch in den Behälter"), instead
  of the bare dative that read as *giving the book to the container*. An animate recipient is
  unchanged — still the bare dative. (Which preposition — in / an / zu — is verb-dependent, a design
  call; "in" is the app's into-a-container default.)

So the German terminus *does* vary with animacy, unlike the other six languages whose dative
preposition (to / a / à / …) doubles as a goal marker.

- **Tests:** [`packages/engine/test/complements/terminus.test.ts`](../../../packages/engine/test/complements/terminus.test.ts)
  → *known bugs: terminus*. The pinning `test.fails` (not the bare dative) is now passing, plus an
  added case asserting the concrete forms across the inanimate-goal verbs (`in den Behälter` for
  SAVE/ADD/EXPORT, `in den Markt` for SEND) and a regression guard that an animate recipient keeps
  the bare dative leading the object (`dem Hund das Buch` for SEND and GIVE).
