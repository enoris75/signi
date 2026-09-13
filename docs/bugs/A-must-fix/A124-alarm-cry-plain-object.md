# A124. An alarm cry renders as a plain direct object in Italian and French

**Language:** Italian, French

CRY_OUT ("to cry out; to shout or exclaim loudly") takes the cry as its direct object. When the cry is
an alarm, a noun naming the danger, Italian and French mark it with a / à and the definite article:
`gridare al lupo`, `al fuoco`, `al ladro`; `crier au loup`, `au feu`, `au voleur`. This is also the
idiom for "cry wolf". Both engines render the cry as an ordinary object instead. Italian gives `gridò il
lupo` ("shouted the wolf") and, with a bare object, the ungrammatical `gridò lupo`. French gives `cria le
loup` and `cria loup`.

Found on "the quick brown fox of the boy who cried the wolf jumped over the lazy dog".

| Plan | Language | Now | Want |
|---|---|---|---|
| BOY CRY_OUT (past) WOLF | it | `il ragazzo gridò il lupo.` | `il ragazzo gridò al lupo.` |
| | fr | `le garçon cria le loup.` | `le garçon cria au loup.` |
| same, WOLF bare | it | `il ragazzo gridò lupo.` | `il ragazzo gridò al lupo.` |
| | fr | `le garçon cria loup.` | `le garçon cria au loup.` |
| the quick brown FOX of the BOY who CRY_OUT (past) the WOLF, JUMP (past) over the lazy DOG | it | `la volpe veloce e marrone del ragazzo che gridò il lupo saltò sopra il cane pigro.` | `…del ragazzo che gridò al lupo saltò sopra il cane pigro.` |
| same, locative | fr | `le renard rapide et brun du garçon qui cria le loup sauta au-dessus du chien paresseux.` | `…du garçon qui cria au loup sauta au-dessus du chien paresseux.` |

The Italian sentence reads the same with a locative or a route. The French route also has A125.

Already right, and pinned as passing in `pangram.test.ts`:

- English with a bare object: `the boy cried wolf`.
- A shouted word, which is an ordinary object in every language: `il ragazzo gridò la parola`, `le
  garçon cria le mot`, `der Junge rief das Wort`.

Not pinned: the other languages, which have no a / à alarm frame. Their literal object is still not the
idiom. German `der Junge rief den Wolf` reads as "the boy called the wolf over", and Spanish `gritó el
lobo`, Portuguese `gritou o lobo` and Japanese `狼を叫んだ` are literal. Candidate targets (`‚Wolf!'
rufen`, `gritar que viene el lobo`, `狼が来たと叫ぶ`) need a native check before they are pinned.

## Shape of the fix

The alarm frame belongs to the kind of cry, not to CRY_OUT's object in general: `gridò la parola` must
stay a plain object. There are two ways to draw the line.

- **A lexical object frame** on CRY_OUT's Italian and French lexemes, keyed off the object: a / à + the
  definite article for a noun naming a danger, a plain object for a linguistic one (WORD). This needs a
  noun feature to tell the two apart.
- **A separate sense** (e.g. `CRY_ALARM`, "to shout a warning of") whose Italian and French lexemes
  govern a / à. If the fix seeds a new sense, re-point the test's plans at it.

Either way, the fused article is the one the `terminus` already renders (`prepDet('a', …)` in Italian:
`al`, `allo`, `alla`; `à` in French: `au`, `à la`, `aux`). A bare object takes the article too (`al
lupo`). Do not reuse the terminus itself. CRY_OUT + a terminus WOLF gives `gridò al lupo` and `cria au
loup`, but it means "shouted at the wolf": English renders `cried to the wolf`, German `dem Wolf rief`.

| | |
|---|---|
| **Test** | `pangram.test.ts` → *known bugs: an alarm cry takes a / à in Italian and French* (1 `test.fails`) |
