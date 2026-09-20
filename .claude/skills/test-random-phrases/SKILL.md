---
name: test-random-phrases
description: Generate N random phrases from the corpus, render them in all seven languages, review every rendering for grammar, and file what is genuinely broken as a catalogued bug. Takes a count (e.g. "/test-random-phrases 5"). Use when the user says "test random phrases", "generate a random phrase and check the translations", "hunt for grammar bugs", or names a number of phrases to try.
---

# Hunting grammar defects with random phrases

The engine is a pure function from a `PhrasePlan` to seven sentences, so the cheapest way to find
defects is to feed it plans nobody thought to write by hand. This skill takes **a count** — the
number of phrases to generate (default 3 when the user gives none) — and drives each one from
"random plan" to "reviewed, and filed if broken".

The argument is a count, not a seed. To revisit a phrase from an earlier run, pass its printed seed:
`npm run phrases:random -- 1 --seed 4711`.

## 1. Generate

```
npm run phrases:random -- <count>            # or: npx tsx packages/engine/test/tools/randomPhrase.ts <count>
```

[The tool](../../packages/engine/test/tools/randomPhrase.ts) prints, per phrase, the **seed**, the
**plan as JSON**, and the **seven renderings**. It randomises the subject (number, gender,
determiner, adjectives and degrees, possessor, relative clause — or a pronoun), the verb (tense,
aspect, negation, adverb, modal), the object, the complements that verb licenses, and now and then a
clause-level mood (question, command, hypothetical, coordination). It stays inside what the builder
UI can express, so anything wrong in its output is wrong in the app.

It reads the **engine from source** (no rebuild needed after an engine edit) but `@signi/shared` from
`dist`. If a new shared constant seems missing, `npm run build --workspace=packages/shared`.

## 2. Review each rendering against its plan

Read the JSON, then each language. **Judge the grammar, not the sense** — a random plan is nonsense
as often as not ("few legends bit many books in few butchers"), and the grammar of a nonsense
sentence is still right or wrong. Worth checking, per phrase:

- **Agreement and case** — verb to subject, adjective and participle to its noun, German case on
  articles and adjective endings, Romance gender/number.
- **Determiners** — article choice and fusion with a preposition (`alla`, `zum`, `du`), quantifiers,
  demonstratives, proper nouns, mass nouns.
- **Adpositions** — the one each complement selects, and whether it still says what the plan means
  (source vs direction is where they collide).
- **Verb forms** — tense, the periphrastic aspects, modal chains, mood, and negation with concord.
- **Word order** — adverb placement (manner vs frequency vs direction), the German middle field and
  verb-final clauses, clitics, relative clauses.
- **Japanese** — particles, は/が, politeness level (a relative clause must be plain), SOV order.

## 3. Four checks before filing anything

Most suspicious output is already known, deliberate, or not yours. Run all four:

1. **Already catalogued?** Grep [docs/bugs/](../../docs/bugs/) — `A-must-fix/`, `B-can-fix/`,
   `C-do-not-fix/` and `fixed/`. Recurring hits: A142 (direction adverb before the object), B07
   (Japanese drops aspect under a modal), B14 (Japanese relative clause keeps the polite form).
   A `B*` or `C*` match means **do not file** — B is deliberate, C is correct.
2. **Pinned as right?** Grep [packages/engine/test/](../../packages/engine/test/) for the current
   output. If a *passing* test asserts it, the behaviour was a decision: do not file it and do not
   weaken the test — raise it with the user as a question. (German `schnell die Maus` is pinned in
   `modals.test.ts` and `imperative.test.ts`, for instance.)
3. **Is it yours?** Other sessions edit this tree — the engine, and the **corpus the generator
   reads** (`backend/src/concepts/`). Re-render the case at HEAD before filing:

   ```
   git worktree add --detach <scratchpad>/head HEAD
   ln -s "$PWD/node_modules" <scratchpad>/head/node_modules
   npx tsx <scratchpad>/head/probe.mts   # importing <scratchpad>/head/packages/engine/test/harness.js
   ```

   A whole worktree, not just `packages/engine/src`: the harness seeds from the backend's corpus and
   reads its lexicon, so a seed edit changes renderings as readily as an engine edit. Anything that
   reproduces only in the working tree is someone's work in progress. `git worktree remove --force`
   when done.
