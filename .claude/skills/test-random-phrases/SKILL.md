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
3. **Is it yours?** Other sessions edit this tree. Re-render the case against the engine at HEAD
   before filing — `git archive HEAD packages/engine/src packages/engine/package.json | tar -x -C
   <scratchpad>/head`, symlink `node_modules/@signi/shared` there, and point a probe at that
   `index.ts`. A defect that only appears in the working tree is someone's work in progress.
4. **Is the target exact?** Write the **Want** string, then run a probe that prints *now* against
   *want* for every assertion you plan to pin. Each must differ **only** by the defect. Never guess
   at a foreign-language string; render it.

## 4. File what survives

Follow the house format exactly — [docs/bugs/engine-grammar-bugs.md](../../docs/bugs/engine-grammar-bugs.md)
explains the encoding, and A153–A157 are recent examples.

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
- **The index:** add the row to the Part A table and bump the `test.fails` count in the prose **by
  your own delta only**; another session's uncommitted pins are not yours to count.

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
- Nothing was committed unless the user asked; if they did, only your own hunks were staged.
