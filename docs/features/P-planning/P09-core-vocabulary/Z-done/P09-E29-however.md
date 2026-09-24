# P09-E29. *However* — a parenthetical adversative connector

**Construct:** a clause connector that contrasts like *but* and is set off like *that is*.
**Shape:** one new `CoordConjunction` value, parenthetical in the languages whose word is an adverb.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — the seventh `CoordConjunction`, `however`, in the engine for
all seven languages and on the canvas's conjunction menu and the console's `/join`; see
[Done](#done). Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *however* (rank 305).

| lang | the cat runs; **however**, the dog eats (engine, 2026-09-24) | … **but** the dog eats (engine) | … **that is** … (engine) |
|---|---|---|---|
| en | the cat runs; however, the dog eats. | the cat runs, but the dog eats. | the cat runs, that is, the dog eats. |
| it | il gatto corre; tuttavia, il cane mangia. | il gatto corre, ma il cane mangia. | il gatto corre, cioè il cane mangia. |
| fr | le chat court ; cependant, le chien mange. | le chat court, mais le chien mange. | le chat court, c'est-à-dire le chien mange. |
| de | der Kater läuft; der Hund frisst jedoch. | der Kater läuft, aber der Hund frisst. | der Kater läuft, das heißt, der Hund frisst. |
| es | el gato corre; sin embargo, el perro come. | el gato corre, pero el perro come. | el gato corre, es decir, el perro come. |
| pt | o gato corre; no entanto, o cão come. | o gato corre, mas o cão come. | o gato corre, isto é, o cão come. |
| ja | 猫は走ります。しかしながら、犬は食べます。 | 猫は走ります。しかし、犬は食べます。 | 猫は走ります。つまり、犬は食べます。 |

All three columns are engine output; the first was the proposal and landed character for character
(the French space before `;` is a no-break space, U+00A0).

## Done

Shipped 2026-09-24. `CoordConjunction` gained `'however'` (and `COORD_CONJUNCTIONS` with it). Each
engine's `COORD_WORDS` spells it — *however, tuttavia, cependant, jedoch, sin embargo, no entanto,*
しかしながら — and:

- **en / es / pt** add it to `PARENTHETICAL_CONNECTORS` (the comma after it) and write `;` before it
  instead of `,`.
- **it / fr**, which had no parenthetical set, write `; X, ` inline; French sets the semicolon off by
  a no-break space, as its question mark already is.
- **de**: `COORD_INVERTS.however = false`, and `germanEngine.render` renders the second clause with a
  new engine-internal `ResolvedPhrase.postFiniteAdverb` = *jedoch*, which `renderClause` places right
  behind the finite verb — behind an object pronoun, which leads the Mittelfeld — and joins the two
  clauses with `;`. A clause with no V2 slot (verbless) takes *jedoch* in front instead.
- **ja** needed only its word: the adversative already opens a new sentence (A122).
- **Not under a command.** `however` is not in `IMPERATIVE_COORD_CONJUNCTIONS`, so the translator's
  existing fallback joins two commands with *and* (pinned by equality) and the menu does not offer it
  under a command.

Engine output, pinned in [`coordination.test.ts`](../../../../../packages/engine/test/coordination.test.ts)
(*adversative adverb — "however"* and the German row):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| cat runs / dog eats | the cat runs; however, the dog eats. | il gatto corre; tuttavia, il cane mangia. | le chat court ; cependant, le chien mange. | der Kater läuft; der Hund frisst jedoch. | el gato corre; sin embargo, el perro come. | o gato corre; no entanto, o cão come. | 猫は走ります。しかしながら、犬は食べます。 |
| menu label (`translateConjunction`) | however | tuttavia | cependant | jedoch | sin embargo | no entanto | しかしながら |

German placement, pinned:

| second clause | de |
|---|---|
| a subject of several words, a noun object | der Kater läuft; der große Hund frisst jedoch das Essen. |
| an object pronoun | der Kater läuft; der Hund frisst es jedoch. |
| future (auxiliary + infinitive) | der Kater läuft; der Hund wird jedoch das Essen fressen. |
| a question (V1 in both clauses) | läuft der Kater; frisst der Hund jedoch? |

What landed differently from the plan:

1. **It reached the frontend** (per P09-E20's precedent: a new value on a list a control reads).
   The canvas's conjunction menu and the coordination badge read `COORD_CONJUNCTION_OPTIONS`, so
   `however` got a row, a key and two UI strings — no new concept, no reseed:
   - `conjunction.value.however` — `{ conjunction: 'however' }`, capitalized (*However, Tuttavia,
     Cependant, Jedoch, Sin embargo, No entanto,* しかしながら), and
   - `conjunction.kind.however` — the existing `ADVERSATIVE` adjective, the kind *but* already names;
   - menu key **H** (`COORD_CONJUNCTION_KEYS`);
   - the console's `/join` values (`COORD_VALUES`: `however`, described "adversative") and the
     `/join` usage line in `help.ts`.
   Frontend tests updated: `ConjunctionMenu.test.tsx` (the row list, and a new "takes however by its
   H"), `console/complete.test.ts` (the `/join` candidates, and a new apply → print round trip for
   `/join however`), `console/diagnostics.test.ts` (the `joinTakes` list). A new e2e case in
   `e2e/period-links.spec.ts` links two periods with *However* through the menu (spec run alone,
   6/6 green).
2. **German inverts nothing and needs no V2 decision** — *jedoch* is placed in the Mittelfeld by the
   clause renderer, so the task's "verb-second check with a subject that is not the first word" is
   the multi-word-subject row above (*der große Hund frisst jedoch*).
3. **French typography:** a no-break space before `;`, matching the engine's `" ?"`.
4. **The test tool's random conjunction list** (`engine/test/tools/randomPhrase.ts`) includes it.

## Why

*However* is the written English adversative. It is not *but*: it is an adverb that stands inside
the second clause, and German shows it by word order (*der Hund frisst jedoch*, or *jedoch frisst
der Hund* with verb-second inversion, since *jedoch* in the Vorfeld counts as a constituent).

## Today

Verified at 1229928, 2026-09-24 (before this task).

- [`CoordConjunction`](../../../../../packages/shared/src/index.ts#L1661) was `and | or | but |
  that_is | therefore | then`; `that_is` is in `PARENTHETICAL_CONNECTORS`
  ([`en.consts.ts:178`](../../../../../packages/engine/src/languages/en/en.consts.ts#L178)), which sets
  it off by commas on both sides. Japanese already writes the adversative as a new sentence with
  しかし (probed, second column).

## Design

### D1. A value or a flavour of *but*?

**Accepted: a value, `however`**, parenthetical in en/it/fr/es/pt (a comma after it) and ja
(しかしながら), and in German placed **after the finite verb** of the second clause (*frisst jedoch*),
which is the ordinary adverb slot and avoids the verb-second question.

### D2. The semicolon

English, French, Spanish and Portuguese write *however* after a semicolon or a full stop, not a
comma. **Accepted: a semicolon before it** in the five European languages that write the
connector first (French spaced, per its typography), and in German. Japanese keeps its sentence
break, as for しかし.

## Engine

- `shared`: the value; `PARENTHETICAL_CONNECTORS` in every engine that fronts it.
- German: the connector as an adverb after the finite verb.

## Tests

`coordination.test.ts`: one row per language; the German placement with a subject that is not one
word.

## Verification

Engine suite green; the console's connector completion lists it.

## Out of scope (follow-ups)

- ***Though* as a sentence adverb** ("the dog eats, though") — the same connector at the end in
  English only; [P09-E27](../P09-E27-until-since-though.md) takes *though* as a conjunction.
