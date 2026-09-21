# P04. Romansh — three written standards as three output languages

**Feature:** Romansh, the fourth national language of Switzerland, joins the corpus as **three separate
languages** — Rumantsch Grischun, Sursilvan and Vallader — each with its own code, its own lexical
column, its own engine folder and its own reviewer. Each renders every phrase the other languages
render, as a row in the translations panel and, once complete, as an interface language.

**Shape:** three new engine folders under `packages/engine/src/languages/`, three Romansh columns in
every concept of the corpus, inline-SVG flags, and the groundwork of
[P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language) (single language list,
no database CHECK, a `preview`/`ready` language status, ready-only test gating). If Romansh ships
before Catalan, it carries that groundwork instead.

**Status:** planning. D1–D4 are **decided** (below). The rest are proposed. Flags are D3.

> **Almost every Romansh form in this document is a draft, and the two idiom columns are mostly
> blank.** Model knowledge of Rumantsch Grischun is thin; of Sursilvan and Vallader it is thinner
> still. This plan deliberately writes `?` rather than a plausible guess: a guess that reads well is
> worse than a hole, because it survives review by not being noticed. Forms marked *(verify)* are
> ones the plan is unsure of; the others are believed correct and still go through review.
>
> Reference works: *Grammatica elementara dal rumantsch grischun* and the *Pledari Grond* (RG);
> the *Grammatica Sursilvana* and Vieli/Decurtins dictionaries (Sursilvan); the *Vocabulari
> fundamental* and Peer's dictionary (Vallader). The *Dicziunari Rumantsch Grischun* covers all
> varieties historically.

| construction | `rm-rumgr` Rumantsch Grischun | `rm-sursilv` Sursilvan | `rm-vallader` Vallader |
|---|---|---|---|
| the cat eats the mouse | il giat mangia la mieur | il gat mangia la … *?* | il giat mangia la … *?* |
| the cat ate the mouse | il giat **ha mangià** la mieur | il gat **ha mangiau** … *(verify)* | il giat **ha mangià** … *(verify)* |
| the (female) cat went | la giatta **è ida** | la gatta **ei ida** *(verify)* | la giatta **es ida** *(verify)* |
| the cat will eat the mouse | il giat **vegn a mangiar** … *(verify)* | *?* | *?* |
| the cat does not eat the mouse | il giat **na** mangia **betg** … | il gat mangia **buca** … | il giat **nu** mangia … *(verify)* |
| we eat (pronoun subject) | **nus** mangiain | **nus** mangiein *(verify)* | **nus** mangiain *(verify)* |
| one eats the mouse | **ins** mangia … | **ins** mangia … *(verify)* | **ins** mangia … *(verify)* |
| I am / he is | jau sun / el è | jeu sun / el **ei** | eu sun / el **es** *(verify)* |
| the man, the water | **l'**um, **l'**aua | *?* | *?* |
| the bread is good (predicative) | il paun è bun | il paun ei **buns** — predicative **-s** | *?* |

Three things in that table are the whole engineering argument for treating these as separate
languages rather than one with a variant switch:

1. **Three different negation shapes.** Bipartite around the finite verb (RG), single post-verbal
   (Sursilvan), single preverbal (Vallader) *(verify)*. Not three words in one slot — three shapes.
