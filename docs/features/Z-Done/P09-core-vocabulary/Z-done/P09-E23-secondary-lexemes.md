# P09-E23. Secondary lexemes — a second word that finds the same concept

**Feature:** non-primary lexeme links, so a word that is not a concept's citation form still finds it
in the picker — *talk* finds SPEAK, *cominciare* and *anfangen* find BEGIN — without a duplicate
concept.
**Shape:** a seed field, a seeder loop, one field on `/api/concepts`, and three search haystacks.
The schema already has the column; nothing renders a secondary lexeme.
**Scope:** backend lexicon and `/api/concepts`, the picker search, the console's word resolution.
All 7 languages as data; no engine change.
**Status:** **shipped, 2026-09-24** — every recommendation as ruled; see [Done](#done). Filed
2026-09-23 from P09's follow-ups ([README *Follow-ups*](../README.md#follow-ups), *Secondary lexemes*).

## Done

Shipped 2026-09-24, as recommended in every decision: lexeme rows with `is_primary = 0` (D1), the
lemma only and no pronouns (D2), `aliases` on `ConceptSeed` and on the API's `Concept`, all
languages shipped (D3), the picker, console completion and a last `resolveWord` rule, with no
matched-alias hint (D4), and the D5 data alone — each checked against the seed files first (no
concept is labelled *talk*, *come back*, *cominciare*, *anfangen* or *comenzar*). No engine change;
BEGIN, SPEAK and RETURN render their primaries in all seven languages, as before.

| concept | aliases | seed |
|---|---|---|
| SPEAK | en *talk* | [`verbs/intransitive.ts`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts) |
| RETURN | en *come back* | [`verbs/motion.ts`](../../../../../packages/backend/src/concepts/verbs/motion.ts) |
| BEGIN | it *cominciare*, de *anfangen*, es *comenzar* | [`verbs/intransitive.ts`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts) |

What landed:

- **Backend.** [`seed.ts`](../../../../../packages/backend/src/seed.ts) gains `insertAliasLink`
  (`VALUES (?, ?, 0)`; the primary statement keeps its literal 1) and, after each concept's
  primary loop, one lexeme per alias: the lemma (a noun's `singular`, plural and gender `NULL`) plus
  the `base` form row for the other roles. [`index.ts`](../../../../../packages/backend/src/index.ts)
  reads them with one `ALIAS_SQL` and sets `aliases` on each concept, absent where there are none.
  Every rendering and label reader was re-checked: the five `lookup*` queries in `lexicon.ts`,
  `LABEL_SQL`, `PRONOUN_META_SQL` and `GENDERED_NOUNS_SQL` all filter `is_primary = 1`.
- **Shared.** `Concept.aliases`, the last member, documented as search-only.
- **Frontend.** `useConceptSearch` adds `aliases[uiLanguage]` and `aliases.en` to its haystack;
  `complete.ts`'s `hay` the same two; `resolveWord` a last rule, an exact alias in `vocab.language`
  or English. `printWord` is untouched, so the console prints the label (`/verb pick` reads back as
  `/verb ( choose )`).
- **Tests.** `seed.test.ts` (the primary count and exactly one primary per concept and language,
  every alias stored and nothing else, BEGIN's alias rows, a synthetic corpus with an alias of each
  role, the refusals); `lexicon.test.ts` (BEGIN, SPEAK and RETURN read their primaries);
  `index.test.ts` (`aliases` on BEGIN, SPEAK and RETURN with `labels` unchanged, served aliases equal
  seeded ones, absent on DIVIDE); `VerbTypeahead.test.tsx` (*talk* finds SPEAK listed as *speak*;
  Italian UI *cominc* finds BEGIN shown as *iniziare*; no third language's alias);
  `console/complete.test.ts` (`/verb pic` offers and inserts *choose*); a new
  `console/resolve.test.ts` (alias hits, the English alias from another UI language, label beats
  alias, a shared alias is `ambiguous`, the printer writes the label); and an e2e spec,
  `e2e/aliases.spec.ts`. The console round trip is green.

What landed differently:

1. **The seeder refuses a bad alias** before touching the database, as it refuses a bad hierarchy:
   one on a pronoun (D2's "no pronouns", now enforced), a blank one, and one that repeats the
   concept's own primary lemma or another alias in the same language.
2. **`ALIAS_SQL` reads four link tables, not five**: pronouns take no aliases, so the pronoun branch
   would only ever be empty.
3. **The picker test is in `VerbTypeahead.test.tsx`**, not `SlotTypeahead.test.tsx` or a hook unit
   test — it types into the real verb picker, which is where D5's data lives. The resolve tests are a
   new file, since `resolveWord` had no unit test of its own.
4. **The console fixture's alias is on CHOOSE** (*pick*, *selezionare*), not on a new SPEAK verb.
   Adding a verb to `test/console/vocab.ts` changes the round trip's random walk, which then reached
   the question 33 times in 400 against its floor of 40 — a fixture concern, not a defect; giving
   an existing verb aliases leaves the walk as it was.
5. **`seed.test.ts`'s `storedForms` now joins primaries only**, as its comment always said; with
   alias rows in the corpus, the unfiltered join could have merged an alias's `base` into BEGIN's.

## Why

P09 §1 D1 kept one concept per meaning and folded near-synonyms into it (TALK → SPEAK, COME_BACK →
RETURN). The price is findability: a user who types the other word finds nothing, and the
temptation is to seed a duplicate concept — the thing D1 ruled out. The problem is sharper outside
English, where the `synonym` gloss does not reach: an Italian user typing *cominciare* or a German one
typing *anfangen* finds nothing, because BEGIN's primary lemmas are *iniziare* and *beginnen*.

## Today

Verified at HEAD, 2026-09-23.

- **The README's own example is stale.** "begin" no longer needs to find START: BEGIN is its own
  concept, the inchoative half of START ([`intransitive.ts:1129`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1129),
  seeded by commit `1d5b6bc`, C08), and START's definition is composed on it
  ([`transitive.ts:5770`](../../../../../packages/backend/src/concepts/verbs/transitive.ts#L5770)).
  The feature still stands on the other cases (D5).
- **The schema already has the column.** Every `concept_<role>_links` table carries `is_primary`,
  with the comment "is_primary = 0 marks synonym lexemes for the same concept"
  ([`db.ts:189`](../../../../../packages/backend/src/db.ts#L189)). Nothing writes a 0: the seeder's link
  statement hard-codes it ([`seed.ts:21`](../../../../../packages/backend/src/seed.ts#L21),
  `VALUES (?, ?, 1)`), and each concept gets one lexeme per language
  ([`seed.ts:124`](../../../../../packages/backend/src/seed.ts#L124)).
- **Every reader already filters on `is_primary = 1`**, so secondary lexemes are invisible to
  rendering and labels by construction: the five `lookup*` queries in
  [`lexicon.ts`](../../../../../packages/backend/src/lexicon.ts#L37) (L37, 75, 146, 168, 190),
  `LABEL_SQL` and the pronoun/gender queries in [`index.ts`](../../../../../packages/backend/src/index.ts#L94).
  Nothing enforces **one** primary per concept and language, though — `lookupVerb` takes `.get()`,
  the first row.
- **`synonym` is not this.** It is one English string per concept
  ([`types.ts:32`](../../../../../packages/backend/src/concepts/types.ts#L32),
  [`Concept.synonym`](../../../../../packages/shared/src/index.ts#L573)), *shown* in parentheses as a
  disambiguating gloss and only beside English
  ([`useConceptLabel.ts:26`](../../../../../packages/frontend/src/i18n/useConceptLabel.ts#L26)). It is
  also searched, which is why STATE's `synonym: 'condition'` already finds it — but a word put there
  to be found is a word shown ("speak (talk)"), and it cannot say anything in Italian.
- **The three haystacks:**
  - picker: [`useConceptSearch`](../../../../../packages/frontend/src/i18n/useConceptLabel.ts#L51),
    `word(concept) + reading + label + synonym`, used by
    [`usePickerKeys.ts:63`](../../../../../packages/frontend/src/components/PhraseBuilder/hooks/usePickerKeys.ts#L63);
  - console completion: [`complete.ts:644`](../../../../../packages/frontend/src/console/language/complete.ts#L644);
  - console resolution: the ordered rules of [`resolveWord`](../../../../../packages/frontend/src/console/language/resolve.ts#L117),
    the last of which is the synonym (L139).
- **A test pins the one-lexeme shape**: [`seed.test.ts:75`](../../../../../packages/backend/src/seed.test.ts#L75),
  "links every %s to one primary lexeme per language", counts `<role>_lexemes` as concepts × 7.

## Design

### D1. Lexeme rows, not a string list on the concept

1. **Secondary lexeme rows** (`is_primary = 0`) — the model the schema was built for; a later
   in-language `*_relations` edge (`synonym`, already in the `CHECK`) can point at them.
2. **A JSON column of search strings** on `semantic_concepts` — cheaper, and a second place for words
   to live beside the lexeme tables.

**Recommendation: (1).** The column exists, every reader already ignores it, and a lemma is what the
lexeme table stores.

### D2. A secondary lexeme is a lemma, not a paradigm

It is found, never rendered. **Recommendation: store the lemma only** — `lemma` (or a noun's
`singular`, plural `NULL`), plus the `base` form row verbs, adjectives and adverbs keep so
[`seed.test.ts:109`](../../../../../packages/backend/src/seed.test.ts#L109)'s invariant still holds.
**No pronouns**: their lexeme rows carry person and number, and a pronoun is found by its person.

Seed shape, on [`ConceptSeed`](../../../../../packages/backend/src/concepts/types.ts#L3):
`aliases?: Partial<Record<LanguageCode, string[]>>`. A Japanese alias that needs a kana search lists
the kana as a second alias (`['喋る', 'しゃべる']`) — no reading column for a word never shown.

### D3. The API ships them; labels do not change

`Concept.aliases?: Partial<Record<LanguageCode, string[]>>` on the response
([`index.ts:202`](../../../../../packages/backend/src/index.ts#L202)), from one `ALIAS_SQL` over the five
link tables `WHERE is_primary = 0`. `labels` stays the primary lemma. **Recommendation:** ship all
languages, as `labels` does, so the picker can match the English alias while browsing in another
language (the rule `useConceptSearch` already follows for the label and the gloss).

### D4. Search and the console

- Picker: the haystack gains `aliases[uiLanguage]` and `aliases.en`.
- Console completion: the same two in `hay`.
- `resolveWord`: one rule **after** the synonym — an exact alias in `vocab.language` or English.
  Last, so an alias never outranks a concept whose label is the word; two concepts sharing an alias
  come back `ambiguous`, as two labels do. `printWord` is untouched: it prints the label.

**Recommendation: no "matched as …" hint in the list for v1.** The row shows the primary word, its
emoji and its tooltip; if user testing shows *cominciare* → "iniziare" confuses, add the matched alias
in the synonym's parentheses as a follow-up.

### D5. The first data

Only aliases the corpus already records as folded, each checked in the seed file before it is added:

| concept | aliases | why |
|---|---|---|
| SPEAK | en *talk* | P09 §2: TALK → SPEAK, no concept |
| RETURN | en *come back* | P09 §2: COME_BACK → RETURN |
| BEGIN | it *cominciare*, de *anfangen*, es *comenzar* | the everyday doublets of its primaries |

**Recommendation:** start with these, and add aliases the way concepts are added — when someone
misses one — rather than sweeping a thesaurus in. Each alias must be a word a dictionary gives for
*this* sense; an alias shared by two concepts (BEGIN and START in the labile languages) is fine and
resolves as ambiguous.

## 1. Backend

- [`concepts/types.ts`](../../../../../packages/backend/src/concepts/types.ts): `aliases` (D2).
- [`seed.ts`](../../../../../packages/backend/src/seed.ts): a second link statement with
  `is_primary = 0`, and a loop after the primary one inserting each alias lexeme (lemma, base row,
  link). The primary statement keeps its literal 1.
- [`index.ts`](../../../../../packages/backend/src/index.ts): `ALIAS_SQL`, `aliases` on each concept.
- [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts): `Concept.aliases`, doc
  comment saying it is search-only and never rendered.

## 2. Frontend

`useConceptSearch`, `complete.ts`'s `hay`, `resolveWord`'s rule list (D4).

## Tests

- `seed.test.ts`: the count at L75 becomes primaries only (`WHERE is_primary = 1` joined to
  lexemes), plus **exactly one primary per concept and language** — the constraint the schema cannot
  state — and a test that every alias has a lexeme and a base row.
- `lexicon.test.ts`: a concept with an alias still renders its primary in every language.
- `index.test.ts`: `/api/concepts` carries `aliases`; `labels` is unchanged for the same concept.
- Frontend: a picker test typing *talk* finds SPEAK
  (`test/SlotTypeahead.test.tsx` or a `useConceptSearch` unit test); `test/console/complete.test.ts`
  completes *talk*; a resolve test for an alias hit and for an alias shared by two concepts
  (`ambiguous`).
- The console round trip (`test/console/roundTrip.test.ts`) stays green: nothing prints an alias.

## Verification

1. `npm run build -w @signi/shared`; `npm run seed` (**reseed** — new rows); backend boots.
2. Backend and frontend suites green; typecheck clean.
3. In the browser (5173): English UI, the verb picker, type *talk* → SPEAK; Italian UI, type
   *cominc* → BEGIN (shown as *iniziare*); the translation of a plan with BEGIN is unchanged.

## Out of scope (follow-ups)

- **The matched-alias hint** in the picker row (D4).
- **In-language `*_relations` edges** (`synonym` / `related`) between a primary and its aliases —
  the tables exist and are empty; nothing reads them.
- **Rendering an alias as a style choice** (*talk* for SPEAK in informal English) — a register
  feature, not a search one.
- **P09 README's example**: "begin finds START" should read "talk finds SPEAK" when the orchestrator
  next edits the follow-up row.
