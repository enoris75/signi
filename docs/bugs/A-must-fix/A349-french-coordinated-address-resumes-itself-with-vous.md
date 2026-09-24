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
