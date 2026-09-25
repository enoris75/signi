# P10. Alemannic — Swiss German (*Schwyzerdütsch*) as an output language

**Feature:** Swiss German (`gsw`) renders every phrase the other languages render, as a row in the
translations panel and, once complete, as an interface language.
**Shape:** a new engine folder `packages/engine/src/languages/gsw/` **forked from `de`**, a Swiss
German column in every concept of the corpus, and the groundwork of
[P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language) / [P04
§0](../P04-romansh/README.md#0-groundwork) (single language list, no database CHECK, a
`preview`/`ready` language status, ready-only test gating). Whichever of P03, P04 and P10 ships first
carries that groundwork.
**Status:** planning. Every decision below is **proposed**, not confirmed. Split into **E1–E15**
(2026-09-25), one per phase step and per construct — see [§7](#7-tasks-e1e15).

> **The framing problem, before any decision: Swiss German is not a written language.** The written
> language of German-speaking Switzerland is Standard German, and the corpus already has it as `de`.
> Swiss German is a spoken variety with no orthography, no academy, no dictionary of record and no
> official status. A `gsw` column is therefore a column of **transcribed speech**, which is a new
> category for this project: every other language's column is writing that someone could be wrong
> about in a checkable way. D2 is where that problem gets a policy.

| construction | Zürichdeutsch, Dieth spelling *(verify throughout)* |
|---|---|
| the cat eats the mouse | d Chatz frisst d Muus |
| the cat ate the mouse | d Chatz **hät** d Muus **gfrässe** — perfect; there is no preterite (D5) |
| the (female) cat went | si **isch ggange** — *sii* auxiliary |
| the cat will eat the mouse | d Chatz frisst d Muus (**morn**) — present + adverb, no future tense (D8) |
| the cat does not eat the mouse | d Chatz frisst d Muus **nöd** *(Bern* nid*, Basel* nit*)* |
| we eat | **mir ässed** *(Zurich* -ed*; Bern* mir ässe*)* |
| one eats the mouse | **me** frisst d Muus |
| the man, the water | **de** Maa, **s** Wasser |
| the father's house | **em Vatter sis Huus** — possessor dative; there is no genitive (D7) |
| the man who is coming | de Maa, **wo** chunt — invariant *wo* (D10) |
| the cat is eating | d Chatz **isch am Frässe** — grammaticalized progressive (D9) |
| if the dog ran, … | wenn de Hund **würd springe**, … *(verify against synthetic* chäm*-type forms)* |

## Why this is a good engine target

Not because it is close to `de` — because it differs from `de` in exactly the dimensions the engine
already models, so each difference is a real test rather than a lexical swap:

| dimension | Standard German (`de`) | Swiss German (`gsw`) |
|---|---|---|
| past tense | preterite **and** perfect | **perfect only** — the preterite is gone (*Präteritumschwund*) |
| case | four, genitive included | **three**, nom/acc largely merged, **no genitive** |
| future | *werden* + infinitive | **none** — present carries it |
| progressive | none; the engine fudges it | ***am* + infinitive**, fully grammaticalized |
| relative pronoun | declined *der/die/das* | **invariant *wo*** |
| possession | genitive, *von* + dative | **possessor dative** (*em Vatter sis Huus*) |

Three of those make `gsw` **smaller** than `de`, and one (the progressive) lets it render an aspect
`de` cannot. That combination is unusual and worth having in the suite.

It is also spoken by roughly five million people, is the everyday language of German-speaking
Switzerland at every register including broadcast, and is served badly by general translators, which
consistently emit Standard German when asked for it.

---

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | Which dialect? | **Zürichdeutsch**, one dialect, not several. | The largest speaker base and the most-heard variety in broadcast, so the best-documented and the easiest to find a reviewer for. **This is deliberately not [P04](../P04-romansh/README.md)'s answer**, and the asymmetry is the reason: Romansh got three peers because it *has* three written standards, each with its own dictionary and its own body of readers to be wrong in front of. Swiss German has no written standard at all, so there is no authority for a second column to be a peer *of* — a Bärndütsch column would be a second transcription, not a second standard. If the peer treatment is wanted anyway, **Bärndütsch** is the natural second (the strongest literary tradition, from Gotthelf to Mani Matter) and **Baseldytsch** the third. Walliserdeutsch is the outlier and may not even be `gsw` — ISO assigns Walser its own code, `wae`. |
| D2 | Which orthography? | **Dieth-Schreibung** (Eugen Dieth, *Schwyzertütschi Dialäktschrift*, 1938; 2nd ed. 1986). | The only systematic proposal: phoneme-based, consistent, and derivable by rule, which is what an engine needs. The alternative is the loose Standard-German-flavoured spelling people actually write in chat and advertising, which is what readers expect to see but which has no rule to follow and no way to be wrong. **This decision is visible on every single string in the language**, so it deserves a real ruling rather than a default, and it should be recorded in the language's description in the panel. |
| D3 | Code | **`gsw`**, plain. | Verified against the IANA Language Subtag Registry: `gsw`, descriptions *Swiss German*, *Alemannic*, *Alsatian*, added 2006-03-08, `Suppress-Script: Latn`. Two traps: **`de-CH` would be wrong** — that is Standard German as written in Switzerland, which is nearly what `de` already is — and **`als` is Tosk Albanian**, so the Alemannic Wikipedia's use of it is a known misassignment, not a precedent. **There are no registered variant subtags with `Prefix: gsw`** (checked), so unlike P04's `rm-rumgr`/`rm-sursilv`/`rm-vallader` there is no standard way to mark the dialect: it would take a private-use tag (`gsw-CH-x-zueri`) or an invented one. Recommendation: stay on plain `gsw` and name the dialect in the label and description. |
| D4 | Flag | **The arms of Zürich** (*per bend argent and azure*) as an inline SVG, not 🇨🇭. | Follows [P04 D3](../P04-romansh/README.md#decisions), which gives the three Romansh rows the arms of the Three Leagues rather than the Swiss flag: a row that carries one regional variety is labelled by its region, not by the country. 🇨🇭 is in fact free now that P04 has given it up, but it would claim to stand for all of Swiss German when the column is one dialect (D1) — the arms of Zürich say which one. A practical bonus: *per bend* is two flat triangles, so unlike P04's ibex it renders cleanly at 16px. Needs the same `Flag` component widening from P03 D3; whichever plan lands first builds it, and the other inherits it. |
| D5 | What fills `past` | The **perfect**: *haa*/*sii* + participle. No stored preterite. | Swiss German has no preterite at all. This is not a stylistic preference as in [P03 D2](../P03-catalan/README.md) or [P04 D5](../P04-romansh/README.md#decisions) — the forms do not exist. Auxiliary choice is per verb: reuse the existing `aux: 'be'` key in [`concepts/verbs/nonfinite.ts`](../../../../packages/backend/src/concepts/verbs/nonfinite.ts), which `de` and `it` already read. **Consequence:** the six `*_past` cells per verb are simply not seeded — see §1. |
| D6 | Past vs resultative | Accept that **neutral past and resultative render the same**. | With only one past construction there is nothing to tell "he went" from "he is gone". Same collision as [P04 D6](../P04-romansh/README.md#decisions); document it, do not file it as a bug. |
| D7 | Case system | **Nominative/accusative merged, dative distinct, no genitive.** | Possession is the **possessor dative** (*em Vatter sis Huus*) or *vo* + dative. In engine terms `de`'s [`genitiveS.ts`](../../../../packages/engine/src/languages/de/genitiveS.ts), [`genitiveShows.ts`](../../../../packages/engine/src/languages/de/genitiveShows.ts) and [`modifierGenitives.ts`](../../../../packages/engine/src/languages/de/modifierGenitives.ts) get **no `gsw` counterpart**, and `declineAdj`/`endingsFor`/`datPluralN` shrink to a smaller table. |
| D8 | Future | **Present tense**, with the temporal adverb carrying the reference. | *Werde* + infinitive is marginal and reads as Standard German. So `de`'s `WERDEN` machinery has no counterpart, and the `future` slot renders the present. The reviewer rules on whether a bare present is acceptable where the phrase has no temporal adverb to lean on. |
| D9 | Progressive aspect | ***am* + infinitive** (*ich bi am Ässe*). | Fully grammaticalized, unlike anything in `de`. This is the one place `gsw` is **richer** than its parent, and it should get a real implementation rather than being folded into the present. |
| D10 | Relative pronoun | **Invariant *wo***. | *De Maa, wo chunt* / *d Frau, wo ich gsee*. Replaces `de`'s declined `der/die/das` wholesale — a large simplification, and one of the clearest markers that this is not German. |
| D11 | Verb cluster order | Phase 3 emits **`de`'s order**, as a documented gap, until the reviewer rules. | Swiss German verb raising differs from Standard German (*wo-n-i ha müese gah* against *als ich habe gehen müssen*), and the orders are partly optional and partly dialect-specific. This is the hard part of the language and the analogue of [P04 D9](../P04-romansh/README.md#decisions). It touches [`modalStack.ts`](../../../../packages/engine/src/languages/de/modalStack.ts) and [`modalVerbGroup.ts`](../../../../packages/engine/src/languages/de/modalVerbGroup.ts). |
| D12 | Diminutives | **Out of scope** for the engine; a `-li` diminutive is a lexical choice per noun, not a productive rule the plan applies. | *Hüsli*, *Chätzli* are pervasive and pragmatically loaded. Deriving them automatically would change register unpredictably. |
| D13 | Where the row sits | Append at the end. | `LANGUAGES`'s key order is the row order; appending keeps every existing test's order intact. Coordinate with P03 D7 and P04 D12 if they land first. |

## 0. Groundwork

As [P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language), with [P04
§0.3](../P04-romansh/README.md#03-the-database-refuses-unknown-languages)'s correction: the six
`CHECK (language IN (…))` sites are five lexeme tables **plus `concept_definitions`**, at
[`db.ts:82`](../../../../packages/backend/src/db.ts#L82), `:94`, `:101`, `:110`, `:120`, `:127`.

`gsw` is three letters, so if P04 has not already landed its hyphenated codes, P10 is the first
language whose code is not two letters. [P04 §0.1](../P04-romansh/README.md#01-hyphenated-codes)
surveyed this: no length or pattern assumptions on language codes exist in `packages/*/src`.

Swiss-German-specific additions:

- **Language list:** `LanguageCode` and `LANGUAGES` gain `gsw`; [`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts) gains `'language.gsw'`;
  [`translator/translator.consts.ts`](../../../../packages/engine/src/translator/translator.consts.ts) registers `swissGermanEngine`.
- **Language-name concept:** a new `SWISS_GERMAN` concept (`isA: 'LANGUAGE'`, `countable: false`),
  plus a `gsw` form on every existing language name. In Swiss German itself: *Schwyzerdütsch*
  (Zurich) *(verify against* Schwiizerdütsch*,* Schwizerdütsch *— D2 decides the spelling)*.
- **Label:** the row must say which dialect and which spelling, because neither is recoverable from
  the text. *Swiss German (Zürich)* in the selector, with the orthography in the description.
- **Status:** ships `preview` and stays there until §4's review is done.

## 1. Data — what a Swiss German column costs

Measured against `packages/backend/signi.db`, using German as the baseline. **Stale:** the corpus has
since grown to 784 concepts and 3,869 `de` form rows; [E4](P10-E4-corpus-column.md#today) has the
2026-09-25 measurement (about 3,400 `gsw` values).

| role | concepts | `de` form rows | `gsw` estimate | why it differs |
|---|---|---|---|---|
| verb | 117 | 1,692 | **~990** | D5 drops six `*_past` cells per verb: **702 values that are simply not seeded** |
| noun | 220 | 346 | **~330** | D7 drops the 16 `genitive` forms; `compound` (62) and `count` (220) carry over |
| adjective | 105 | 123 | ~123 | agreement is reduced but present |
| pronoun | 4 | 26 | ~26 | |
| **total** | **463** | **2,187** | **~1,470** | plus 463 lexeme rows carrying 2–3 text values each |

**About 2,400 values** — the **cheapest new language in any current plan**, roughly 15% less than
German and well under [P04](../P04-romansh/README.md#1-data--what-three-romansh-columns-cost)'s
~2,900 per Romansh variety. The tense and case losses are most of the saving.

High-frequency irregulars settle first: *sii* (*ich bi, du bisch, er isch, mir sind, ir sind, si
sind*), *haa* (*ich ha, du hesch, er hät, mir händ, ir händ, si händ*), *gaa, choo, tue, wüsse,
chöne, wele, müese, mache, gsee* *(verify every cell)*.

**Lexical distance is the hidden cost.** A `gsw` column is not a respelling of the `de` column: *Chatz*
for *Katze* is, but *luege* (look), *schaffe* (work), *zügle* (move house), *poschte* (shop) and
*hoi* are different words. Roughly a third of everyday vocabulary needs independent authoring rather
than transformation *(estimate — worth measuring on a 50-concept sample before committing to phase 1)*.

## 2. The engine — `packages/engine/src/languages/gsw/`

A **fork of `de`**, which is the largest engine in the package: **75 source files, 2,430 LOC** (102 files,
4,163 LOC at 2026-09-25 — see [E5](P10-E5-engine-fork-noun-phrase.md#today)), plus
its colocated tests. Expect `gsw` to come in **smaller, around 60 files and ~1,900 LOC**, because
three of `de`'s subsystems have no counterpart.

| `de` machinery | in `gsw` |
|---|---|
| verb-second, the verb brace, `nichtSlots`, `finiteNegation`, `complementsWithNicht` | **carries over**, with *nöd* for *nicht* |
| `particleGap`, `compoundStem`, `germanCompound` | **carries over** |
| `declineAdj`, `endingsFor`, `determiner`, `defArticle`, `indefArticle`, `prepDet` | **shrinks** — three cases, merged nom/acc (D7) |
| `genitiveS`, `genitiveShows`, `modifierGenitives`, `possessorText` | **gone** — replaced by a possessor-dative builder (D7) |
| the `WERDEN` future | **gone** (D8) |
| preterite rendering | **gone** (D5); the `past` slot routes to the perfect, on `it`/`de`'s `aux` selection |
| `prospectiveFrame` and the aspect handling | **grows** — a real *am* + infinitive progressive (D9) |
|  [`relativePronoun`](../../../../packages/engine/src/languages/de/relativePronoun.ts) | **collapses** to invariant *wo* (D10) |
| `modalStack`, `modalVerbGroup` | **carries over, with the wrong order** until D11 is ruled on |

The clean way to read that table: `gsw` is `de` minus the genitive, minus the preterite, minus the
future, minus relative pronoun declension, plus one aspect. Every one of those five is a place the
engine's abstractions get tested by removal, which is rarer and more informative than testing them by
addition.

## 3. Interface

- **Typeahead:** the corpus gains *ä, ö, ü* only, which `de` already has. No folding work beyond what
  exists.
- **Four Swiss-adjacent rows** if P04 lands (D4): three Romansh varieties under the Three Leagues'
  arms, plus `gsw` under Zürich's. With the country flag out of the way none of them collide, but the
  panel now carries four regional emblems a reader is unlikely to know on sight, so the row label
  does the real work in all four cases.
- **Fonts:** Lora and Inter cover it.

## 4. Testing and review

- **Suite:** `packages/engine/test/languages/gsw.test.ts`, growing phase by phase; known defects in
  `test.fails` blocks.
- **Reviewer:** one native Zürichdeutsch speaker who is willing to be consistent about D2's
  orthography — which is a stronger requirement than it sounds, because most native speakers have
  never written their dialect systematically and will disagree with themselves across a long sheet.
  Budget for an orthography calibration pass on a 50-string sample **before** the full review.
- **Scope of the review:** conjugation cells, **483 UI strings**, **148 engine-composed definitions**
  and the suite's sentences — about **630 strings**, as measured in
  [P04 §4](../P04-romansh/README.md#4-testing-and-review).
- **Promotion** requires sign-off. Every *(verify)* is confirmed or corrected in the suite first.

## 5. Phases

| # | Ships | Done when |
|---|---|---|
| 0 | P03 §0 groundwork if not already shipped; `gsw` registered, language-name concept, label and description naming dialect and orthography | the backend boots with `gsw` as `preview` and the panel shows an empty row |
| 1 | Nouns, adjectives, pronouns, present tense; articles and the three-case determiner system; verb-second and the verb brace | the basic clause and noun-phrase sentences render in the `gsw` suite |
| 2 | Verb group: the perfect with auxiliary selection (D5), present-as-future (D8), *nöd* negation, the *am* progressive (D9), modals, copula, degree | conjugation cells match the draft review sheet |
| 3 | Clause and complements: complements, invariant *wo* relatives (D10), coordination, possessor dative (D7), conditional, imperative, infinitive | every sentence suite has a `gsw` expectation under the preview gate |
| 4 | **Review**: orthography calibration, then the full sheet; every *(verify)*, D2 and D11 ruled on | the review sheet is signed off |
| 5 | **Promotion**: UI strings and definitions render, `gsw` in exhaustive tests and snapshots, status → `ready` | Swiss German is selectable as the interface language |

## 6. Risks

- **There is no right answer to be checked against** (D2). Every other language in the corpus can be
  wrong in a way a dictionary settles. Swiss German cannot. The mitigation is to pick Dieth, say so in
  the panel, and treat internal consistency as the standard — but this is a genuinely weaker
  correctness guarantee than the project has anywhere else, and it should be stated in the README
  rather than discovered by a user.
- **The reviewer has to be trained, not just found.** See §4. An inconsistent reviewer is worse than
  none, because their corrections become test pins.
- **`de` is right there.** A reader who wants Swiss German and gets something 80% Standard German will
  judge the whole engine by it, and the failure mode of a thin `gsw` column is exactly that: it
  regresses toward `de` word by word. The lexical-distance measurement in §1 should happen before
  phase 1, not during it.
- **Dialect leakage.** Zürichdeutsch forms will get corrected by Bernese or Basel reviewers if the
  reviewer pool is not held to D1. Label the row with the dialect.
- **Regional emblems are unfamiliar** (D4). Zürich's arms and P04's league arms are correct and distinguishable, but few readers outside Switzerland will recognise any of them, so neither plan can lean on the icon to identify the row.
- **Verb cluster order** (D11) may turn out to be required rather than optional, in which case it
  touches the modal stack and the subordinate clause builder, and that work is outside phase 3.

## 7. Tasks (E1–E15)

Filed 2026-09-25, verified against HEAD 7a392187. Decision numbers are this README's. E3 gates the
bulk seeding; E14 needs a calibrated reviewer; everything else is engine or data work in phase order.

| task | phase | what | shape |
|---|---|---|---|
| [P10-E1](P10-E1-language-groundwork.md) | 0 | Groundwork: single language list, no DB CHECK (**seven** sites now), `preview`/`ready`, test gating; `gsw` registered as an empty `preview` row | P03 §0 / P04 §0, only if neither shipped first |
| [P10-E2](P10-E2-row-identity.md) | 0 | The row's identity: `SWISS_GERMAN`, *Swiss German (Zürich)*, the Dieth description, the arms of Zürich | one concept, the `Flag` widening (D1–D4) |
| [P10-E3](P10-E3-orthography-and-lexical-sample.md) | before 1 | A Dieth style sheet, a 50-concept lexical-distance sample, the reviewer's calibration | no code; gates E4 (§1, §4, §6) |
| [P10-E4](P10-E4-corpus-column.md) | 1–3 | The `gsw` column on all 784 concepts, in batches; no `*_past`, no genitive | data + the seeding skills (D5, D7) |
| [P10-E5](P10-E5-engine-fork-noun-phrase.md) | 1 | Fork `de`; the noun phrase in three cases, clitic articles, genitive machinery deleted | the fork (§2, D7) |
| [P10-E6](P10-E6-clause-core-present-and-noed.md) | 1–2 | Present tense, verb-second, the brace, *nöd*, *me*, a `de`-leak guard | carry-over + the negator |
| [P10-E7](P10-E7-perfect-for-past.md) | 2 | `past` = the perfect with *haa/sii*; `past` = `resultative` pinned | routing (D5, D6) |
| [P10-E8](P10-E8-present-for-future.md) | 2 | `future` = the present; `WERDEN` gone, the prospective kept | routing (D8) |
| [P10-E9](P10-E9-am-progressive.md) | 2 | *isch am Frässe* — the aspect `de` lacks | new construction (D9) |
| [P10-E10](P10-E10-modals-and-verb-clusters.md) | 2 | Modals, copula, degree; `de`'s cluster order shipped, the Swiss one pinned `test.fails` | carry-over + a gap (D11) |
| [P10-E11](P10-E11-invariant-wo-relatives.md) | 3 | Invariant *wo*; resumptives for oblique roles | `relativePronoun` collapses (D10) |
| [P10-E12](P10-E12-possessor-dative.md) | 3 | *em Vatter sis Huus* / *s Huus vom Vatter* | new builder (D7) |
| [P10-E13](P10-E13-remaining-clause-suite.md) | 3 | The sweep: complements, coordination, conditional, imperative, infinitive — a `gsw` line in every suite | carry-over, per suite |
| [P10-E14](P10-E14-review.md) | 4 | The full review sheet; every *(verify)*, D2, D8, D11 ruled on | docs + pins |
| [P10-E15](P10-E15-promotion.md) | 5 | `ready`: UI strings and definitions in `gsw`, exhaustive tests, interface language | the status flip |

## Out of scope

Bärndütsch, Baseldytsch, Walliserdeutsch (which may be `wae`, not `gsw`) and every other dialect;
Alsatian and Swabian, which share the `gsw` and `swg` codes but not the country; productive
diminutives (D12); the *gaa/choo/laa/aafaa* verb-doubling construction (*ich gang go poschte*);
Swiss German `concept_definitions` text beyond the engine-composed definitions.
