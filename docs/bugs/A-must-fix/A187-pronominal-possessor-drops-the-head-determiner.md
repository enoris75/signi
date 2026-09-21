# A187. A pronominal possessor throws away the head's own determiner

**Languages:** English, Italian, French, German, Spanish, Portuguese

A possessive and a demonstrative or quantifier can go together in every language, each in its own
way:

- **Italian** stacks them: `questo suo libro`, `alcuni suoi libri`, `nessun suo libro`.
- **Spanish and Portuguese** move the possessive after the noun: `este libro suyo`, `ningún libro
  suyo`, `este livro seu`, `nenhum livro seu`.
- **French, German and English** put the possessor in a phrase after the noun: `ce livre à elle`,
  `dieses Buch von ihr`, `this book of hers`.
- After `all`, the possessive itself stays in every language: `tutti i suoi libri`, `todos sus
  libros`, `tous ses livres`, `alle ihre Bücher`, `all her books`.

The engine keeps none of it.
[`possessedHeadForms`](../../../packages/engine/src/functions/possessedHeadForms.ts) overwrites the
head's `definiteness` with `definite` or `bare` whenever the possessor is pronominal, on the rule that
"a pronominal possessor fills the determiner slot". The English, German and Spanish builders then put
the possessive where the determiner was. So `this`, `that`, `some`, `many`, `few`, `no` and `all`
all come out as `her book(s)`.

A `no` is worse. The concord checks read the head's own forms, so the Romance negator still fires
while the `nessun` / `aucun` / `ningún` / `nenhum` it answers to is gone. On an object the clause is
negated in four languages and positive in two (`il gatto non vede il suo libro`, `the cat sees her
book`). French is left with a bare `ne`: `son livre ne brûle.`, `le chat ne voit son livre.`

| Case | Language | Now | Want |
|---|---|---|---|
| `this` BOOK, `her` | English | `her book burns.` | `this book of hers burns.` |
| | Italian | `il suo libro brucia.` | `questo suo libro brucia.` |
| | French | `son livre brûle.` | `ce livre à elle brûle.` |
| | German | `ihr Buch brennt.` | `dieses Buch von ihr brennt.` |
| | Spanish | `su libro arde.` | `este libro suyo arde.` |
| | Portuguese | `o seu livro arde.` | `este livro seu arde.` |
| `some` BOOK, `her` | English | `her books burn.` | `some books of hers burn.` |
| | Italian | `i suoi libri bruciano.` | `alcuni suoi libri bruciano.` |
| | French | `ses livres brûlent.` | `quelques livres à elle brûlent.` |
| | German | `ihre Bücher brennen.` | `einige Bücher von ihr brennen.` |
| | Spanish | `sus libros arden.` | `algunos libros suyos arden.` |
| | Portuguese | `os seus livros ardem.` | `alguns livros seus ardem.` |
| `no` BOOK, `her` | English | `her book burns.` | `no book of hers burns.` |
| | Italian | `il suo libro brucia.` | `nessun suo libro brucia.` |
| | French | `son livre ne brûle.` | `aucun livre à elle ne brûle.` |
| | German | `ihr Buch brennt.` | `kein Buch von ihr brennt.` |
| | Spanish | `su libro arde.` | `ningún libro suyo arde.` |
| | Portuguese | `o seu livro arde.` | `nenhum livro seu arde.` |
| `all` BOOK, `her` | English | `her books burn.` | `all her books burn.` |
| | Italian | `i suoi libri bruciano.` | `tutti i suoi libri bruciano.` |
| | French | `ses livres brûlent.` | `tous ses livres brûlent.` |
| | German | `ihre Bücher brennen.` | `alle ihre Bücher brennen.` |
| | Spanish | `sus libros arden.` | `todos sus libros arden.` |
| | Portuguese | `os seus livros ardem.` | `todos os seus livros ardem.` |
| object, `no` BOOK, `her` | English | `the cat sees her book.` | `the cat sees no book of hers.` |
| | Italian | `il gatto non vede il suo libro.` | `il gatto non vede nessun suo libro.` |
| | French | `le chat ne voit son livre.` | `le chat ne voit aucun livre à elle.` |
| | German | `der Kater sieht ihr Buch.` | `der Kater sieht kein Buch von ihr.` |
| | Spanish | `el gato no ve su libro.` | `el gato no ve ningún libro suyo.` |
| | Portuguese | `o gato não vê o seu livro.` | `o gato não vê nenhum livro seu.` |
| `this` HOUSE (feminine), `my` | English | `my house burns.` | `this house of mine burns.` |
| | Italian | `la mia casa brucia.` | `questa mia casa brucia.` |
| | French | `ma maison brûle.` | `cette maison à moi brûle.` |
| | German | `mein Haus brennt.` | `dieses Haus von mir brennt.` |
| | Spanish | `mi casa arde.` | `esta casa mía arde.` |
| | Portuguese | `a minha casa arde.` | `esta casa minha arde.` |

