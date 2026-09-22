# A-must-fix — confirmed bugs

**Seven open, all filed 2026-09-22.** Two came from authoring the localization sweep (A23–A30,
B52–B58): **A206**, the Portuguese impersonal *se* that does not agree with a plural object, and
**A207**, the French mass partitive on a bare singular *count* object. Both were found the same way
— a gloss renders a bare object under a generic subject in all seven languages at once, so a rule
that is right for one noun class and wrong for another shows up side by side. **A208** came from a
random phrase: a negative complement does not negate a Spanish or Portuguese command, instruction or
infinitive. **A209–A212** came from a second round once the generator coordinated noun groups: German
"kein" inside the prospective, an "or" group agreeing with its last conjunct after the verb (English
and German), a German group of animals eating with "essen", and a coordinated pronoun object kept
behind "nicht".

Everything else catalogued in this class has been fixed and moved to [`../fixed/`](../fixed/). The
last three went together — **A203**, the half of A197 that run deliberately left (the five
adposition-bearing complements whose pronoun rendered as a noun, each needing its own adposition
and, in German, its own case), **A205**, the feminine plural tonic pronoun the same run turned up
(`avec eux` for `avec elles`), and **A204**, filed separately while localizing.

A file belongs here when the engine's output is **wrong** — not a simplification it makes on purpose
(that is [`../B-can-fix/`](../B-can-fix/)) and not something that only looks wrong
([`../C-do-not-fix/`](../C-do-not-fix/)). Each one is pinned by a `test.fails` in a `known bugs: …`
block asserting the correct output, so the suite stays green until the fix lands and then reports
"expected to fail but passed". See [the index](../engine-grammar-bugs.md) for the encoding, and the
files already in `fixed/` for the shape: **Languages**, a Now/Want table, what is already right, a
**Shape of the fix**, and the **Test** row naming the pinning block.
