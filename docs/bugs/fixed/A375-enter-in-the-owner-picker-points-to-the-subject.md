# A375. Enter in the owner picker points to the subject

**Area:** frontend (the canvas), all languages

A noun's owner is filled from its possessor control, which draws an empty owner ring whose word
picker takes the owner's noun, and lights up the nouns the owner could point to instead. Typing a
word there and pressing ↵ does not take the word: it builds a *pronominal* possessor on the period's
subject. "cat eats food", owner "dog" + ↵, gives "the cat eats **his** food"; a click on the same row
gives "the cat eats the dog's food". Every other picker takes ↵ as *choose* (`usePickerKeys`).

| Case | Now | Want |
|---|---|---|
| CAT EAT FOOD, the object's owner: type "dog", ↵ | `the cat eats his food.` | `the cat eats the dog's food.` |

Opening the owner from `possessor-ctl-directObject` or from `satellite-directObjectPossessor` does the
same. While the list is open no row is highlighted.

**Reproduced at 1d8f359b**, before P09-E52 put the *whose* mark on the owner's ring, so it is older
than that batch.

**Already right.** A click on the row. Q on the owner's box once it holds a word (P09-E52).

**Found by** the P09-E52 lane (2026-09-25), re-reproduced at c8f098dc.

| | |
|---|---|
| **Test** | `e2e/possessor-reference.spec.ts` → *known bugs: Enter in the owner picker points to the subject (A375)* (1 Playwright `test.fail`; plus the click, which passes) |

## Resolved

**2026-09-25.** Opening a noun's owner does two things at once: it starts the pointing gesture (the
nouns the owner could point to are numbered, see
[`usePickKeys`](../../../packages/frontend/src/keyboard/usePickKeys.ts)) and it draws the owner ring
with its word picker holding the cursor. The pick's keys listen on the window in the capture phase,
ahead of the picker, so ↵ took the walked-to target — the period's subject — before the picker saw
it, and ⇥ walked the targets instead of choosing and moving on.

The fix is in [`packages/frontend/src/keyboard/usePickKeys.ts`](../../../packages/frontend/src/keyboard/usePickKeys.ts):
while a pick is in flight, ↵ and ⇥ pressed in a text field are the field's, so the picker chooses as
every other picker does ([`usePickerKeys`](../../../packages/frontend/src/components/PhraseBuilder/hooks/usePickerKeys.ts)).
The digits and esc stay the pick's, so a noun can still be pointed to by its number from the field.

The highlight half did not reproduce at 0560505b: with "dog" typed, the DOG row already carries
`data-highlighted`. It is pinned now so it stays that way.

- **Tests:**
  - [`e2e/possessor-reference.spec.ts`](../../../e2e/possessor-reference.spec.ts) → *known bugs: Enter
    in the owner picker points to the subject (A375)*. The pinning `test.fail` is now a passing
    `test`. New cases: a row is highlighted while the list is open, and ↵ with the owner opened from
    `satellite-directObjectPossessor`.
  - [`packages/frontend/test/keyboard/usePickKeys.test.tsx`](../../../packages/frontend/test/keyboard/usePickKeys.test.tsx)
    (new): ↵ and ⇥ outside a field still take and walk the targets; inside a field they are left to
    it; a digit and esc from the field are still the pick's.