`that`, `many` and `few` go the same way (`quel suo libro`, `molti suoi libri`, `pocos libros
suyos`, `wenige Bücher von ihr`, `beaucoup de livres à elle`).

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The definite, indefinite and bare heads with a possessive (`her book burns.`, `il
suo libro brucia.`, `son livre brûle.`). The Italian kinship noun (`mio padre corre.`). A possessive
in a complement (`nella mia casa`, `dans ma maison`, `in meinem Haus`). Japanese keeps the
determiner. [A185](A185-japanese-head-determiner-before-its-possessor.md) is about where it goes.

Found while probing [A184](A184-english-genitive-drops-the-head-determiner.md), its genitive
counterpart in English, from the random phrase "many happy adult tears' fires will want to have
divided the tired empty young man up behind sharpest Europe." (seed 530537). Filed on the user's
ruling of 2026-09-21.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD, in the subject and object positions. It renders
every **Want** above and leaves the engine suite green. No passing test moves.

Keep the head's determiner when it is `this`, `that`, `some`, `many`, `few`, `no` or `all`, and let
each language place the possessive:

- **Italian:** [`itPossessedHeadForms`](../../../packages/engine/src/languages/it/itPossessedHeadForms.ts)
  returns the head's own forms for those determiners (minus `proper`). `artFor` then gives `questo`
  / `alcuni` / `nessun` / `tutti i`, and `renderNP` puts the possessive after it.
- **Spanish and Portuguese:** in [`es/nounPhrase`](../../../packages/engine/src/languages/es/nounPhrase.ts)
  and [`pt/nounPhrase`](../../../packages/engine/src/languages/pt/nounPhrase.ts), the determiner +
  noun + a postnominal possessive. Spanish needs its stressed forms (`mío`, `tuyo`, `suyo`; `nuestro`
  and `vuestro` are already the same), which [`possessive.ts`](../../../packages/engine/src/possessive.ts)
  does not have. Portuguese reuses `seu` without its article. After `all`: `todos` + the prenominal
  possessive.
- **French:** in [`renderNP`](../../../packages/engine/src/languages/fr/renderNP.ts), the head's own
  article (`ce`, `quelques`, `aucun`) and `à` + the disjunctive pronoun after the noun (`moi`,
  `toi`, `lui` / `elle`, `nous`, `vous`, `eux` / `elles`). After `all`: `tous` / `toutes` + the
  possessive.
- **German:** in [`nounPhrase`](../../../packages/engine/src/languages/de/nounPhrase.ts), the head's
  own determiner and `von` + the dative pronoun after the noun (`mir`, `dir`, `ihm` / `ihr`, `uns`,
  `euch`, `ihnen`), with the adjectives declined after that determiner, not after `possessedDeclension`'s
  `no`. After `all`: `alle` + the possessive.
- **English:** in [`nounPhrase`](../../../packages/engine/src/languages/en/nounPhrase.ts), the
  determiner + noun + `of` + the independent possessive (`mine`, `yours`, `his`, `hers`, `its`,
  `ours`, `theirs`). This is a new table, since `possessiveEn` has only the dependent forms. After
  `all`: `all` + the possessive.

**Decisions for the fixer:**

- **The partitive.** French, German and English also say `quelques-uns de ses livres` / `aucun de
  ses livres`, `einige ihrer Bücher` / `keines ihrer Bücher`, `some of her books` / `none of her
  books`. Those are more idiomatic for a quantifier, but they turn the quantifier into a pronoun that
  agrees on its own. The trial's `à elle` / `von ihr` / `of hers` covers every determiner with one
  shape. Rule on which to want, and change the Wants with it.
- **The other positions.** The trial covers the subject and object. A complement, a possessor and a
  passive agent build their heads through the same `possessedHeadForms` and need the same change.
  Not pinned.
- **An `indefinite` head.** Left on the plain possessive (`her book`, `il suo libro`), as
  `en/nounPhrase.test.ts` pins for English (`her big book`). Italian `un suo libro` and Spanish `un
  libro suyo` are the faithful forms, so the pin may be worth revisiting. Not pinned here.

| | |
|---|---|
| **Test** | `possessivePronoun.test.ts` → *known bugs: a pronominal possessor drops the head's determiner* (1 `test.fails`, plus a regression test for the definite head, a kinship noun and a complement) |
