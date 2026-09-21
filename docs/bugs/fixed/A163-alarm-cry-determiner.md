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

## Resolved

Fixed 2026-09-21. Every row renders as wanted, and so does every row under "Already right".

**The determiner is dropped in the translator, not in `alarmCry`.** The shape above would have
normalised it where each engine renders the alarm, and the indefinite rows would have come out right.
The `no` determiner would not have, because it is a negation as well as a determiner: the negative
concord reads it off the resolved object (`negationSources`, French `predicateText`, the group
agreement) before any engine renders the phrase. Dropped at render time, it left French
`le garçon ne cria au loup` (a `ne` with no `aucun` to pair with) and English `the boy cried wolf`
under a clause that still counted itself negated. So the new
[`withAlarmCry`](../../../packages/engine/src/translator/functions/withAlarmCry.ts) drops it once, right
after resolution, the way the measure manner adverbial's article is fixed bare
([`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts)). It
runs in [`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) and
[`resolveRelativeClause`](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts),
and it resolves a coordinated object's agreement again, since a `no` conjunct marks the whole group
negative. [`alarmCry`](../../../packages/engine/src/functions/alarmCry.ts) now turns every determiner
into the definite, not just `bare`, and `withAlarmCry` applies it to each conjunct.

Every engine sees one definiteness, whatever the plan says:

- **English** spells it bare: one arm in
  [`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts),
  `alarmCry(lexical, np) ? npText(withDefiniteness(np, 'bare'))`, as proposed.
- **Italian and French** fuse it into the frame, unchanged: `al lupo`, `aux loups`.
- **German, Spanish, Portuguese, Japanese** keep the literal object, as before, but now always the
  definite one: `rief den Wolf` for an indefinite or a `no` plan too. This file left their frame out of
  scope, and it still is. What changed is only that no determiner reaches them either, so a plan saved
  before [A164](A164-alarm-cry-determiner-satellite.md) withdrew the control renders as a new one would.

**Corpus.** `alarm_cry` is no longer a form on CRY_OUT's `it` and `fr` lexemes. It is the concept's
`alarmCry` ([`concepts/verbs/transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts)):
a `semantic_concepts.alarm_cry` column with a migration
([`db.ts`](../../../packages/backend/src/db.ts)), seeded by [`seed.ts`](../../../packages/backend/src/seed.ts)
and put back into every language's verb forms by [`lexicon.ts`](../../../packages/backend/src/lexicon.ts),
the same path `stative` takes. A164 needed it on `Concept` anyway. The dev database needs
`npm run seed`, and the backend a rebuild of `@signi/shared` and `@signi/engine`.

**Tests.** Both `test.fails` in `pangram.test.ts` → *known bugs: an alarm cry has no determiner* are
plain tests now, with their assertions unchanged. The block gained five more: every other determiner
(a demonstrative, a quantifier, `no`); a `no` alarm under a negated verb; the relative clause, a
question and the future; each alarm of a coordinated object, next to a word that keeps its own; and the
four languages with no frame. The English pins on lines 38, 50 and 66 and A124's "other languages"
guard are re-pinned to `cried wolf`, and A124's indefinite row to `al lupo` / `au loup`. New or extended
unit tests:
[`withAlarmCry`](../../../packages/engine/src/translator/functions/withAlarmCry.test.ts),
[`alarmCry`](../../../packages/engine/src/functions/alarmCry.test.ts),
[`en/predicateParts`](../../../packages/engine/src/languages/en/predicateParts.test.ts), the two
resolvers, and the backend's db / seed / lexicon / concepts tests.

Not covered: the passive. An alarm promoted to subject is a literal, definite subject in every
language (`the wolf was cried by the boy`, `il lupo fu gridato dal ragazzo`). A124 gave it no frame
either.
