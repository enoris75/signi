# P04. Romansh — *rumantsch* (Switzerland) as a new output language

**Feature:** Romansh (`rm`), the fourth national language of Switzerland, renders every phrase the other
languages render, as a row in the translations panel and, once complete, as an interface language.
**Shape:** a new engine folder `packages/engine/src/languages/rm/`, a Romansh column in every concept of
the corpus, and the groundwork of [P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language)
(single language list, no database CHECK, a `preview`/`ready` language status, ready-only test gating).
If Romansh ships before Catalan, it carries that groundwork instead.
**Status:** planning. The decisions below are **proposed**, not yet confirmed. The flag (🇨🇭) is given.

> **Every Romansh form in this document is a draft.** Model knowledge of Romansh is thin compared with
> Catalan. Forms marked *(verify)* are ones this plan is unsure of; the others are believed correct but
> still go through review. The reference grammar is the *Grammatica elementara dal rumantsch grischun*
> (Lia Rumantscha); the dictionary and conjugator is the *Pledari Grond*.

| construction | Rumantsch Grischun |
|---|---|
| the cat eats the mouse | il giat mangia la mieur |
| the cat ate the mouse | il giat **ha mangià** la mieur — compound past (§D2) |
| the (female) cat went | la giatta **è ida** — *esser* auxiliary, participle agrees |
| the cat will eat the mouse | il giat **vegn a mangiar** la mieur — periphrastic future *(verify)* |
| the cat does not eat the mouse | il giat **na** mangia **betg** la mieur — bipartite negation *(verify* na*)* |
| we eat (pronoun subject) | **nus** mangiain — subject pronouns are **not** dropped |
| one eats the mouse | **ins** mangia la mieur — like German *man* |
| the man, the water | **l'**um, **l'**aua — elision |
| the cat runs to the child | il giat curra **tar** l'uffant — *tar* for a person's place *(verify)* |

---

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | Which Romansh? | **Rumantsch Grischun (RG)**, the pan-regional standard. The five idioms (Sursilvan, Sutsilvan, Surmiran, Puter, Vallader) stay out of scope. | RG is what the Confederation and the canton of Graubünden write official texts in, and the only variety with a single complete dictionary and conjugator. **But RG is contested:** many schools went back to the idioms, and Sursilvan has the most speakers. Choosing Sursilvan instead changes most forms (e.g. negation *buca*, a predicative *-s* on masculine adjectives), not the engine's structure. |
| D2 | What fills `past`? | The **compound past**: *haver/esser* + participle (*ha mangià*, *è ida*). | The simple past is effectively extinct in speech and rare in writing. Auxiliary choice is per verb: reuse the existing `aux: 'be'` key in [`concepts/verbs/nonfinite.ts`](../../../../packages/backend/src/concepts/verbs/nonfinite.ts) (it/de already select the BE auxiliary with it). The participle agrees with the subject only after *esser*, like Italian `aspectVerb.ts`. |
| D3 | Past vs resultative | Accept that **neutral past and resultative aspect render the same** (*el è ì*). | Romansh has no second construction to tell "he went" from "he is gone". Document it as a known collision, not a bug. |
| D4 | Future | **Periphrastic *vegnir a* + infinitive** *(verify)*. | Regular, needs only the *vegnir* conjugation, and mirrors the German *werden* machinery in shape (not word order). |
| D5 | Negation | ***na* … *betg*** around the finite verb *(verify that RG requires* na*)*. | Structurally the French *ne … pas*: the fr engine's `negateFinite` is the model, including elision (*n'è betg*). If *na* turns out optional, the fix is one helper. |
| D6 | Word order after a fronted clause | Phase 3 renders **no inversion**, as a documented gap, until the reviewer rules on it. | Romansh has verb-second tendencies inherited from contact with German: after a fronted *sche* ("if") clause the main clause may read *…, mangiass il giat la mieur*. How far RG requires this is exactly the kind of question the reviewer answers. |
| D7 | Imperative persons | **ti / nus / vus** (2sg, 1pl, 2pl). Formal *Vus* later. | Mirrors the other engines' three persons. |
| D8 | Lexical data source | Hand-author from the *Pledari Grond* **only after checking its terms of use**; otherwise author from the grammar and have the reviewer check everything. | The corpus is 233 concepts and ~1,700 forms: small enough to author by hand, too big to guess at. |
| D9 | Where the row sits | Append at the end (`…, pt, ca, rm`). | Same as P03 D7. |

## Why

- Romansh is a national language of Switzerland with about 40,000 main-language speakers. It is poorly
  served by general translators: a rule-based engine that gets a small corpus exactly right is worth
  more here than in any big language.
- Linguistically it is a good test of the engine's design:
  - It is Romance (articles, gender, agreement), but **not pro-drop** and with **generic *ins***, like
    French/German.
  - It has a **compound past** with auxiliary selection, and **verb-second** tendencies.
  - Each of those already exists in some engine; Romansh combines them.

## 0. Groundwork

As [P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language). Romansh-specific
additions:

- **Language list:** `LanguageCode` and `LANGUAGES` gain `rm: 'Romansh'`; `uiStrings.ts` gains
  `'language.rm'`; `translator.ts` registers `romanshEngine`.
