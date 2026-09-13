# A73. The Italian and Spanish impersonal si / se does not agree with a plural object

**Language:** Italian, Spanish

With a plural noun object, the impersonal si / se is the passive si / se, and the verb agrees with the object (`si mangiano i topi`, `se comen los ratones`). Both engines conjugate against the GENERIC_PERSON subject (3rd singular). Portuguese is left out: its standard target (`comem-se os ratos`) also moves the clitic.

## Italian

When `si` takes a plural noun object, standard Italian reads it as the passive `si` (*si
passivante*), and the verb agrees with that noun: `si mangiano i topi`, `si vendono case`. The
singular (`si mangia i topi`) is colloquial and regional, and grammars mark it as nonstandard.
Both `predicateText` (`languages/it/predicateText.ts`: `finite` conjugates against
`subjectForms`) and `relativeText` (`languages/it/relativeText.ts`: `agreeForms` is the
relative's own subject) conjugate against GENERIC_PERSON, which the corpus seeds as 3sg. So the
verb stays singular whatever its patient. In an object relative, the gapped head is the patient
(`i topi che si mangiano`).

| Clause | Now | Want |
|---|---|---|
| EAT + MICE | `si mangia i topi.` | `si mangiano i topi.` |
| EAT + MICE, past | `si mangiò i topi.` | `si mangiarono i topi.` |
| MUST + EAT + MICE | `si deve mangiare i topi.` | `si devono mangiare i topi.` |
| object relative on MICE | `i topi che si mangia corrono.` | `i topi che si mangiano corrono.` |

Already right: a singular object (`si mangia il topo`). A clitic object keeps `si` impersonal and
the verb singular (`li si mangia`; the clitic order is a separate defect).

### Shape of the fix

When the subject is generic, and the direct object is a plural noun phrase (not a clitic) or the
relative's gapped head is plural, conjugate the finite element (the verb or the outermost modal)
in the 3pl. In the compound tense this becomes `si sono mangiati i topi`, which needs the
auxiliary defect fixed first. A coordinated singular object (`si mangiano il topo e il cibo`)
follows the same rule but is not pinned.

## Spanish

| Clause | Now | Want |
|---|---|---|
| GENERIC_PERSON EAT, MOUSE plural | `se come los ratones.` | `se comen los ratones.` |

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: Italian impersonal si with a plural object*; `verb.test.ts` → *known bugs: Spanish impersonal se with a plural object* (2 `test.fails`) |
