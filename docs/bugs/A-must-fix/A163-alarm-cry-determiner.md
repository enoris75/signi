# A163. An alarm cry spells the determiner the user picked, but a cry has no determiner slot

**Language:** English, Italian, French

CRY_OUT takes the cry as its direct object. When the cry is an alarm — a noun naming a danger
(`alarm`: WOLF, FIRE) — that object is not a referring noun phrase. It is the shout itself, the word
"Wolf!", and a shout has no determiner. A124 gave Italian and French the a / à frame and promoted a
bare object to the fused article (`gridò al lupo`, `cria au loup`), but the determiner the user set
still reaches the output in three languages.

English is the loudest. Transitive *cry* means "utter loudly", so its object must be an utterance:
`cried a warning`, `cried my name`, `cried the word` are all English. A particular animal cannot be
uttered, and nothing coerces the reading back — the summoning sense that makes German `rief den Wolf`
work is one English lost. `the boy cried a wolf` is not a sentence of English, and neither is `the boy
cried the wolf`.

Italian and French do not break, they change meaning. The alarm frame still fires, so an indefinite
gives `gridò a un lupo` / `cria à un loup` — "shouted **at** a wolf", the terminus reading A124
explicitly warned against reusing. Italian's indefinite plural `gridò a lupi` is ungrammatical
outright: bare `a` + a plural noun, where "at some wolves" is `a dei lupi`.

Found on "the boy who cried the wolf", the pangram's relative clause, reviewed in the app.

| Plan | Language | Now | Want |
|---|---|---|---|
| BOY CRY_OUT (past) WOLF, definite | en | `the boy cried the wolf.` | `the boy cried wolf.` |
| same, indefinite | en | `the boy cried a wolf.` | `the boy cried wolf.` |
| same, definite plural | en | `the boy cried the wolves.` | `the boy cried wolves.` |
| same, definite, FIRE | en | `the boy cried the fire.` | `the boy cried fire.` |
| same, indefinite | it | `il ragazzo gridò a un lupo.` | `il ragazzo gridò al lupo.` |
| | fr | `le garçon cria à un loup.` | `le garçon cria au loup.` |
| same, indefinite plural | it | `il ragazzo gridò a lupi.` | `il ragazzo gridò ai lupi.` |
| | fr | `le garçon cria à des loups.` | `le garçon cria aux loups.` |
| the quick brown FOX of the BOY who CRY_OUT (past) the WOLF, JUMP (past) over the lazy DOG | en | `the quick brown fox of the boy who cried the wolf jumped over the lazy dog.` | `…of the boy who cried wolf jumped over the lazy dog.` |

Already right, and pinned as passing in `pangram.test.ts`:

- English with a bare object, which is the idiom: `the boy cried wolf.`
- English's indefinite plural, which carries no article to spell: `the boy cried wolves.`
- Italian and French, definite and bare, singular and plural: `al lupo`, `ai lupi`, `au loup`,
  `aux loups` (A124's block).
- A cry that is not an alarm keeps its determiner in every language: `the boy cried a word`,
  `il ragazzo gridò una parola`, `le garçon cria un mot`.

Not in scope: German, Spanish, Portuguese and Japanese, which have no alarm frame at all and render
the literal object (`rief den Wolf`, `gritó el lobo`, `gritou o lobo`, `狼を叫びました`). A124 left
them out because the idiomatic targets (`‚Wolf!' rufen`, `gritar que viene el lobo`,
`狼が来たと叫ぶ`) need a native check first. This file does not change that.

## Shape of the fix

The alarm object has no determiner slot, so the fix is to stop reading one. `alarmCry`
([`functions/alarmCry.ts`](../../../packages/engine/src/functions/alarmCry.ts)) already normalises a
bare object to definite for its two callers; make it normalise the whole determiner, and give English
an arm of its own.

- `alarmCry` collapses `indefinite` the same way it already collapses `bare`, so Italian and French
  reach `alarmCryText` with one definiteness whatever the user set. The plural rides along
  (`ai lupi`, `aux loups`).
- English needs `alarm_cry: '1'` on CRY_OUT's `en` lexeme
  ([`concepts/verbs/transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts) — a
  corpus change, so the dev database needs `npm run seed`). It needs no `alarmCryText` of its own:
  English has no `predicateText`, and its object conjuncts already run through `npText` in
  [`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts), which
  imports [`withDefiniteness`](../../../packages/engine/src/functions/withDefiniteness.ts) for
  exactly this kind of override. Per object conjunct,
  `alarmCry(verb, np) ? npText(withDefiniteness(np, 'bare')) : npText(np)` is the whole English arm.
  It drops the article where Italian and French fuse one: the same rule, spelled per language.
- Leave the relative on an alarm head alone. A129 covers Italian and French (`al quale`, `auquel`),
  and the English reading ("the wolf that the boy cried") is marginal in the source language.

The existing English pins encode today's output and must be **re-pinned** by the fix, not deleted:
`pangram.test.ts` lines 38, 50 (the pangram sentence, locative and route) and 66 (the fox variant),
plus 149, A124's "the other languages are unchanged" guard, which asserts `the boy cried the wolf.`
Update the expected strings; do not weaken the assertions.

| | |
|---|---|
| **Test** | `pangram.test.ts` → *known bugs: an alarm cry has no determiner* (2 `test.fails`, English and Italian/French, plus a regression guard) |
