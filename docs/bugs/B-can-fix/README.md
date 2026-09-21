# B-can-fix — documented simplifications

None open as of 2026-09-21. B5–B7 and B9–B14 were fixed that day after a product decision, like B1–B4
before them, and moved to [`../fixed/`](../fixed/). B8 was re-filed as a bug, A38.

A file belongs here when the engine does something **on purpose** that a fuller grammar would do
differently, and says so in a code comment. It is not a defect ([`../A-must-fix/`](../A-must-fix/)),
and it is not something that only looks wrong ([`../C-do-not-fix/`](../C-do-not-fix/)). Each one is
pinned by a `test.fails` in a `documented simplifications: …` block asserting the fuller target, and
is **not fixed without a product decision**. See [the index](../engine-grammar-bugs.md) for the
encoding.
