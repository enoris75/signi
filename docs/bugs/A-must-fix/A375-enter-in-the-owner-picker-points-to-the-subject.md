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
