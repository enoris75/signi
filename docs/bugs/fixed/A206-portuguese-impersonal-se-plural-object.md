# A206. The Portuguese impersonal "se" does not agree with a plural object

**Language:** Portuguese

With a plural noun object, the impersonal *se* is the passive *se*, and the verb agrees with that
noun. [A73](A73-impersonal-se-plural-object.md) fixed exactly this for Italian and Spanish
(*si mangiano i topi*, *se comen los ratones*) and left Portuguese out by name, because its standard
target for a main clause — *comem-se os ratos* — also moves the clitic to the enclitic position,
which was a second change. In a **subordinate** clause Portuguese is proclitic anyway, so the clitic
does not move and the agreement is the only thing missing: *um lugar onde se **fazem** frases*.

Found authoring [A23](../../localization/done/A23-ui-nouns-patient-and-place.md), whose CANVAS gloss
is a relative clause with a generic subject and a bare plural object. Italian and Spanish agree it;
Portuguese does not.

| Plan | Now | Want |
|---|---|---|
| CANVAS's definition, `whereGloss('PLACE', 'MAKE', 'PHRASE')` | `um lugar onde se faz frases` | `um lugar onde se fazem frases` |
| GENERIC_PERSON EAT, MOUSE plural | `se come os ratos.` | `comem-se os ratos.` (or `se comem` in a subordinate clause) |
| object relative on MICE | `os ratos que se come correm.` | `os ratos que se comem correm.` |

Already right: a singular object (`se come o rato`), which agrees in the singular either way.

For comparison, the two languages A73 fixed, on the same plan:

| | it | es | pt |
|---|---|---|---|
| CANVAS | un luogo dove si **fanno** frasi | un lugar donde se **hacen** frases | um lugar onde se **faz** frases |

## Shape of the fix

The Italian and Spanish shape, in the Portuguese engine: when the subject is generic and the direct
object is a plural noun phrase (not a clitic), or the relative's gapped head is plural, conjugate
the finite element in the 3pl. A73's two call sites have Portuguese counterparts —
`languages/pt/predicateText.ts` (the finite verb, conjugated against `subjectForms`) and
`languages/pt/relativeText.ts` (the relative's own subject).

**The clitic position is a separate question and is not part of this bug.** In a main clause
standard Portuguese writes *fazem-se frases*, enclitic; in a subordinate or relative clause, and
after a negation or an adverb, it is proclitic (*onde se fazem*), which is where the definitions put
it. Fixing the agreement alone makes every definition right and leaves the main-clause position
where it already is; moving the clitic would be its own defect, with its own triggers.

## Coverage

The CANVAS row above is pinned in
[`e2e/definition-tooltip.spec.ts`](../../../e2e/definition-tooltip.spec.ts) in English and French
only, so no test asserts the wrong Portuguese. A fix wants the clause rows in
`packages/engine/test/relative.test.ts` beside A73's Italian and Spanish ones.

## Resolved

**2026-09-22**, found again while building the headless relative gloss (localization C23), whose
plural antecedent read *que se salvou*. The Italian and Spanish shape, in the Portuguese engine, and
no more:

- [`pt/predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts) — a generic
  subject with a plural noun object (not a clitic, not the object of a verb that takes it with a
  preposition) conjugates every finite element against a 3pl agreement: the plain verb, a mood form,
  the compound tense's auxiliary and a modal chain.
- [`pt/withRelative.ts`](../../../packages/engine/src/languages/pt/withRelative.ts) — an object
  relative whose plural head is gapped as that patient agrees the same way.

**The clitic position was left alone, as the file rules.** A main clause still reads *se comem os
ratos*, the agreement right and the proclitic where it was; *comem-se* is a separate question.

| | |
|---|---|
| **Tests** | `relative.test.ts` → *known bugs: the Portuguese impersonal se and a plural object (A206)*, the `test.fails` now passing, plus three added cases: a main clause in the present, past and under a modal; an object relative in the simple and the compound tense; a clitic and a singular object staying impersonal. Colocated: `pt/predicateText.test.ts`, `pt/withRelative.test.ts`. CANVAS's row in `sweep-definitions.test.ts` now reads *um lugar onde se fazem frases* |
