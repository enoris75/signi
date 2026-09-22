# A-must-fix — confirmed bugs

**Twenty open, all filed 2026-09-22.** Two came from authoring the localization sweep (A23–A30,
B52–B58): **A206**, the Portuguese impersonal *se* that does not agree with a plural object — fixed
the same day, with A213 — and **A207**, the French mass partitive on a bare singular *count* object. Both were found the same way
— a gloss renders a bare object under a generic subject in all seven languages at once, so a rule
that is right for one noun class and wrong for another shows up side by side. **A208** came from a
random phrase: a negative complement does not negate a Spanish or Portuguese command, instruction or
infinitive. **A209–A212** came from a second round once the generator coordinated noun groups: German
"kein" inside the prospective, an "or" group agreeing with its last conjunct after the verb (English
and German), a German group of animals eating with "essen", and a coordinated pronoun object kept
behind "nicht". **A216** and **A217** came from a third round, once the generator reached the
subordinate clauses: a `no` possessor that does not negate its clause (Romance and Japanese), and
Japanese HAVE saying an animate possession with ある.

**A218–A229** came from the C23–C28 sweep, the defects its authors met outside their own lanes. Four
are a preposition or a particle that belongs to a noun or a verb and that no lexeme can name yet:
German *Ort* and its kin taking "in" / "aus" for "an" / "von" (**A218**), a Japanese direction noun's
に (**A220**), German GIVE's dative and CONNECT's *mit* (**A223**), and Italian's "via" under a verb
with no goal (**A228**). The rest: French "dans" before a bare noun (**A219**), an Italian or French
place relative ending on a bare copula (**A221**), a modal heading a clause that governs an
infinitive in Japanese, German and English (**A222**), a German dative pronoun behind the object
(**A229**), a Japanese na-adjective before として (**A224**), a German ordinal as a bare predicate
(**A225**), a measure adverbial stripped of any determiner (**A226**), and French *habiter* unelided
(**A227**). Every one was reproduced and given a trial fix on a throwaway copy, which wrote its
**Want** column.

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