2. **Predicative adjective agreement.** Sursilvan marks a masculine predicative adjective with `-s`
   where the attributive form is bare (*in paun bun* / *il paun ei buns*). **No existing engine
   distinguishes attributive from predicative adjective forms** — see
   [`engine/src/types.ts:290`](../../../../packages/engine/src/types.ts#L290), where the adjective
   hook is per-language agreement only. This is a new axis in the adjective model, and it is why
   Sursilvan cannot be a lexical column on an RG engine.
3. **Different copula and participle morphology** throughout, not derivable from one another.

---

## Decisions

| # | Question | Decision | Why |
|---|---|---|---|
| D1 | Which Romansh? | **Three, as peers:** Rumantsch Grischun, Sursilvan, Vallader. The other idioms (Sutsilvan, Surmiran, Puter) and the Jauer dialect stay out of scope. | RG is what the Confederation and the canton write official texts in, and the only variety with one complete modern dictionary and conjugator — but it is an administrative standard, not a spoken variety, and several Surselva and Engadine municipalities adopted it for schools and then reverted. Sursilvan is the largest idiom and the Rhenish pole; Vallader is the Engadine pole with its own literary tradition. The three span the real dialect continuum. Puter is close enough to Vallader (the two are often grouped as *rumantsch ladin*) that it adds little; Sutsilvan and Surmiran are small. **Treating them as peers, not as variants of RG, is the decision** — it costs three reviewers and three columns, and it avoids declaring one variety the "real" Romansh. |
| D2 | Language codes | **BCP 47 variant subtags: `rm-rumgr`, `rm-sursilv`, `rm-vallader`.** | Verified against the IANA Language Subtag Registry: `rumgr` ("Rumantsch Grischun", *Supraregional Romansh written standard*), `sursilv` and `vallader` (each *"one of the five traditional written standards or 'idioms' of the Romansh language"*), all `Prefix: rm`, all added 2010-06-29. ISO 639 offers only `roh` for Romansh as a whole, so these subtags are the only standard way to name the three. Symmetric: no variety gets the bare `rm`. **These are the first non-two-letter codes in `LanguageCode`** — see §0.1. |
| D3 | Flags | **Inline SVG arms of the Three Leagues (*Trais Ligias*) — not 🇨🇭.** The full cantonal arms of Graubünden for `rm-rumgr`; the **Grey League** for `rm-sursilv`; the **League of God's House** for `rm-vallader`. | Not 🇨🇭, which would be three identical icons, and not invented emblems either: the leagues are a real heraldic set whose historic territories map onto the varieties. The **Grey League** (*Lia Grischa*, founded 1395, capital Ilanz, holding Disentis, Lugnez, Vals and Waltensburg) **is** the Surselva — an exact match for Sursilvan. The **League of God's House** (*Chadé*, 1367, capital Chur) holds both Engadines, so it covers Vallader — though more loosely, since it also holds Puter country, Italian-speaking Bergell and Chur itself. **Rumantsch Grischun takes the full cantonal arms**, which combine all three: the supraregional standard gets the supraregional emblem. The third league, the **Ten Jurisdictions** (Davos, Klosters, Prättigau), is the German-speaking one and carries no Romansh variety — which is why only two of the three ever appear alone. Blazons, from the cantonal arms fixed in 1932: Grey League *per pale sable and argent*; Ten Jurisdictions *quarterly azure and or, a cross counterchanged*; God's House *argent, an ibex rampant sable*. Still **requires P03 D3's widening** of `FLAG` from `Record<LanguageCode, string>` to a small `Flag` component ([`frontend/src/i18n/flags.ts`](../../../../packages/frontend/src/i18n/flags.ts) is a plain string map today, and both callers render it as text). |
| D4 | Engine layout | **Three independent folders**, each free to diverge: `languages/rm-rumgr/`, `languages/rm-sursilv/`, `languages/rm-vallader/`. No shared Romansh core. | Maximum independence: a Sursilvan fix can never regress Vallader, and each folder reads as its own language like the existing seven. The cost is explicit and permanent: **~180 source files, ~6,200 LOC and ~165 colocated test files** (§2), and every shared-grammar fix applied three times. Accepted deliberately. |
| D5 | What fills `past` | The **compound past**: *haver/esser* + participle. | The simple past is extinct in speech and rare in writing in all three. Auxiliary choice is per verb: reuse the existing `aux: 'be'` key in [`concepts/verbs/nonfinite.ts`](../../../../packages/backend/src/concepts/verbs/nonfinite.ts) (it/de already select the BE auxiliary with it). The participle agrees with the subject after *esser*, like Italian `aspectVerb.ts`. Participle morphology differs per variety (RG *-à*, Sursilvan *-au*). |
| D6 | Past vs resultative | Accept that **neutral past and resultative aspect render the same**. | No variety has a second construction to tell "he went" from "he is gone". Document as a known collision, not a bug. |
| D7 | Future | **Periphrastic *vegnir a* + infinitive** *(verify in all three)*. | Regular; needs only the *vegnir* conjugation. Mirrors the German *werden* machinery in shape, not word order. |
| D8 | Negation | **Per-variety, three shapes** (see the table above). *(verify Vallader, and verify whether RG's* na *is obligatory)* | RG is structurally French *ne … pas*, so fr's `negateFinite` is its model including elision (*n'è betg*). Sursilvan and Vallader are single-particle and need their own helpers — which is exactly what three independent folders are for. |
| D9 | Word order after a fronted clause | Phase 3 renders **no inversion** in all three, as a documented gap, until the reviewers rule. | All three have verb-second tendencies from contact with German. How far each *requires* it is a reviewer question, and the answer may differ per variety. |
| D10 | Imperative persons | **2sg / 1pl / 2pl.** Formal address later. | Mirrors the other engines' three persons. |
| D11 | Lexical data source | Hand-author **only after checking each work's terms of use**; otherwise author from the grammars and have the reviewers check everything. | ~2,900 values per variety (§1) is too many to guess at and small enough to author by hand. |
| D12 | Where the rows sit | Append at the end: `…, pt, rm-rumgr, rm-sursilv, rm-vallader`. | `LANGUAGES`'s key order is the row order; appending keeps every existing test's order intact. |

## Why

- Romansh is a national language of Switzerland with about 40,000 main-language speakers, poorly served
  by general translators. A rule-based engine that gets a small corpus exactly right is worth more here
  than in any big language — and that argument applies to the varieties people actually read, not only
  to the administrative standard.
- Linguistically the three are a good test of the engine's design. Romance (articles, gender,
  agreement) but **not pro-drop**, with **generic *ins***, a **compound past** with auxiliary
  selection, and **verb-second** tendencies. Each of those exists in some engine already; Romansh
  combines them. The predicative `-s` (D-note 2 above) is genuinely new.

## 0. Groundwork

As [P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language), with the
corrections and additions below. **P03 §0's own file references are stale** — verify each before
editing.

### 0.1 Hyphenated codes

D2's codes are the first in `LanguageCode` that are not two lowercase letters. A survey found **no
length or pattern assumptions** on language codes in `packages/*/src` — no `length === 2`, no
`slice(0, 2)`, no two-letter regex. The codes flow through as opaque keys, so this looks safe. Still
on the checklist for phase 0:

- `'language.rm-rumgr'` etc. as `UI_STRINGS` keys — fine as object keys, and `t()` builds them by
  template (`t(\`language.${code}\`)`).
- The `language` TEXT column in six tables (§0.2) — no width constraint.
- Any CSS class, `data-` attribute or DOM id derived from a code — a hyphen is valid in all three,
  but check nothing splits on it.
- Row order comes from `LANGUAGES` key order, not from sorting.

### 0.2 Where the list lives

| Place | Change |
|---|---|
| [`shared/src/index.ts:3`](../../../../packages/shared/src/index.ts#L3) `LanguageCode`, [`:406`](../../../../packages/shared/src/index.ts#L406) `LANGUAGES` | Add the three codes and names. `LANGUAGES` fails typecheck until the names are there. |
| [`shared/src/uiStrings.ts:4521-4527`](../../../../packages/shared/src/uiStrings.ts#L4521-L4527) | Add `'language.rm-rumgr'` and the other two, in the `{ word: …, format: { capitalize: true }, fallback: … }` shape the seven use. |
| [`frontend/src/i18n/flags.ts`](../../../../packages/frontend/src/i18n/flags.ts) | D3: widen `FLAG` from a string map to a `Flag` component rendering either an emoji or an inline SVG. Shared with P03. |
| [`engine/src/translator/translator.consts.ts:1-18`](../../../../packages/engine/src/translator/translator.consts.ts#L1-L18) | Import and register three engines. The array order is the order of `Translation[]`. |
| [`backend/src/concepts/nouns.ts`](../../../../packages/backend/src/concepts/nouns.ts) | Three new language-name concepts (`isA: 'LANGUAGE'`, `countable: false`), plus three forms on each of the seven existing ones. See §0.5. |
| `shared/src/index.d.ts`, `shared/src/index.js` | Stale compiled copies still listing seven languages, committed to git. Delete them. |

After any change to `shared` or `engine`, rebuild them: the backend and e2e load their `dist/`, not `src/`.

### 0.3 The database refuses unknown languages

Six tables carry `CHECK (language IN ('en','it','fr','de','es','ja','pt'))`. **P03 §0.2 calls these
"all six lexeme tables" and cites the wrong lines** — there are five lexeme tables plus
`concept_definitions`, at [`db.ts:82`](../../../../packages/backend/src/db.ts#L82) (`concept_definitions`),
`:94` (verb), `:101` (noun), `:110` (pronoun), `:120` (adjective), `:127` (adverb). The tables are
created `IF NOT EXISTS` and the git-tracked `packages/backend/signi.db` already carries the
constraint, so seeding a new code into it fails.

Drop the language CHECK from all six, and have `seed.ts` validate each language key against
`LANGUAGES` instead, keeping a single list. Add a one-off migration in `db.ts` that rebuilds the six
tables when their SQL still carries the old CHECK (create, copy, drop, rename), so `saved_phrases`
survive.

### 0.4 A language must be complete before the backend boots

At startup the backend renders every UI string and every engine-composed definition into every code in
`LANGUAGES` and **throws** if one comes out empty:
[`backend/src/uiStrings.ts:66-71`](../../../../packages/backend/src/uiStrings.ts#L66-L71) and
[`definitions.ts:37-43`](../../../../packages/backend/src/definitions.ts#L37-L43). Both derive their
own `LANGUAGE_CODES` from `Object.keys(LANGUAGES)`
([`uiStrings.ts:14`](../../../../packages/backend/src/uiStrings.ts#L14),
[`definitions.ts:7`](../../../../packages/backend/src/definitions.ts#L7)).

**Proposal: a language status.** Add `LANGUAGE_STATUS: Record<LanguageCode, 'ready' | 'preview'>` and a
derived `READY_LANGUAGES` to `shared`, and have both boot checks filter on it — hoisting the duplicated
`LANGUAGE_CODES` into `shared` while we are there.

| | ready | preview |
|---|---|---|
| Translations panel | row | row, with a *preview* chip |
| Interface-language selector | listed | not listed |
| Boot-time completeness check | throws | logs what is missing, serves the English fallback |
| Exhaustive engine tests (§4) | included | excluded |

All three varieties ship `preview` from phase 1 and are promoted **independently** in phase 6: one
reviewer signing off does not wait on the other two.

### 0.5 Language-name concepts

Three new concepts — `RUMANTSCH_GRISCHUN`, `SURSILVAN`, `VALLADER` — each `isA: 'LANGUAGE'`. Names in
the seven existing languages are needed for each (English *Rumantsch Grischun*, *Sursilvan*,
*Vallader*; the others mostly borrow the same forms, with Japanese needing a reading). The existing
languages named in each variety are *(verify all)*: RG *englais, talian, franzos, tudestg, spagnol,
portugais, giapunais*. All three varieties write language names lowercase; `NAME_FORMAT` capitalises
for the UI.

### 0.6 Code that names languages one by one

These do not fail typecheck; they silently return `undefined` for a language they do not know.

- [`engine/src/mood.ts`](../../../../packages/engine/src/mood.ts): `futureStem`, `conditionalForm`,
  `subjunctiveForm` and `imperativeForm` switch on it/es/pt/fr. Each variety gets its own branches, or
  keeps them engine-local (§2.4).
- [`engine/src/possessive.ts`](../../../../packages/engine/src/possessive.ts): one function per
  language. Three more.
- `frontend/src/components/TranslationPanel.tsx`: Japanese-only font styling. Nothing to do.

### 0.7 Tests, docs and skills

As P03 §0.5 and §0.6, with the ready-only gate doing the work: `sayAll` in `engine/test/harness.ts`
renders **ready** languages only, so the ~59 exhaustive `toEqual({…7 keys…})` tests and the conjugation
snapshots are untouched until promotion. Derive `LANGUAGE_ORDER` in the frontend tests from
`LANGUAGES`, and the selector's options from the ready languages.

The **seed skill** ([`.claude/skills/seed/SKILL.md`](../../../../.claude/skills/seed/SKILL.md)) says
every language is mandatory. It should say every **ready** language is mandatory, and preview languages
are filled when known — otherwise every future `/seed` is blocked on three Romansh forms. `localize`,
`localize-seed`, `generalize`, `specialize`, `detach` and `fix-bug` hardcode the list too.

## 1. Data — what three Romansh columns cost

**The previous version of this plan was badly stale**: it claimed 233 concepts and ~1,600 values per
language. Measured against `packages/backend/signi.db` today:

| role | concepts | Italian form rows (measured) | notes |
|---|---|---|---|
| noun | 220 | 245 | plus `singular, plural, gender` on the lexeme |
| verb | 117 | 2,476 | the bulk of the work |
| adjective | 105 | 107 | plus `base` and agreement columns |
| adverb | 17 | 0 | lexeme only |
| pronoun | 4 | 27 | |
| **total** | **463** | **2,855** | plus 463 lexeme rows carrying 2–4 text values each |

A Romansh column is **smaller than Italian's on the verb** — D5 and D7 make past and future
periphrastic, so only 6 present + 6 conditional cells are stored per verb (~1,400 rows, not ~2,470) —
and about the same everywhere else. Estimate **~2,900 values per variety, ~8,700 for the three.**

High-frequency irregulars settle first, because the UI strings and definitions lean on them: *esser,
haver, vegnir, ir, far, dir, savair, pudair, vulair, stuair, vesair* — six present cells each, in three
varieties, so **~200 cells before anything else renders**.

## 2. The engines

Three folders, one function per file with a colocated test, per D4. Measured against the existing seven
(the old plan's "fr: 47 files / 1,464 LOC" is stale):

| language | source files | source LOC |
|---|---|---|
| en | 43 | 1,396 |
| it | 52 | 1,872 |
| fr | 59 | 2,050 |
| de | 74 | 2,263 |
| es | 59 | 1,784 |
| ja | 44 | 1,978 |
| pt | 55 | 1,734 |

Expect **~60 source files and ~2,050 LOC per variety**, so **~180 files and ~6,200 LOC** across the
three, plus ~165 colocated test files (fr has 55). That is a little under doubling the engine package.

There is no single sibling to copy, so each piece names its model. The table holds for all three
varieties except where noted:

| piece | model | why |
|---|---|---|
| clause, subject pronouns kept, generic subject | **fr** `renderClause`, `on` | not pro-drop; *ins* slots where *on* does |
| negation | **fr** `negateFinite` for RG only | bipartite and eliding. Sursilvan and Vallader are single-particle and need their own helper each (D8) |
| articles, contractions, agreement | **it** `artFor`, `prepDet`, `agreeAdj` | *il/la/l'/ils/las*, *al/dal* |
| compound past, participle agreement | **it** `aspectVerb.ts` | auxiliary selection by `aux`, agreement after BE |
| periphrastic future | **de** `WERDEN` table, as a pattern | an auxiliary conjugated for person, main verb non-finite |
| predicative adjective | **nothing** | new: Sursilvan needs an attributive/predicative split (see above) |

### 2.1 Noun phrase (RG; the idioms *(verify)* throughout)

- **Articles:** definite *il* (m), *la* (f), *ils*, *las*; *l'* before a vowel for both genders.
  Indefinite *in, ina*; indefinite plural bare.
- **Contractions:** *a+il → al*, *a+ils → als*, *da+il → dal*, *da+ils → dals*; *en il* stays apart
  *(verify)*. Only the definite article contracts, as in the other Romance engines.
- **Adjectives:** postnominal by default, agreement read from stored forms. **Sursilvan additionally
  needs the predicative form.**
- **Determiners:** *in/ina*; *insaquants* (some) *(verify)*; *nagin/nagina* (no) *(verify)*;
  *blers/bleras* (many); *paucs/paucas* (few); *tut ils* (all) *(verify)*.
- **Possessives:** attributive, no article, agreeing with the possessed noun: *mes giat, mia chasa, mes
  giats, mias chasas*. Three `possessive*` functions in `engine/src/possessive.ts`.
- **Degree:** *pli* (more), *il pli* (most), *main* (less), *uschè … sco* (as … as).

### 2.2 Verb group

- **Subject:** always rendered, pronoun included, in all three.
- **Tenses:** present stored; past *haver/esser* + participle (D5); future *vegnir a* + infinitive (D7).
- **Negation:** per D8, three shapes. With a negative-polarity adverb, RG *mai* replaces *betg*
  (*el na mangia mai*) *(verify)*; the idioms' behaviour here is unknown.
- **Aspect:** progressive *esser vidlonder da* + infinitive *(verify)*; prospective *esser sin il punct
  da* + infinitive *(verify)*; resultative is the compound past (D6). No gerund is needed anywhere.
- **Modals:** *stuair* (MUST), *pudair* (CAN), *vulair* (WILL). Inner modals are infinitives (*el vul
  pudair ir*), served by `modalChain` with no `link` word.
- **Copula:** a single *esser* with an agreeing predicate adjective. No ser/estar split. The 3sg is the
  sharpest variety marker: RG *è*, Sursilvan *ei*, Vallader *es* *(verify)*.
- **Pronominal verbs:** BECOME is *daventar*, a plain intransitive verb *(verify)*, avoiding the
  reflexive clitic for phase 2.

### 2.3 Complements

A draft for RG to be checked word by word; the idiom columns are a reviewer task.

| complement | RG *(verify all)* | notes |
|---|---|---|
| locative | *en*; specifiers *sin* (on), *sut* (under), *davos* (behind), *davant* (in front of), *enturn* (around) | |
| direction | *a* / *en* for places; ***tar*** for a person | the animate split mirrors it *da* / es *hacia*; also *vers* |
| source | *da* | whether a Romance-style ablative adverb is needed is a reviewer question |
| route | *tras* | |
| cause | *pervia da* / *grazia a* / *per cuolpa da* | the three sentiments |
| manner | similative *sco*; measure/means *cun* | |
| instrumental | *cun* | the process level needs a non-gerund means construction *(open)* |
| terminus | *a* | |
| predicative | no preposition | Sursilvan takes the predicative adjective form here |

**Relatives:** *che*; *nua* for place; *cun il qual / da la quala* after other prepositions *(verify)*.
**Coordination:** *e* (and), *ma* (but), *u* (or).

### 2.4 Moods

Each variety gets its own branches in `engine/src/mood.ts`, or keeps them engine-local, since nothing
is shared with it/es/pt/fr.

- **Conditional and imperfect subjunctive:** *sche* + conditional in both clauses *(verify forms, and
  whether the two moods share forms, per variety)*.
- **Imperative** (D10): RG *ti* (*mangia!*), *vus* (*mangiai!*), *nus* (*mangiain!*) *(verify all
  three, in all three varieties)*. Negative imperative is either *na mangia betg!* or an infinitive
  *(verify)*. Overrides for *esser* and *ir*.
- **If-word:** *sche* in RG; *(verify)* in the idioms.

## 3. Interface

- **Typeahead:** check that accents (*è, à, ì, ò, ù, é*) don't defeat search; fold diacritics if they
  do. Shared with P03.
- **Three near-identical rows.** The panel will show three rows whose text is often identical or nearly
  so. The row label must carry the variety name clearly, and D3's three league arms must be
  distinguishable from each other at icon size — see Risks.
- **Fonts:** Lora and Inter cover all three alphabets.

## 4. Testing and review

Review is a **hard gate per variety**.

- **Suites:** `packages/engine/test/languages/rm-rumgr.test.ts` and two siblings, growing phase by
  phase; known defects go in `test.fails` blocks.
- **Reviewers: three, necessarily different people.** An RG reviewer cannot sign off Sursilvan, and a
  Sursilvan speaker cannot sign off Vallader — that division is the substance of the variety dispute.
  The Lia Rumantscha is the obvious first contact for RG and can likely route the other two.
- **What each reviewer signs off:** conjugation cells, **483 UI strings**, **148 engine-composed
  definitions** and the suite's sentences. (The old plan said 111 and 48; measured today
  `UI_STRINGS` has 483 keys and 148 concepts carry a `definition:` plan. The `concept_definitions`
  table holds English fallback literals only — 463 rows, all `en`.) That is **~630 strings per
  variety, ~1,900 in total**, and it is the single largest cost in this plan.
- **Promotion** is per variety, and nothing is promoted without its sign-off. Every *(verify)* is
  confirmed or corrected in the suite first.
- **Rulings:** where a reviewer says a variety allows two forms, record which one the engine emits and
  why, in the style of `docs/bugs/B-can-fix/`.

## 5. Phases

All three varieties move together through each phase, per the sequencing decision.

| # | Ships | Done when |
|---|---|---|
| 0 | P03 §0 groundwork if not already shipped, plus §0.1 hyphenated codes, D2 codes, D3 flag widening, three language-name concepts | the three codes exist, the backend boots with them `preview`, and the panel shows three empty rows |
| 1 | Articles, contractions, agreement, subject pronouns, generic *ins*, present tense; nouns, adjectives, pronouns, present forms — **plus Sursilvan's attributive/predicative split** | the basic clause and noun-phrase sentences render in all three suites |
| 2 | Verb group: compound past with auxiliary selection and agreement, periphrastic future, three negation shapes, aspect, modals, copula, degree | conjugation cells match the draft review sheets |
| 3 | Clause and complements: complements, relatives, coordination, conditional (no inversion, D9), imperative, infinitive, possessives | every sentence suite has three Romansh expectations under the preview gate |
| 4 | **Review**: three reviewers rule on every *(verify)*, D8 and D9; corrections land as tests, then fixes | each review sheet is signed off, independently |
| 5 | UI strings and definitions render in each signed-off variety | the boot check passes for that variety without the preview escape |
| 6 | **Promotion**, per variety: exhaustive tests and snapshots, status → `ready` | each variety is selectable as the interface language, on its own schedule |

## 6. Risks

- **Three reviewers, or nothing.** §4 is now the dominant cost: ~1,900 reviewed strings across three
  varieties, each needing a different native expert. This plan **cannot** be finished to the project's
  standard from published sources and model knowledge alone. If a variety has no reviewer it stays
  `preview` indefinitely, labelled as such — which is a real outcome to plan for, not a failure mode.
- **The idiom columns are blank in this plan.** Nearly every Sursilvan and Vallader cell above is `?`
  or *(verify)*. That is the honest state of what is known here, and the reason phase 1 cannot start
  for the idioms on drafting alone the way it can for RG.
- **Triple maintenance, forever** (D4). Three independent folders means every shared-grammar fix is
  applied three times, and every future `/seed` and `/localize` owes three Romansh columns. §0.7's
  skill change keeps that from blocking other work while the varieties are `preview`, but the cost
  returns at promotion.
- **Emblem legibility at icon size** (D3). The heraldry is settled, but two of the three are hard to
  draw small: the ibex of the League of God's House is an intricate charge, and the cantonal arms
  packs all three leagues into one shield. The Grey League's *per pale sable and argent* is the only
  one that survives at 16px unaided. Budget for simplified, purpose-drawn SVGs rather than traced
  official arms, and check the three against each other — and against `de`'s 🇩🇪 and `it`'s 🇮🇹 — at
  the panel's real icon size before committing.
- **Data licensing** (D11). The *Pledari Grond* is the natural RG source; the idioms' dictionaries are
  separate works with separate terms. Each decides whether forms can be copied or only consulted.
- **Word order** (D9). If a reviewer requires verb-second inversion, it touches clause assembly in
  conditional main clauses, fronted adverbials and possibly coordination — and may differ per variety.
  Outside phase 3; planned then.
- **Three rows of near-identical text** (§3) is a UI cost borne by every user, for three varieties of a
  40,000-speaker language sitting beside one row of Spanish.

## Out of scope

Sutsilvan, Surmiran, Puter and the Jauer dialect; formal address; the simple past; clitic object
pronouns and pronominal verbs beyond what BECOME needs; verb-second inversion until D9 is ruled on;
stored `concept_definitions` text in any variety beyond the engine-composed definitions.
