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

## Resolved

Fixed 2026-09-14 with the first of the two proposed shapes, a lexical object frame. A separate sense
would have split "the boy cried wolf" from the CRY_OUT a user picks. The frame is keyed off a noun
feature naming a danger, not off "not linguistic": the terminus test's `il gatto grida il libro al cane`
must stay a plain object.

- **Corpus:** a concept-level `alarm` flag, plumbed like A47's `transient`: `alarm?: boolean` on
  `ConceptSeed` ([`concepts/types.ts`](../../../packages/backend/src/concepts/types.ts)), an `alarm`
  column with its migration ([`db.ts`](../../../packages/backend/src/db.ts)), threaded through
  [`seed.ts`](../../../packages/backend/src/seed.ts), and surfaced on noun forms by
  [`lexicon.ts`](../../../packages/backend/src/lexicon.ts). WOLF and FIRE are marked
  ([`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts)). CRY_OUT's Italian and French lexemes
  carry `alarm_cry: '1'` ([`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts)).
  The dev database needs `npm run seed` to pick the flags up.
- **Engine:** `alarmCry` ([`types.ts`](../../../packages/engine/src/types.ts)) returns the object
  conjunct when both flags are present, promoting a bare cry to the definite article. Each language's
  `alarmCryText` renders it with the fused head: Italian `prepDet('a', …)`
  ([`it/alarmCryText.ts`](../../../packages/engine/src/languages/it/alarmCryText.ts)), French `aDet`
  ([`fr/alarmCryText.ts`](../../../packages/engine/src/languages/fr/alarmCryText.ts)). Each
  `predicateText` uses it per object conjunct. The Italian passive si ignores an alarm cry, which is no
  direct object (`si grida ai lupi`).
- **Tests:** [`pangram.test.ts`](../../../packages/engine/test/pangram.test.ts) → *known bugs: an alarm
  cry takes a / à in Italian and French*. The pinning `test.fails` is now a passing `test`. New cases
  cover FIRE, the plural and the bare plural, the negative, a modal, the compound past, coordination, a
  possessive, an adjective, an indefinite and the impersonal si. A regression guard covers another verb
  (`vide il lupo`), a recipient after the cry, and English and German.
- Unit tests: `alarmCryText.test.ts` (it, fr) and `predicateText.test.ts` (it, fr).

Not covered: a relative on the cried object (`il lupo che il ragazzo gridò`), which would need `al quale`.
The other languages stay unpinned, as the file says.
