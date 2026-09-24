# A349. A French coordinated address resumes itself with *vous*

**Languages:** French

French resumes a coordinated subject that holds a pronoun with its plural clitic: *toi et moi, nous
courons* ([fr/subjectText.ts](../../../packages/engine/src/languages/fr/subjectText.ts)). The vocative
is rendered through the same text, so a coordinated address holding the 2nd person gains a
resumption of its own. A command has no subject for it to resume, and a statement writes its subject
*vous* again after it.

| Case | Now | Want |
|---|---|---|
| imperative, you all RUN, address {SECOND_PERSON and MOM} | `Toi et Maman, vous, courez.` | `Toi et Maman, courez.` |
| … address {MOM and SECOND_PERSON} | `Maman et toi, vous, courez.` | `Maman et toi, courez.` |
| … negated | `Toi et Maman, vous, ne courez pas.` | `Toi et Maman, ne courez pas.` |
| … you all EAT the FOOD | `Toi et Maman, vous, mangez la nourriture.` | `Toi et Maman, mangez la nourriture.` |
| statement, you all RUN, same address | `Toi et Maman, vous, vous courez.` | `Toi et Maman, vous courez.` |

**Already right.** The other six (`You and Mom, run.`, `Tu e mamma, correte.`, `Du und Mama, lauft.`,
`Tú y Mamá, corred.`, `あなたとお母さん、走ってください。`, `Você e Mamãe, corram.`). A French address with no
pronoun (`Maman et Papa, courez.`) or a single one (`Toi, cours.`, `Vous, courez.`).

## Shape of the fix

The address is resolved by [resolveAddress.ts](../../../packages/engine/src/translator/functions/resolveAddress.ts)
and rendered in [fr/renderClause.ts](../../../packages/engine/src/languages/fr/renderClause.ts). It
should write the group without `subjectText`'s resumption (the conjuncts and the conjunction only);
the resumption belongs to a subject.

| | |
|---|---|
| **Test** | `address.test.ts` → *known bugs: a French coordinated address resumes itself with vous (A349)* (3 `test.fails`: the command in both orders, negated and with an object, the statement; plus a regression test for the other six and a French address with no pronoun or a single one) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. [fr/subjectText.ts](../../../packages/engine/src/languages/fr/subjectText.ts) takes a
`resume` flag (default true), and [fr/renderClause.ts](../../../packages/engine/src/languages/fr/renderClause.ts)
passes false for a verbless period, which is how the vocative is rendered: the resumptive *nous* /
*vous* belongs to a clause, so the address writes the group alone (*Toi et Maman, courez.*, *Toi et
Maman, vous courez.*). `resolveAddress.ts` is unchanged. A coordinated pronoun subject keeps its
resumption (*toi et Maman, vous courez.*); a bare verbless group now reads *toi et Maman.* (was
*toi et Maman, vous.*).

The three `test.fails` in [address.test.ts](../../../packages/engine/test/address.test.ts) (*known
bugs: a French coordinated address resumes itself with vous (A349)*) are plain tests now, assertions
unchanged. Added in the same block: an *or* group, three conjuncts, the group as a verbless period and
as a subject. `fr/subjectText.test.ts` gained *without resume, a 1st or 2nd person group is not
resumed*.
