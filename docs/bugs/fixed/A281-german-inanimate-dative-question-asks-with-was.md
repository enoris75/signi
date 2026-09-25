# A281. A German inanimate dative question asks with *was*

**Languages:** German

German *was* has no dative. A thing asked about in a bare dative slot is asked with *wem*, the only
dative question pronoun there is, or the sentence is rephrased. The engine's
[`questionPronoun`](../../../packages/engine/src/languages/de/questionPronoun.ts) declines *wer* for a
person and returns *was* in every case for a thing. So an inanimate recipient
([P09-E15](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E15-question-over-a-marked-relation.md))
and the inanimate object of a dative verb ([P09-E6](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E6-questions-and-existentials.md))
come out as a nominative or accusative *was*, which reads as the subject or the object.
[A223](../fixed/A223-german-inanimate-terminus-of-give-and-connect.md) fixed the statement ("der Mann gibt
**dem Haus** das Buch"), not the question.

| Case | Now | Want |
|---|---|---|
| what does the MAN GIVE the BOOK to (`terminus`, inanimate) | `was gibt der Mann das Buch?` | `wem gibt der Mann das Buch?` |
| what is the BOOK given to by the WOMAN (passive, `terminus`, inanimate) | `was wird das Buch von der Frau gegeben?` | `wem wird das Buch von der Frau gegeben?` |
| what does the CAT HELP_VERB (`directObject`, inanimate) | `was hilft der Kater?` | `wem hilft der Kater?` |

**Why this target.** "was gibt der Mann das Buch?" is ungrammatical: it has two accusatives and no
dative. "was hilft der Kater?" reads as *what helps the cat?* with the roles swapped. Each Want is the
string the engine already renders for the animate question, and the fix below yields all three.
It was verified by applying it to a throwaway copy of the tree.

**Already right.** The other six languages: en "what does the man give the book to?", it "a che cosa
dà il libro l'uomo?", fr "à quoi est-ce que l'homme donne le livre ?", es "¿a qué da el hombre el
libro?", ja "男は何に本をあげますか？", pt "a que o homem dá o livro?". In German, *was* is right
where the slot is nominative or accusative: "was hilft dem Kater?" and the accusative addressee of
*fragen*, "was fragt der Mann?". The prepositional gaps stay as they are: the *wo(r)-* compound
("womit", "worauf" for FOLLOW) or, where German has none, the preposition over *was* ("dank was",
"zwischen was"). P09-E15 settled those deliberately.

**Shape of the fix.** Keep `questionPronoun` as it is, because "dank was" and "zwischen was" go
through it. In [de/questionWord.ts](../../../packages/engine/src/languages/de/questionWord.ts), return
*wem* in two places. First, for a bare-object gap whose `objectCase(verb)` is dative. Second, for a
terminus gap that renders as a bare *was* while the verb's `terminus_case` is not `acc`. The trial
fix did exactly this, and "was fragt der Mann?", "dank was", "zwischen was" and "womit" came out
unchanged.

**Decision for the fixer:** whether *wem* for a thing is the target, or the engine should refuse
the question or rephrase it. This file takes *wem*, the form German
grammars give as the stand-in for the missing dative of *was*.

The `was` in the passive row comes from this bug. That row's Japanese is [A280](../fixed/A280-japanese-passive-terminus-question-doubles-ni.md).

Pinned by `known bugs: a German inanimate dative question asks with was (A281)` in
[questions.test.ts](../../../packages/engine/test/questions.test.ts).

Found by the P09-E15 coverage audit on 2026-09-24.

## Resolved

Fixed 2026-09-24, taking *wem* as the target. [de/questionWord.ts](../../../packages/engine/src/languages/de/questionWord.ts)
now returns *wem* for a thing in two places: a bare-object gap whose `objectCase(verb)` is dative
("wem hilft der Kater?"), and a terminus gap that renders as a bare *was* while the verb's
`terminus_case` is not `acc` ("wem gibt der Mann das Buch?", "wem wird das Buch von der Frau
gegeben?"). `questionPronoun` is unchanged, so "dank was", "zwischen was", "womit" and fragen's
accusative "was fragt der Mann?" stay as they were.

- **Tests:** [questions.test.ts](../../../packages/engine/test/questions.test.ts) → *known bugs: a
  German inanimate dative question asks with was (A281)*: the three pins now pass, plus the past
  ("wem gab der Mann das Buch?", "wem half der Kater?") and a plural subject ("wem helfen die
  Kater?"), with the other six unchanged. The colocated
  [questionWord.test.ts](../../../packages/engine/src/languages/de/questionWord.test.ts) now asserts
  *wem* for the inanimate dative object (it asserted the bug's *was* before), *wem* for a
  `terminus_dative` recipient, *was* under `terminus_case: 'acc'`, and the *wo(r)-* compound for a
  dative verb's prepositional object.
