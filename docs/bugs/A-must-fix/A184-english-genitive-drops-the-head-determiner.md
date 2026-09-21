# A184. The English Saxon genitive drops the possessed head's determiner

**Languages:** English

The Saxon genitive fills the determiner slot of the noun it possesses: `the cat's book`, never `the
cat's the book`. [`nounPhrase`](../../../packages/engine/src/languages/en/nounPhrase.ts) builds it
that way for every head, whatever determiner the head carries. The head's own `this`, `that`, `some`,
`many`, `few`, `all` and `no` all disappear into `the cat's book(s)`. With `no`, the clause loses its
negation: "no book of the cat burns" comes out as `the cat's book burns.`

The other six languages keep the head's determiner, because their genitive follows the head
(`nessun libro del gatto`, `kein Buch des Katers`, `ce livre du chat`). English keeps it too in one
case. When [A21](../fixed/A21-english-group-genitive.md) moves a post-modified possessor to the
of-genitive, the head keeps its article: `this book of the cat that eats the mouse`. English uses
that same of-genitive, or the Saxon genitive after `all`, when the head has a determiner of its own.

| Head | Now | Want |
|---|---|---|
| `this` | `the cat's book burns.` | `this book of the cat burns.` |
| `that` | `the cat's book burns.` | `that book of the cat burns.` |
| `some` | `the cat's books burn.` | `some books of the cat burn.` |
| `many` | `the cat's books burn.` | `many books of the cat burn.` |
| `few` | `the cat's books burn.` | `few books of the cat burn.` |
| `no` | `the cat's book burns.` | `no book of the cat burns.` |
| `all` | `the cat's books burn.` | `all the cat's books burn.` |
| `this` + OLD | `the cat's old book burns.` | `this old book of the cat burns.` |
| object, `no` | `the dog sees the cat's book.` | `the dog sees no book of the cat.` |
| object, `many`, plural possessor | `the dog sees the cats' books.` | `the dog sees many books of the cats.` |
| locative, `this` | `the dog runs in the cat's house.` | `the dog runs in this house of the cat.` |
| a possessor with `this` and its own possessor | `the cat's father's book burns.` | `the book of this father of the cat burns.` |
| the random phrase's subject | `many happy adult tears' fires burn.` | `some fires of many happy adult tears burn.` |

The possessor-chain row shows a second step. `this father of the cat` now ends in an of-phrase, so
an `'s` after it would land on `cat`, the group-genitive trap A21 closed. Such a possessor must count
as post-modified, and its own possessed head takes the of-genitive too.

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The definite head (`the cat's book burns.`). The possessor's own determiner
(`this cat's book burns.`). A chain of definite heads (`the cat's father's book burns.`). A
post-modified possessor (`this book of the cat that eats the mouse burns.`). The other six languages.

Found by the random phrase "many happy adult tears' fires will want to have divided the tired empty
young man up behind sharpest Europe." (seed 530537), whose subject is `some` FIRE of `many` TEAR:
the `some` is gone.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

- In [`nounPhrase`](../../../packages/engine/src/languages/en/nounPhrase.ts), before the Saxon
  branch: a head whose `definiteness` is `all` takes `all ` + the Saxon prefix. A head whose
  `definiteness` is anything but `definite`, `indefinite`, `bare` or `all` takes the A21 of-genitive,
  `${determiner}${adjectives}${word} of ${possessorPhrase(possessor)}`.
- In [`isPostModified`](../../../packages/engine/src/languages/en/isPostModified.ts), a phrase is
  also post-modified when it has a genitive possessor and one of those of-genitive determiners, so a
  phrase above it does not put `'s` after its of-phrase.

**Decisions for the fixer:**

- **The idiomatic surface.** The trial uses the plain of-genitive, which the engine already builds
  for A21. For a person-like possessor, English often prefers the double genitive (`this book of
  the cat's`, `no book of the cat's`) or a partitive (`some of the cat's books`, `none of the cat's
  books`). Either would change the Wants above. Rule on it before fixing, and keep the determiner
  whichever surface wins.
- **An `indefinite` or `bare` head.** The trial leaves them on the Saxon genitive: `the cat's book
  burns.` for "a book of the cat", which makes it definite. `en/nounPhrase.test.ts` pins the
  pronominal side of that choice (`her big book` for an indefinite head), so it is a decision
  already taken. Not pinned here.
- **A pronominal possessor.** `this` / `some` / `no` / `all` + `her` drop the head's determiner in
  every language except Japanese: `her book burns.`, `il suo libro brucia.`, `ihr Buch brennt.`,
  `su libro arde.`. French is left with a bare `ne` under `no`: `son livre ne brûle.` The fix
  needs a surface per language (`this book of hers`, `questo suo libro`, `este libro suyo`, `ce
  livre à elle`), and the English ones need the independent possessives the corpus lacks. Filed
  separately as [A187](A187-pronominal-possessor-drops-the-head-determiner.md).

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: English drops the possessed head's determiner* (1 `test.fails`, plus a regression test for the definite head, the possessor's own determiner, a post-modified possessor and the other languages) |
