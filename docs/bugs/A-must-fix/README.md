# A-must-fix — confirmed bugs

Three open as of 2026-09-22 (A203–A205); everything else catalogued in this class has been fixed
and moved to [`../fixed/`](../fixed/). A194–A202 were fixed in one run on 2026-09-21–22, which is
where two of these three come from: **A203** is the half of A197 that run deliberately left — the
five adposition-bearing complements whose pronoun still renders as a noun, each needing its own
adposition and, in German, its own case — and **A205** is the feminine plural tonic pronoun the same
run turned up (`avec eux` for `avec elles`), which had been standing in the causal adjunct all along.
**A204** was filed separately while localizing. Nothing in the three is wrong on screen today: A203
and A205's slots are plan-only or take no plural pronoun in any shipped string.

A file belongs here when the engine's output is **wrong** — not a simplification it makes on purpose
(that is [`../B-can-fix/`](../B-can-fix/)) and not something that only looks wrong
([`../C-do-not-fix/`](../C-do-not-fix/)). Each one is pinned by a `test.fails` in a `known bugs: …`
block asserting the correct output, so the suite stays green until the fix lands and then reports
"expected to fail but passed". See [the index](../engine-grammar-bugs.md) for the encoding, and the
files already in `fixed/` for the shape: **Languages**, a Now/Want table, what is already right, a
**Shape of the fix**, and the **Test** row naming the pinning block.
