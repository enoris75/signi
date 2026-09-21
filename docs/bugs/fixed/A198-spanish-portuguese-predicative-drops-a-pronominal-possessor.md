# A198. Spanish and Portuguese drop a pronominal possessor on a predicative

**Languages:** Spanish, Portuguese

A predicate nominal owns things like any other noun phrase: *the dog is **his** possessor*, *il cane
è **il suo** possessore*, *der Hund ist **sein** Besitzer*. Spanish and Portuguese say nothing at
all. The possessive is not misplaced and not mis-agreed — it is simply absent, and the head comes
out with the determiner it would have had on its own: `el perro es **el** poseedor.`, `o cão é **o**
possuidor.` The sentence is well formed and says something else.

Both engines build a noun phrase's possessive in one place and then forget it in another.
[`npText`](../../../packages/engine/src/languages/es/npText.ts) — the path a subject and a direct
object take — calls `nounPhrase(forms, esAdj(np), esPossessiveWord(np))`, and
[`nounPhrase`](../../../packages/engine/src/languages/es/nounPhrase.ts) puts that third argument
where the article would go ("a pronominal possessive replaces the article, whatever determiner was
picked"). The two predicate branches of
[`complementsPhrase`](../../../packages/engine/src/languages/es/complementsPhrase.ts) call the same
`nounPhrase` with **two** arguments and never ask for the possessive:
`nounPhrase(predicativeForms(np.head.forms), esAdj(np))`. Portuguese
([`complementsPhrase`](../../../packages/engine/src/languages/pt/complementsPhrase.ts),
[`ptPossessiveWord`](../../../packages/engine/src/languages/pt/ptPossessiveWord.ts)) has the same
two call sites with the same omission. Nothing else in either engine drops a possessor: the
adjunct complements a few lines below build their head as
`[esPossessiveWord(np), withAdj(word, adj)]`, which is why a locative is right.

An unchosen determiner on a `predicative` defaults to **indefinite**
([`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts)),
so most of these read as an existential (`el perro es un libro.` for "the dog is her book"); an
explicit `definite` gives `el poseedor`. Either way the owner is gone.

| Case | Language | Now | Want |
|---|---|---|---|
| the DOG is `the` POSSESSOR, `his` | Spanish | `el perro es el poseedor.` | `el perro es su poseedor.` |
| | Portuguese | `o cão é o possuidor.` | `o cão é o seu possuidor.` |
| … `my` | Spanish | `el perro es el poseedor.` | `el perro es mi poseedor.` |
| | Portuguese | `o cão é o possuidor.` | `o cão é o meu possuidor.` |
| the DOG is a BOOK, `her` | Spanish | `el perro es un libro.` | `el perro es su libro.` |
| | Portuguese | `o cão é um livro.` | `o cão é o seu livro.` |
| the DOG is a HOUSE (feminine), `our` | Spanish | `el perro es una casa.` | `el perro es nuestra casa.` |
| | Portuguese | `o cão é uma casa.` | `o cão é a nossa casa.` |
| the DOG is BOOKs (plural), `their` | Spanish | `el perro es libros.` | `el perro es sus libros.` |
| | Portuguese | `o cão é livros.` | `o cão é os seus livros.` |
| the DOG becomes `his` POSSESSOR | Spanish | `el perro se vuelve un poseedor.` | `el perro se vuelve su poseedor.` |
| | Portuguese | `o cão se torna um possuidor.` | `o cão se torna o seu possuidor.` |
| the DOG seems `his` POSSESSOR | Spanish | `el perro parece un poseedor.` | `el perro parece su poseedor.` |
| | Portuguese | `o cão parece um possuidor.` | `o cão parece o seu possuidor.` |
| … with a relative clause | Spanish | `el perro es un poseedor que corre.` | `el perro es su poseedor que corre.` |
| | Portuguese | `o cão é um possuidor que corre.` | `o cão é o seu possuidor que corre.` |
| object complement, factitive: TRANSFORM the HOUSE into `his` PRISON | Spanish | `el gato transforma la casa en una prisión.` | `el gato transforma la casa en su prisión.` |
| | Portuguese | `o gato transforma a casa em uma prisão.` | `o gato transforma a casa na sua prisão.` |
| object complement, essive: USE the HOUSE as `his` PRISON | Spanish | `el gato usa la casa como prisión.` | `el gato usa la casa como su prisión.` |
| | Portuguese | `o gato usa a casa como prisão.` | `o gato usa a casa como sua prisão.` |

Every **Want** was rendered by a trial fix applied to HEAD in this worktree and then reverted, not
written by hand.

**Already right.** The other five languages throughout (`the dog is his possessor.`, `il cane è il
suo possessore.`, `le chien est son possesseur.`, `der Hund ist sein Besitzer.`,
犬は彼の所有者です。). The **same noun phrase as a direct object** in Spanish and Portuguese, which is
what makes the loss a slot's and not a word's: `el perro ve su poseedor.`, `o cão vê o seu
possuidor.` A possessive in an adjunct complement, which fuses as it always did (`el perro corre en
su casa.`, `o cão corre na sua casa.`). A possessive on the subject (`su poseedor corre.`, `o seu
possuidor corre.`). A **genitive** possessor on a predicative, which is postnominal and goes through
`possessorText`, not through this argument (`el perro es un poseedor del gato.`). The predicative's
own rules: `predicativeForms`' flattened indefinite plural (`el perro se vuelve gatos.`), a predicate
adjective (`el perro es grande.`), a bare predicate noun (`el perro es una leyenda.`) and the essive's
dropped article (`el gato usa la casa como condición.`).

**How this differs from [A187](A187-pronominal-possessor-drops-the-head-determiner.md).** A187 is the
opposite trade, and in the other six languages: there the possessive *is* rendered and the head's own
determiner (`this`, `some`, `no`, `all`) is thrown away by
[`possessedHeadForms`](../../../packages/engine/src/functions/possessedHeadForms.ts). Here the
determiner survives and the **possessive** is thrown away, in Spanish and Portuguese only, and only
in a predicate slot — `possessedHeadForms` is not on this path at all. The two are independent: A187
reproduces on an A198 row's subject (`su libro arde.` for "this book of hers"), and A198 reproduces on
a plain `definite` head, which A187 lists as already right. Fixing either leaves the other.

**Shipped strings.** None. No entry of [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) and
no concept `definition` puts a pronominal possessor on a `predicative` or an `objectPredicative`, so
nothing on screen is wrong today. The defect is reachable from the phrase builder, which offers the
coreference link on any noun box.

Found by an agent localizing; verified at 80b21ff.

## Shape of the fix

Verified by applying it to HEAD and reverting it. It renders every **Want** above and leaves the
whole suite green: no passing test asserts a Spanish or Portuguese predicate nominal with a
pronominal possessor, so no passing test moves.

Pass the possessive the two predicate branches already have a helper for:

- **Spanish**, both call sites in
  [`complementsPhrase`](../../../packages/engine/src/languages/es/complementsPhrase.ts) (the
  `predicative` noun branch and the `objectPredicative` noun branch):
  `nounPhrase(predicativeForms(np.head.forms), esAdj(np), esPossessiveWord(np))`. `esPossessiveWord`
  is already imported in that file for the adjunct path, and returns `''` for a genitive or absent
  possessor, so the other rows are untouched.
- **Portuguese**, the `predicative` branch the same way with `ptPossessiveWord(np)`.

**Decision for the fixer — the Portuguese object complement.** Its factitive link contracts with the
article (`em` + `a` → `na`), and `ptPossessiveWord(np, withArticle)` exists precisely for that: the
trial takes `ptPossessiveWord(np, false)` and lets the marker carry the definite article, which is
what renders `na sua prisão`. Under the essive `como`, which contracts with nothing and drops the
article, the trial keeps the article off both (`como sua prisão`). Spanish needs neither — `en su
prisión`, `como su prisión` — because its marker never contracts with a possessive.

**Not pinned.** Italian's essive keeps the article before a possessive (`usa la casa come la sua
prigione`), where `come sua prigione` is the usual phrasing. That is Italian's essive article, not
this omission, and it is unchanged by the fix.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: Spanish and Portuguese drop a pronominal possessor on a predicative* (2 `test.fails` — the subject complement and the object complement — plus a regression test for the other five languages, the same phrase as a direct object, a genitive possessor and the predicative's own determiner rules) |

## Resolved

2026-09-21. Took the shape above.

Both predicate branches now ask their `nounPhrase` for the possessive the subject and the object
have always had:

- **Spanish** ([complementsPhrase](../../../packages/engine/src/languages/es/complementsPhrase.ts)) —
  `nounPhrase(predicativeForms(np.head.forms), esAdj(np), esPossessiveWord(np))` at both call sites,
  the `predicative` noun branch and the `objectPredicative` noun branch. `esPossessiveWord` returns
  `''` for a genitive or absent possessor, so nothing else moves.
- **Portuguese** ([complementsPhrase](../../../packages/engine/src/languages/pt/complementsPhrase.ts)) —
  the same with `ptPossessiveWord(np)` on the `predicative` branch.

**The decision for the fixer — the Portuguese object complement.** Taken as the file proposed, with
one piece the trial's `ptPossessiveWord(np, false)` alone did not supply: the marker has to be given
a *definite* head to contract with, or the factitive link keeps the indefinite the predicative
defaults to and renders `em uma sua prisão`. A possessed head therefore takes `definiteness:
'definite'` for the marker (`em` + `a` → **na**), and the possessive comes without its own article —
`na sua prisão`. The essive `como` contracts with nothing and drops the article from both, so it
keeps the forms as they are: `como sua prisão`. Spanish needs neither: `en su prisión`, `como su
prisión`.

**What the fix generalises to.** Routing the predicate nominal through the language's own
`nounPhrase` gives this slot everything that builder knows, which the probe confirmed: A187's
determiner kept beside the possessive in its stressed, postnominal shape (`este libro suyo`, `este
livro seu`), `todos sus libros` / `todos os seus livros` with the possessive still in front, the
negative concord a `no` head drives (`el perro no es ningún libro suyo`), and an adjective in its
place (`su libro grande`).

**Not pinned**, and unchanged: Italian's essive article before a possessive (`usa la casa come la
sua prigione`), which is that engine's essive rule and not this omission.

**Tests guarding it.** `packages/engine/test/complements/predicative.test.ts` → *known bugs: Spanish
and Portuguese drop a pronominal possessor on a predicative*: both former `test.fails` are now plain
passing tests, with their assertions unchanged — the subject complement across the persons, genders,
numbers, the other predicative verbs and a relative clause, and the object complement under both
markers — beside the regression test for the other five languages, the same phrase as a direct
object, a genitive possessor and the predicative's own determiner rules.

Added there: a demonstrative, `all` and `no` beside the possessive, an adjective, and a coordinated
predicate spelling each conjunct's own possessor.

No passing test changed its expectation.