- **Flag:** 🇨🇭 in `FLAG`. A plain emoji, so no SVG support is needed unless P03's D3 adds it.
- **Language-name concept:** new `ROMANSH` concept.
  - Named *rumantsch* in Romansh; in the others *Romansh, romancio, romanche, Rätoromanisch, romanche,
    romanche, romanx* (ca), *ロマンシュ語* (reading *ろまんしゅご*).
  - The existing languages named in Romansh, all *(verify)*: *englais, talian, franzos, tudestg,
    spagnol, portugais, giapunais, catalan*.
  - Romansh writes language names in lowercase; `NAME_FORMAT` capitalises them for the UI.
- **Status:** `rm` ships as `preview` and stays there until the review in §4 is done, however complete
  the engine is.

## 1. Data — what a Romansh column costs

| role | concepts | Romansh forms | notes |
|---|---|---|---|
| noun | 108 | ~430 | `base, plural, gender, count` (+ `fem, fem_plural`: *giat/giatta*). Plurals mostly *-s*, irregulars stored (*um → umens* *(verify)*). |
| verb | 57 | ~800 | `base`, 6 × present, 6 × **conditional** *(verify whether derivable)*. Past and future are periphrastic: no stored forms. |
| nonfinite | 54 | ~110 | `participle`, and `aux: 'be'` on *esser* verbs (motion and change of state: *ir, vegnir, …* *(verify list)*). No gerund is needed; see §2.2. |
| adjective | 58 | ~230 | `base, fem, plural, fem_plural`, stored as in P03 D6 (*bun, buna, buns, bunas*). |
| adverb | 6 | ~9 | *adina* (always), *mai* (never, `polarity: negative`) *(verify)*, … |
| pronoun | 4 | ~36 | *jau, ti, el/ella, nus, vus, els/ellas*; generic *ins*; object and disjunctive forms *(verify)*. |

**About 1,600 values.** High-frequency irregulars to settle first, because the UI strings and definitions
lean on them: *esser* (*jau sun, ti es, el è, nus essan, vus essas, els èn*), *haver* (*jau hai, ti has,
el ha, nus avain, vus avais, els han*), *vegnir, ir, far, dir, savair, pudair, vulair, stuair, vesair*.

## 2. The engine — `packages/engine/src/languages/rm/`

One function per file with a colocated test. Expect **~45 source files, ~1,300 LOC** by analogy with
fr (47 / 1,464). There is no single sibling to copy, so each piece names its model:

| piece | model | why |
|---|---|---|
| clause, subject pronouns kept, generic subject | **fr** `renderClause`, `on` | not pro-drop; *ins* slots where *on* does |
| negation | **fr** `negateFinite` | bipartite, wraps the finite verb, elides |
| articles, contractions, agreement | **it** `artFor`, `prepDet`, `agreeAdj` | *il/la/l'/ils/las*, *al/dal* |
| compound past, participle agreement | **it** `aspectVerb.ts` (resultative) | auxiliary selection by `aux`, agreement after BE |
| periphrastic future | **de** `WERDEN` table, as a pattern | an auxiliary conjugated for person, main verb non-finite |

### 2.1 Noun phrase

- **Articles:**
  - Definite *il* (m), *la* (f), *ils*, *las*; *l'* before a vowel for both genders.
  - Indefinite *in, ina*; the indefinite plural is bare.
- **Contractions:** *a+il → al, a+ils → als, da+il → dal, da+ils → dals*; *en il* stays apart *(verify)*.
  Only the definite article contracts, as in the other Romance engines.
- **Adjectives:** postnominal by default, with agreement read from the stored forms.
- **Determiners:**
  - *in/ina*; *insaquants* (some) *(verify)*; *nagin/nagina* (no, with negation *(verify)*).
  - *blers/bleras* (many); *paucs/paucas* (few); *tut ils* (all) *(verify)*.
- **Possessives:** attributive, no article, agreeing with the possessed noun: *mes giat, mia chasa, mes
  giats, mias chasas*. `possessiveRm` goes in `engine/src/possessive.ts`.
- **Degree:** *pli* (more), *il pli* (most), *main* (less), *uschè … sco* (as … as).

### 2.2 Verb group

- **Subject:** always rendered, pronoun included.
- **Tenses:**
  - present: stored
  - past: *haver/esser* + participle (D2)
  - future: *vegnir a* + infinitive (D4)
- **Negation:** *na* before and *betg* after the finite verb (D5). With a negative-polarity adverb,
  *mai* replaces *betg* (*el na mangia mai*) *(verify)*.
- **Aspect:**
  - progressive: *esser vidlonder da* + infinitive (*el è vidlonder da mangiar*) *(verify)*
  - prospective: *esser sin il punct da* + infinitive *(verify)*
  - resultative: the compound past (D3)

  No gerund form is needed anywhere.
- **Modals:** *stuair* (MUST), *pudair* (CAN), *vulair* (WILL). Inner modals are infinitives: *el vul
  pudair ir*. Served by `modalChain` (`engine/src/resolved/modalChain.ts`), with no `link` word.
