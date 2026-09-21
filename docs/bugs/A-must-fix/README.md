# A-must-fix — confirmed bugs

Twenty-four open as of 2026-09-21 (A178–A201); everything else catalogued in this class has been fixed
and moved to [`../fixed/`](../fixed/). A194–A201 were found while localizing B48–B51 and C20–C22 —
probing a gloss or a UI string in seven languages is its own defect hunt. Seven of those eight were
reworded around rather than shipped; **A201 is wrong on screen today**, in the coreference chip's
`pronoun.possessive.3sg.neut` (ja それの for その).

A file belongs here when the engine's output is **wrong** — not a simplification it makes on purpose
(that is [`../B-can-fix/`](../B-can-fix/)) and not something that only looks wrong
([`../C-do-not-fix/`](../C-do-not-fix/)). Each one is pinned by a `test.fails` in a `known bugs: …`
block asserting the correct output, so the suite stays green until the fix lands and then reports
"expected to fail but passed". See [the index](../engine-grammar-bugs.md) for the encoding, and the
files already in `fixed/` for the shape: **Languages**, a Now/Want table, what is already right, a
**Shape of the fix**, and the **Test** row naming the pinning block.