4. **Is the target exact?** Write the **Want** string, then run a probe that prints *now* against
   *want* for every assertion you plan to pin. Each must differ **only** by the defect. Never guess
   at a foreign-language string; render it.

   When the engine cannot produce the target *yet* — which is often the point of the defect — reach
   it another way rather than writing it by hand: the same plan with the trigger removed (a positive
   verb, where the fix will drop a negator), a determiner the engine already spells the wanted way,
   or, for a target only the fix produces, **apply a trial fix inside the check-3 worktree** and
   render there. That copy is throwaway, so the shared tree is never touched, and it settles two
   things at once: the exact **Want** strings, and whether your **Shape of the fix** actually yields
   them. Say so in the file ("verified by applying it to a throwaway copy"). Never patch the real
   tree to render a target.

**Probes are not typechecked.** A scratch `.mts` probe passes `any`-shaped plans, so a wrong key or
an out-of-union literal quietly takes a fallback path and manufactures a defect that is not there.
Two that have bitten: the verb's adverb is `verbPhrase.modifier` — an `adverb` key is ignored, and
the adverb simply vanishes from the output — and `definiteness` accepts only the ten values in
`DEFINITENESS` (`'any'` is an engine-internal NPI surface, not a plan value). Check any suspicious
key against [packages/shared/src/index.ts](../../packages/shared/src/index.ts) before believing
what you see.

## 4. File what survives

Follow the house format exactly — [docs/bugs/engine-grammar-bugs.md](../../docs/bugs/engine-grammar-bugs.md)
explains the encoding, and [A158–A161](../../docs/bugs/A-must-fix/) are the current examples. Take
the template from an **un-retired** file like those: anything in `fixed/` has a `## Resolved`
section appended, which is the fixer's to write, not yours.

- **Id:** the next free `A<n>`. **Re-list `docs/bugs/A-must-fix/` and grep the index immediately
  before numbering** — parallel sessions allocate ids too, and they race.
- **The file:** `docs/bugs/A-must-fix/A<n>-<slug>.md` with a title line, a **Language(s)** line, a
  short statement of the rule being broken, a **Now / Want** table (one row per case, including the
  random phrase that found it), an "Already right" note for the languages that are fine, a **Found
  by** line naming the phrase, a **## Shape of the fix** section pointing at the files and naming any
  decision the fixer must take, and the closing **Test** row.
- **The pin:** one `test.fails` per defect asserting the **correct** output, plus a regression
  `test(...)` for the neighbouring behaviour that is already right. Put it in the suite the defect
  belongs to (`complements/source.test.ts`, `clause.test.ts`, `adverb.test.ts`, …) — and prefer a
  file **no other session is editing** (`git status`).
- **The index:** add the row to the Part A table, and correct the running count in the prose above
  it. That number counts **bug files** (Part A + Part B), *not* `test.fails` — one file routinely
  pins several — so it moves by how many files you added, not by how many pins. Move it **by your
  own delta only**; another session's uncommitted files are not yours to count.
- **The commit — only if the user asks for one.** Filing is a `docs:` commit, not `fix:`; a `fix:`
  changes the engine, this changes the catalogue. Subject `docs: A<n>-A<m>, <how they were found>`
  (e.g. *docs: A153-A157, found by rendering three random phrases*). Body: one paragraph per bug —
  what is wrong, where, and what the fixer must decide — then a closing paragraph naming the test
  files and the index count. Read `git log -1 --format=%B f2036ad` for the model.

  **Stage by path — never `git add -A` or `commit -a`.** The tree is shared, and a parallel session
  may already have staged work in the index; committing the index would sweep their work into your
  commit under your message. Name your paths on the commit itself, which leaves the rest of the
  index exactly as they left it:

  ```
  git commit -F <scratchpad>/msg.txt -- docs/bugs/... packages/engine/test/...
  ```

  Then `git show --stat HEAD` and confirm only your files are in it. Commit on the current branch:
  this repo's history is linear on `main`, and switching branches would move HEAD under the other
  sessions sharing the tree.

## 5. Verify

```
npm run typecheck                    # Vitest does not typecheck; a bad literal silently takes a fallback path
npx vitest run packages/engine/test  # or npm run test:unit
```

The suite must be **green**, with your new pins reported as *expected fail* and no
"expected to fail but passed" anywhere.

## 6. Report

Per phrase: a one-line verdict and what was wrong where. Then the bugs filed, and — separately —
what you deliberately did **not** file: already catalogued, pinned as right, or needing a product
decision. That last list is the user's to rule on.

## Definition of done

- `count` phrases generated, and **every** one reviewed in **all seven** languages.
- Each filed defect has a bug file, a `test.fails` plus a regression test, and an index row; every
  `Want` string was rendered, not guessed, and reproduces at HEAD.
- `npm run typecheck` and the engine suite pass, green, with no weakened assertion and no `B*`/`C*`
  defect "fixed" or re-filed.
- Nothing was committed unless the user asked; if they did, it is a `docs:` commit, staged **by
  path**, and `git show --stat HEAD` lists only your own files.
