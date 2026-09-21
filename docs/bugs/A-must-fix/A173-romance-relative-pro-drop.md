# A173. A pronoun subject in an Italian, Spanish or Portuguese relative clause is not dropped

**Languages:** Italian, Spanish, Portuguese

Italian, Spanish and Portuguese drop a pronoun subject by default, and the verb ending carries the
person. [A40](../fixed/A40-romance-pro-drop-subject-pronoun.md) made the main clause do so (`mangio`,
`como`), along with both halves of a hypothetical and each clause of a coordination. The relative
clause was left out. It still prints its pronoun subject (`il libro che io leggo`, `el libro que yo
leo`), where a native speaker says `il libro che leggo`, `el libro que leo`.

A40's guard lives in each engine's `renderClause`. A relative clause never passes through it. It
builds its own subject text in [`it/relativeText.ts`](../../../packages/engine/src/languages/it/relativeText.ts),
[`es/withRelative.ts`](../../../packages/engine/src/languages/es/withRelative.ts) and
[`pt/withRelative.ts`](../../../packages/engine/src/languages/pt/withRelative.ts), and empties it
only for a subject relative or an impersonal subject.

| Case | Language | Now | Want |
|---|---|---|---|
| the book that I read | Italian | `il libro che io leggo brucia.` | `il libro che leggo brucia.` |
| | Spanish | `el libro que yo leo arde.` | `el libro que leo arde.` |
| | Portuguese | `o livro que eu leio arde.` | `o livro que leio arde.` |
| the book that we read | Italian | `il libro che noi leggiamo brucia.` | `il libro che leggiamo brucia.` |
| | Spanish | `el libro que nosotros leemos arde.` | `el libro que leemos arde.` |
| | Portuguese | `o livro que nós lemos arde.` | `o livro que lemos arde.` |
| the book that you read | Italian | `il libro che tu leggi brucia.` | `il libro che leggi brucia.` |
| | Spanish | `el libro que tú lees arde.` | `el libro que lees arde.` |
| the book that you (pl.) read | Italian | `il libro che voi leggete brucia.` | `il libro che leggete brucia.` |
| | Spanish | `el libro que vosotros leéis arde.` | `el libro que leéis arde.` |
| the book that I read (past) | Italian | `il libro che io lessi brucia.` | `il libro che lessi brucia.` |
| | Spanish | `el libro que yo leí arde.` | `el libro que leí arde.` |
| | Portuguese | `o livro que eu li arde.` | `o livro que li arde.` |
| the house where I eat | Italian | `la casa dove io mangio brucia.` | `la casa dove mangio brucia.` |
| | Spanish | `la casa donde yo como arde.` | `la casa donde como arde.` |
| | Portuguese | `a casa onde eu como arde.` | `a casa onde como arde.` |
| the random phrase | Italian | `… un vecchio sentimento forte che noi spegniamo su …` | `… un vecchio sentimento forte che spegniamo su …` |
| | Spanish | `… un sentimiento viejo y fuerte que nosotros apagamos arriba …` | `… un sentimiento viejo y fuerte que apagamos arriba …` |
| | Portuguese | `… um sentimento velho e alto que nós apagamos para cima …` | `… um sentimento velho e alto que apagamos para cima …` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A noun subject (`il libro che il gatto legge`). A coordinated pronoun subject,
which A40 keeps in the main clause too (`il libro che io e lui leggiamo`). An impersonal subject (`una
cosa che si mangia`). French and German, which are not pro-drop (`le livre que je lis`, `das Buch, das
ich lese`). The main clause in every language.

Found by the random phrase "were the equally brown feelings about to divide an old loud feeling
that we put out up like sharp Europe slowly?" (seed 892057).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above.

In the three relative builders, empty `subjText` for a single pronoun subject as well, exactly where
the impersonal subject is emptied today. `rel.subject.agreement` keeps driving the verb, as it does
for the impersonal subject and for A40's main clause.

**Decision for the fixer: the 3rd person.** The trial drops only a 1st- or 2nd-person pronoun. A
3rd-person pronoun that agrees with the head in number makes the clause read as a subject relative
once it is dropped. `il gatto che lui vede` becomes `il gatto che vede`, which says "the cat that
sees". Portuguese `você` agrees as a 3rd person and has the same problem: `o livro que você mostra`
would become `o livro que mostra`, "the book that shows". The trial keeps the pronoun in these cases.
So does a passing test, `pronoun.test.ts` → *known bugs: Portuguese você agreement* (`o livro que
você mostra arde.`). A relative whose relativizer already marks the gap (`la casa nella quale`,
`dove`) is not ambiguous, and a 3rd-person pronoun there could drop too. Neither the 3rd person nor
`você` is pinned. Two more things to weigh:

- **A number mismatch.** `i gatti che lui vede` → `i gatti che vede` is not ambiguous, because the
  verb's number differs from the head's.
- **Syncretic forms.** In the conditional and the subjunctive, the 1st person singular has the same
  form as the 3rd (`el libro que yo leería` → `que leería`). Dropping `yo` there brings back the
  subject-relative reading. A40 accepted the same syncretism in the main clause (`si corriera`).

**Gotcha: three passing unit tests pin the overt pronoun.** They assert it as correct, and they
change with the fix: [`it/relativeText.test.ts`](../../../packages/engine/src/languages/it/relativeText.test.ts)
(`che io leggo`), [`es/withRelative.test.ts`](../../../packages/engine/src/languages/es/withRelative.test.ts)
(`el libro que yo leo`) and [`pt/withRelative.test.ts`](../../../packages/engine/src/languages/pt/withRelative.test.ts)
(`o livro que eu vejo`). They came from a bulk "add unit tests" commit (f66fb91), which recorded the
behaviour as it stood. The doc comments on the three builders use the same examples and change too.
Nothing else in the suite moves.

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: a pronoun subject in a relative clause* (3 `test.fails`, plus a regression test for the subjects and languages already right) |
