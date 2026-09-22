# A-must-fix — confirmed bugs

**None open.** Everything catalogued in this class has been fixed and moved to
[`../fixed/`](../fixed/). The last twenty, all filed and fixed on 2026-09-22, went together:
**A207**–**A212** and **A216**–**A229**, found by three rounds of random phrases (a negative word
the Romance negator did not see, an "or" group agreeing with the wrong conjunct, German "kein" and
"nicht" in the wrong place) and by the C23–C28 localization sweep, whose authors met them outside
their own lanes. Four of those were a preposition or a particle that belongs to a noun or a verb,
which a lexeme can now name: German *Ort*'s "an" / "von" (`place_prep`, A218), a Japanese direction
noun's に (`locative_particle`, A220), German GIVE's dative and CONNECT's *mit* (`terminus_dative`,
`terminus_prep`, A223), and Italian's "via" only under a verb with a goal (A228).

A file belongs here when the engine's output is **wrong** — not a simplification it makes on purpose
(that is [`../B-can-fix/`](../B-can-fix/)) and not something that only looks wrong
([`../C-do-not-fix/`](../C-do-not-fix/)). Each one is pinned by a `test.fails` in a `known bugs: …`
block asserting the correct output, so the suite stays green until the fix lands and then reports
"expected to fail but passed". See [the index](../engine-grammar-bugs.md) for the encoding, and the
files already in `fixed/` for the shape: **Languages**, a Now/Want table, what is already right, a
**Shape of the fix**, and the **Test** row naming the pinning block.
