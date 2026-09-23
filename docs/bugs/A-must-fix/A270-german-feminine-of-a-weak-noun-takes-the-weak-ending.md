# A270. The German feminine of a weak noun takes the weak ending

**Languages:** German

German STUDENT is a weak masculine (*der Student, den Studenten*, `weak: '1'`) with a feminine of its
own, *Studentin* / *Studentinnen*
([nouns.ts](../../../packages/backend/src/concepts/nouns.ts)).
[`applyNounGender`](../../../packages/engine/src/translator/functions/applyNounGender.ts) swaps in
the feminine forms and sets `gender: 'fem'`, but it leaves `weak` alone. So every oblique singular
passes through [`weakN`](../../../packages/engine/src/languages/de/weakN.ts) and gets the
n-declension's *-en*, on a noun that has none and with the wrong spelling too (*-innen* is the
plural).

| Case | Now | Want |
|---|---|---|
| the MAN SEEs the STUDENT (fem) | `der Mann sieht die Studentinen.` | `der Mann sieht die Studentin.` |
| … a STUDENT (fem) | `der Mann sieht eine Studentinen.` | `der Mann sieht eine Studentin.` |
| the MAN GIVEs the BOOK to the STUDENT (fem) | `der Mann gibt der Studentinen das Buch.` | `der Mann gibt der Studentin das Buch.` |
| the MAN RUNs with the STUDENT (fem) | `der Mann läuft mit der Studentinen.` | `der Mann läuft mit der Studentin.` |
| the MAN SPEAKs about the STUDENT (fem) | `der Mann spricht über die Studentinen.` | `der Mann spricht über die Studentin.` |

**Already right.** The nominative (`die Studentin läuft.`), the genitive (`der Name der
Studentin.`, `einer Studentin`), the plural in every case (`die Studentinnen`, `den Studentinnen`),
the masculine (`dem Studenten`) and the other languages' feminines (`la studentessa`,
`l'étudiante`, `la estudiante`).

**Shape of the fix.** `weak` describes the masculine's declension, so the feminine drops it. Either
`applyNounGender` deletes `forms['weak']` when it applies the feminine, or German's weak paths
(`nounPhrase`, `complementsPhrase`, `possessorText`, `agentPhrase`, `compoundStem`, `genitiveS`) test
the gender as well. The first is one line and covers every path, the compound stem included. STUDENT
is the corpus's only weak noun with a feminine.

**Nothing shipped shows it**: no gloss has a feminine STUDENT.

Pinned by `known bugs: the German feminine of a weak noun takes the weak ending (A270)` in
[everyday-nouns.test.ts](../../../packages/engine/test/everyday-nouns.test.ts).

Found by P09-E12 while its tasks were being written.
