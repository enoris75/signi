# A332. English and Italian write *his* / *suo* for a possessor linked to the generic subject

**Languages:** English, Italian

P11-E2's coreferent possessor (`{ kind: 'coreferent', slot: 'subject' }`) is bound to the clause's
subject by `subjectBinding`, which hands the engines an ordinary 3rd-person pronominal possessor with
the subject's person, number and gender. For the generic subject GENERIC_PERSON (*one*, *si*, *on*,
*man*, *se*, 人) that is the wrong possessive in two languages. English says *one's* for a generic
owner: *his* after *one* reads as some man's book. Italian's impersonal *si* binds only *proprio*:
`si vede il suo libro` means *one sees his (or her) book*, someone else's, and `si vede il proprio
libro` is *one sees one's own*. The link is the only thing that knows the owner is the generic
subject. A pronominal possessor with the same features writes the same *his* / *suo* in the same
clause, and there it is right, because the plan names a 3rd person of its own.

| Case | Now | Want |
|---|---|---|
| GENERIC_PERSON SEEs BOOK {possessor: coreferent} (en) | `one sees his book.` | `one sees one's book.` |
| … (it) | `si vede il suo libro.` | `si vede il proprio libro.` |
| GENERIC_PERSON SEEs BOOK {coreferent, possessorOwn} (en) | `one sees his own book.` | `one sees one's own book.` |
| … (it) | `si vede il suo proprio libro.` | `si vede il proprio libro.` |
| GENERIC_PERSON SEEs MOTHER {coreferent} (en, a kin noun) | `one sees his mother.` | `one sees one's mother.` |
| … (it) | `si vede sua madre.` | `si vede la propria madre.` |
| GENERIC_PERSON RUNs with DOG {coreferent} (comitative, en) | `one runs with his dog.` | `one runs with one's dog.` |
| … (it) | `si corre con il suo cane.` | `si corre con il proprio cane.` |

Every Want string was rendered by the engine with the fix sketched below applied to a throwaway copy
of the tree. The engine suite stayed green there (8442 passed, 69 expected fail). *Proprio* already
carries the emphasis of OWN, so the Italian OWN row does not stack a second *proprio*. A kin noun
takes its article back before it (`la propria madre`), as it does before an adjective (`la sua
vecchia madre`).

**Already right.**

- French `on voit son livre.`, German `man sieht sein Buch.`, Japanese `人は自分の本を見ます。`. Their
  generic subject binds the ordinary possessive (and Japanese says 自分の for any link). With OWN:
  `on voit son propre livre.`, `man sieht sein eigenes Buch.`, `人は自分自身の本を見ます。`.
- Spanish `se ve su libro.` and Portuguese `se vê o seu livro.` are accepted as right. Unlike
  Italian's *si*, their impersonal *se* can bind the ordinary possessive (*se vive mejor en su casa*,
  *quando se ama o seu país*), so *su* / *seu* is not a disjoint reference. *El propio libro* / *o
  próprio livro* would be emphatic, which is what OWN already writes (`se ve su propio libro.`, `se vê
  o seu próprio livro.`).
- A pronominal possessor under the generic subject keeps `one sees his book.` / `si vede il suo
  libro.`. The plan names a 3rd-person owner there, so it is not the subject.
- The subject question `who sees his book?` (`questionRole: 'subject'` over GENERIC_PERSON) is
  unchanged by the trial fix: the wh-word is not the generic subject.

**Found by** the P11-E2 coverage audit, which probed the link under every subject type.

## Shape of the fix

The site is `subjectBinding` in
[bindCoreferents.ts](../../../packages/engine/src/translator/functions/bindCoreferents.ts), where the
link binds. When the subject's agreement is generic (`agreement['generic'] === '1'`), the
`BoundPossessor` should say so, e.g. a `generic: true` beside `human` and `own` in
[types.ts](../../../packages/engine/src/types.ts). The trial then changed three spellings:

- `possessiveEn` in [possessive.ts](../../../packages/engine/src/possessive.ts) returns `one's` for a
  generic possessor, and `possessiveEnIndependent` returns `one's own`.
- `possessiveIt` returns `proprio` / `propria` / `propri` / `proprie` for one, agreeing with the head
  as `suo` does.
- Italian's article drop before a kin noun (`itPossessedHeadForms`) skips a generic possessor, and
  `resolveNounPhrase` does not add OWN's *proprio* on top of an Italian generic possessor.

The fixer must decide:

- where the Italian no-double-*proprio* rule lives. The trial put a language test in
  `resolveNounPhrase`. The Italian engine could instead drop a `possessor_bound` OWN adjective beside
  a generic possessor.
- whether the independent English form is right as `one's own` (`a book of one's own`). No pinned
  row reaches it, because an indefinite possessed head under a generic subject was not probed.
- whether `translatePossessive` (the link's label in the builder) should cite the generic form too.

| | |
|---|---|
| **Test** | `coreference.test.ts` → *known bugs: english and italian write his / suo for a possessor linked to the generic subject (A332)* (4 `test.fails`, each asserting all seven: the plain link, OWN, the kin noun and the comitative, plus a regression test for French, German, Spanish, Portuguese and Japanese, the pronominal possessor and the subject question) |