- **Copula:** a single *esser* with an agreeing predicate adjective (*la giatta è stanchela* *(verify
  word)*). No ser/estar split.
- **Pronominal verbs:** BECOME is *daventar*, a plain intransitive verb *(verify)*. It avoids the
  reflexive clitic *sa/sa-* for phase 2.

### 2.3 Complements

A draft to be checked word by word:

| complement | Romansh *(verify all)* | notes |
|---|---|---|
| locative | *en* (*en la chasa*); specifiers *sin* (on), *sut* (under), *davos* (behind), *davant* (in front of), *enturn* (around) | |
| direction | *a* / *en* for places; ***tar*** for a person (*tar l'uffant*) | the animate split mirrors it *da* / es *hacia*; also *vers* (towards) |
| source | *da* (*da la chasa*) | whether a Romance-style ablative adverb is needed is a reviewer question |
| route | *tras* (*tras la chasa*) | |
| cause | *pervia da* / *grazia a* / *per cuolpa da* | the three sentiments |
| manner | similative *sco* (*sco l'aua*); measure/means *cun* | |
| instrumental | *cun* | the process level needs a non-gerund means construction *(open)* |
| terminus | *a* (*a l'uffant*) | |
| predicative | no preposition | |

**Relatives:** *che*; *nua* for place; *cun il qual / da la quala* after other prepositions *(verify)*.

**Coordination:** *e* (and), *ma* (but), *u* (or).

### 2.4 Moods

Romansh gets its own branches in `engine/src/mood.ts`, or keeps them engine-local, since nothing is
shared with it/es/pt/fr.

- **Conditional and imperfect subjunctive** (the *if* clause): *sche* + conditional in both clauses
  (*sche il chaun currass, …*) *(verify forms, and whether the two moods share forms in RG)*.
- **Imperative** (D7):
  - *ti* (*mangia!*), *vus* (*mangiai!*), *nus* (*mangiain!*) *(verify all three)*.
  - The negative imperative *(verify)* is either *na mangia betg!* or an infinitive form.
  - Overrides for *esser* and *ir*.
- **If-word:** *sche*.

## 3. Interface

- **Typeahead:** check that accents don't defeat search (*è, à, ì, ò, ù, é*); fold diacritics if they do.
  Shared with P03.
- **Fonts:** Lora and Inter cover the Romansh alphabet.

## 4. Testing and review

As P03 §4, with **review as a hard gate**:

- **Suite:** `packages/engine/test/languages/rm.test.ts` grows phase by phase; known defects go in
  `test.fails` blocks.
- **Reviewer:** a Rumantsch Grischun reviewer (the Lia Rumantscha is the obvious contact) signs off the
  generated sheet: conjugation cells, 111 UI strings, 48 definitions and the suite's sentences.
- **Promotion:** nothing is promoted without that sign-off, and every *(verify)* in this plan is either
  confirmed or corrected in the suite first.
- **Rulings:** where the reviewer says RG allows two forms, the plan records which one the engine emits
  and why, in the style of `docs/bugs/B-can-fix/` (documented simplifications).

## 5. Phases

| # | Ships | Done when |
|---|---|---|
| 0 | P03 §0 groundwork, if not already shipped | as P03 phase 0 |
| 1 | `rm` as **preview**: articles, contractions, agreement, subject pronouns, generic *ins*, present tense; nouns, adjectives, pronouns, present forms | the basic clause and noun-phrase sentences render in the `rm` suite |
| 2 | Verb group: compound past with auxiliary selection and agreement, periphrastic future, negation, aspect, modals, copula, degree | conjugation cells match the draft review sheet |
| 3 | Clause and complements: complements, relatives, coordination, conditional (no inversion, D6), imperative, infinitive, possessives | every sentence suite has an `rm` expectation under the preview gate |
| 4 | **Review**: native reviewer rules on every *(verify)*, D5 and D6; corrections land as tests, then fixes | the review sheet is signed off |
| 5 | **Promotion**: UI strings and definitions render, `rm` in exhaustive tests and snapshots, status → `ready` | Romansh is selectable as the interface language |

## 6. Risks

- **Correctness without a reviewer.** This plan cannot be finished to the project's standard from
  published sources and model knowledge alone. If no reviewer is available, Romansh should stay `preview`
  indefinitely, labelled as such in the panel, rather than be promoted.
- **Variety choice.** RG is the official written standard but not everyone's Romansh. Label it
  *Rumantsch Grischun* in the README and the language's description, so Sursilvan readers aren't
  surprised.
- **Data licensing.** The *Pledari Grond* is the natural source; its terms decide whether forms can be
  copied or only consulted (D8).
- **Word order.** If the reviewer requires verb-second inversion (D6), it touches clause assembly in
  several constructions: conditional main clauses, fronted adverbials, and possibly coordination. That
  work is outside phase 3 and gets planned then.

## Out of scope

The five idioms; formal address; the simple past; clitic object pronouns and pronominal verbs beyond
what BECOME needs; verb-second inversion until D6 is ruled on; Romansh `concept_definitions` text beyond
the engine-composed definitions.
