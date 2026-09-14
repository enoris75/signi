# P03. Catalan — *català* as an eighth output language

**Feature:** Catalan (`ca`) renders every phrase the other languages render, as a row in the translations
panel and, once complete, as an interface language.
**Shape:** a new engine folder `packages/engine/src/languages/ca/` modelled on Spanish and Italian, a
Catalan column in every concept of the corpus, and a one-off **groundwork** (§0) that removes the places
where the app assumes exactly seven languages. The groundwork is shared with
[P04 Romansh](../P04-romansh/README.md): whichever language ships first carries it.
**Status:** planning. The decisions below are **proposed**, not yet confirmed; each carries a recommendation.

| construction | Catalan (Central, IEC standard) |
|---|---|
| the cat eats the mouse | el gat menja el ratolí |
| the cat ate the mouse | el gat **va menjar** el ratolí — periphrastic past (§D2) |
| the cat will eat the mouse | el gat menjarà el ratolí |
| the cat does not eat the mouse | el gat **no** menja el ratolí |
| the cat never eats the mouse | el gat **no** menja **mai** el ratolí — negative concord |
| the cat is eating the mouse | el gat està menjant el ratolí |
| the cat must eat the mouse | el gat **ha de** menjar el ratolí |
| the man, the water | **l'**home, **l'**aigua — elision |
| the cat runs to the child / from the house | el gat corre **cap al** nen / **lluny de la** casa |
| one eats the mouse | **es** menja el ratolí |
| if the dog ran, the cat would eat the mouse | si el gos corregués, el gat menjaria el ratolí |
| eat the mouse! / don't eat the mouse! | menja el ratolí! / no mengis el ratolí! |
| we eat (pronoun subject) | mengem — pro-drop, like it/es |

---

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | Which Catalan? | **Central Catalan, IEC normative** (Barcelona). Valencian (AVL: *meua*, *este*, 1sg *menge*) and Balearic later, as variants if ever. | The most widely read written standard, and the one dictionaries and conjugators default to. |
| D2 | What fills `past`? | The **passat perifràstic**: *vaig/vas/va/vam/vau/van* + infinitive. | It is the perfective simple past people write and say. The synthetic *menjà* is literary. The periphrasis needs no stored past forms, only a six-cell auxiliary table. |
| D3 | Flag | The **Senyera as a small inline SVG** in `FLAG`. | Catalan has no two-letter flag emoji, and the tag-sequence emoji renders as a plain black flag on most systems. 🇦🇩 Andorra is the alternative: Catalan is its sole official language, but few would read it as "Catalan". |
| D4 | Imperative persons | **tu / nosaltres / vosaltres**, like Spanish *tú / nosotros / vosotros*. *Vostè* later. | Mirrors the existing es model one-to-one. |
| D5 | Generic subject ("one") | Impersonal **es** (*es menja el ratolí*). | Mirrors es *se* / it *si*. *Hom* is literary. |
| D6 | Adjective agreement | **Store** `fem`, `plural`, `fem_plural` per adjective, instead of deriving from `base` as it/es/pt do. | The spelling alternations (*blanc → blanques*, *boig → boja → boges*, *groc → grogues*, *nou → nova*) need an irregular table for a large share of the 58 adjectives anyway. |
| D7 | Where the row sits | Append after Portuguese: `…, pt, ca`. | `LANGUAGES`'s key order is the row order. Appending keeps every existing test's order intact. |

## Why

- Catalan is spoken by about 10 million people in Catalonia, Valencia, the Balearic Islands, Andorra
  and Roussillon, and read by many more.
- It sits between the Romance engines the app already has: articles and contractions like Spanish
  (*al, del, pel*), elision like French and Italian (*l'home, d'aigua*), and pro-drop like both.
  Most constructions have a sibling to copy. That makes it the cheapest first new language, and the
  right one to carry the groundwork.
- The corpus is small (233 concepts). Catalan lexical data is plentiful, and forms can be checked
  against the DIEC2 dictionary and published conjugation tables.

## 0. Groundwork — make room for any new language

Today the list of languages is written out in about a dozen places, and two of them stop the app
unless a language is complete. This section removes both obstacles once, for `ca` and `rm` alike.

### 0.1 Where the list lives

| Place | Change |
|---|---|
| [`shared/src/index.ts:3`](../../../../packages/shared/src/index.ts#L3) `LanguageCode`, `:362` `LANGUAGES` | Add `'ca'`. `LANGUAGES` fails typecheck until the name is there. |
| [`shared/src/uiStrings.ts:954-960`](../../../../packages/shared/src/uiStrings.ts#L954-L960) | Add `'language.ca': { plan: nameOf('CATALAN'), … }`. `LanguageSelector` and `TranslationPanel` fail typecheck without it. |
| [`frontend/src/i18n/flags.ts`](../../../../packages/frontend/src/i18n/flags.ts) | Add the flag. D3's SVG means widening `FLAG` from `string` to a small `Flag` component that renders either an emoji or an SVG; both callers render it as text today. |
| [`engine/src/translator.ts:5-21`](../../../../packages/engine/src/translator.ts#L5-L21) | Import and register `catalanEngine`. The array order is the order of `Translation[]`. |
| [`backend/src/concepts/nouns.ts:1160-1300`](../../../../packages/backend/src/concepts/nouns.ts#L1160) | New `CATALAN` language-name concept (`isA: 'LANGUAGE'`, `countable: false`), plus a `ca` form on the seven existing ones. |
| `shared/src/index.d.ts`, `shared/src/index.js` | Stale compiled copies still listing seven languages, committed to git. Delete them. |

After any change to `shared` or `engine`, rebuild them: the backend and e2e load their `dist/`, not `src/`.

### 0.2 The database refuses unknown languages

All six lexeme tables carry `CHECK (language IN ('en','it','fr','de','es','ja','pt'))`
([`db.ts:65,77,84,93,103,110`](../../../../packages/backend/src/db.ts#L65)). The tables are created with
`IF NOT EXISTS`, and the git-tracked `packages/backend/signi.db` already has the constraint, so seeding
`ca` into it fails. Tests aren't affected: they use fresh databases.

**Proposal:** drop the language CHECK from the schema, and have `seed.ts` validate each language key
against `LANGUAGES` instead, which keeps a single list. Add a one-off migration in `db.ts` that rebuilds
the six tables when their SQL still carries the old CHECK (create, copy, drop, rename), so
`saved_phrases` survive. Deleting `signi.db` and reseeding would also work, but it loses saved phrases.

### 0.3 A language must be complete before the backend boots

At startup the backend renders all **111 UI strings** and **48 definitions** into every code in
`LANGUAGES`, and **throws** if any comes out empty
([`backend/src/uiStrings.ts:42-47`](../../../../packages/backend/src/uiStrings.ts#L42-L47),
[`definitions.ts:37-42`](../../../../packages/backend/src/definitions.ts#L37-L42)). The UI strings are
composed by the engine from many constructions, so this check can only pass at the very end.

**Proposal: a language status.** Add `LANGUAGE_STATUS: Record<LanguageCode, 'ready' | 'preview'>` to
`shared`.

| | ready | preview |
|---|---|---|
| Translations panel | row | row, with a *preview* chip |
| Interface-language selector | listed | not listed |
| Boot-time completeness check | throws | logs what is missing, serves the English fallback |
| Exhaustive engine tests (§0.5) | included | excluded |

A language ships as `preview` from phase 1 and is promoted in the last phase (§5). Without a status, the
whole language would sit on a branch until every UI string renders.

### 0.4 Code that names languages one by one

These don't fail typecheck; they silently return `undefined` for a language they don't know.

- [`engine/src/mood.ts`](../../../../packages/engine/src/mood.ts):
  - `futureStem` :47, `conditionalForm` :59, `subjunctiveForm` :66 and `imperativeForm` :220 switch on
    it/es/pt/fr.
  - Catalan gets its branches here (§2.4).
- [`engine/src/possessive.ts`](../../../../packages/engine/src/possessive.ts): one function per language
  (`possessiveIt` :65 … `possessiveJa` :173). Add `possessiveCa`: *el meu gat, la meva casa, els meus
  gats, les meves cases*.
- [`frontend/src/components/TranslationPanel.tsx:186-192`](../../../../packages/frontend/src/components/TranslationPanel.tsx#L186-L192):
  Japanese-only font styling. Nothing to do; just don't copy it.

### 0.5 Tests that enumerate the seven

| Test | What breaks | Proposal |
|---|---|---|
| ~59 engine tests `expect(sayAll(…)).toEqual({…7 keys…})` (`complements/combined*.test.ts`, `genus-verbs`, `clause`, `nounPhrase`, …) | an extra key | `sayAll` in `engine/test/harness.ts` renders **ready** languages only. A preview language is covered by its own suite (§4). Promoting it adds its line to every exhaustive test: that edit *is* the acceptance review. |
| `__snapshots__/verb.conjugation.test.ts.snap` (270 entries, 30k lines), `hypothetical.test.ts.snap` | new cells | Same gate. Re-baseline on promotion, after the review in §4. |
| `frontend/test/TranslationPanel.test.tsx:8` (`LANGUAGE_ORDER`), `LanguageSelector.test.tsx:56-64` | hardcoded list of 7 | Derive the order from `LANGUAGES`, and the selector's options from the ready languages. |
| Language loops in `adjectives.test.ts:767,944`, `uiLabel.test.ts:132`, `complements/route.test.ts:112`, `locative.test.ts:277` | nothing breaks, but no coverage | Iterate the ready languages instead of a literal list. |
| e2e `expectSentences` | nothing (it takes a `Partial`) | Add `ca` lines per phase (§4). |

### 0.6 Docs and skills that say "seven"

Mostly mechanical, but the skills drive future work, so they matter most:

- **Seed skill** — `.claude/skills/seed/SKILL.md:30` says *"Languages: `en`…`pt`. Every one is
  mandatory."* It should say "every **ready** language is mandatory; preview languages are added when
  known".
- **Other skills** — `localize`, `localize-seed`, `generalize`, `specialize`, `detach` and `fix-bug`
  (folder list) also hardcode the list.
- **README** — `:3,9,11,19,21,86`, plus the stale `/api/payoff` and `/api/languages` references at `:116-117`.
- **Bug catalogue** — `docs/bugs/engine-grammar-bugs.md:17` lists the language folders.
- **Localization docs** — `docs/localization/localization-tasks.md` and its `| lang | renders |` tables.

## 1. Data — what a Catalan column costs

Measured from the corpus (233 concepts; every existing language is complete):

| role | concepts | Catalan forms | notes |
|---|---|---|---|
| noun | 108 | ~430 | `base, plural, gender, count` (+ `fem, fem_plural` on gendered nouns: *gat/gata*) |
| verb | 57 | ~1,090 | `base`, 6 × present, 6 × future. Past is derived (D2). Add 6 × **present subjunctive** and a 3sg **imperfect subjunctive** stem (§2.4). |
| nonfinite | 54 | ~108 | `gerund, participle` |
| adjective | 58 | ~230 | `base, fem, plural, fem_plural` (D6) |
| adverb | 6 | ~9 | `base, subtype, polarity` (*mai* is `polarity: negative`) |
| pronoun | 4 | ~36 | *jo, tu, ell/ella, nosaltres, vosaltres, ells/elles*; object and disjunctive forms |

**About 1,900 values.** Forms are typed per concept in `backend/src/concepts/**` (`ConceptSeed.forms`);
the language key is untyped, so a forgotten `ca` never fails a build. That is one more reason for §0.3's
status, and for a seed-time report listing concepts that have no `ca` form.

Irregular verbs to get right early, because the UI strings and definitions lean on them: *ser, estar,
haver, fer, anar, venir, tenir, poder, voler, saber, dir, veure, beure, córrer, conèixer, viure*. The
spelling changes to watch for: *c/qu, g/gu, ç/c, j/g*, and *-eix-* verbs (*servir → serveix*).

## 2. The engine — `packages/engine/src/languages/ca/`

One function per file with a colocated test, following the existing folders. Expect **~45 source files,
~1,300 LOC, ~40 unit tests** (es: 52 files / 1,331 LOC; pt: 48 / 1,278). Copy structure from **es**, and
the elision helpers from **it** and **fr**. Language folders never import one another.

### 2.1 Noun phrase

- **Articles:**
  - Definite: *el, la, els, les*. Indefinite: *un, una, uns, unes* (the indefinite plural is not bare,
    unlike it).
  - **Elision:** *el/la → l'* before a vowel or mute *h*: *l'home, l'aigua*.
  - Feminine *la* does **not** elide before unstressed *i-/u-/hi-/hu-*: *la universitat*.
  - Proper nouns follow the forced-article model already in it/fr/pt, set per concept.
- **Contractions:** *a+el → al, a+els → als, de+el → del, de+els → dels, per+el → pel, per+els → pels*.
  Never before *l'*, *la* or *les*. Only the definite article contracts: the existing `prepDet` rule
  ("any other determiner rides after the plain preposition") holds as is.
- ***de → d'*** before a vowel: *un got d'aigua*, *la casa d'en Pere*.
- **Adjectives:** postnominal by default, and agreement reads the stored forms (D6). A few prenominal
  ones (*bon, gran* in fixed uses) are a documented simplification: always postnominal.
- **Determiners:** *algun/alguna*; *cap* (+ verb negation: *no hi ha cap gat*); *molt/molta/molts/moltes*;
  *pocs/poques*; *tots els*.
- **Possessives:** article + possessive, agreeing with the possessed noun (§0.4).
- **Degree:**
  - *més / menys / tan … com*; superlative *el més gran*.
  - Suppletive comparatives *millor, pitjor* — a table like `PT_SUPPLETIVE`.

### 2.2 Verb group

- **Pro-drop:** a bare pronoun subject is dropped, exactly like `es/renderClause.ts:17-25`.
- **Tenses:**
  - Present: stored.
  - **Past:** *anar*-auxiliary table (*vaig, vas, va, vam, vau, van*) + infinitive (D2).
  - Future: stored (*menjaré*).
- **Negation:**
  - *no* before the finite verb.
  - Negative-polarity adverbs and quantifiers take **negative concord**: *no … mai*, *no … cap*,
    *no … ningú*. This is the Italian *non … mai* rule, keyed on `polarity: 'negative'` as in ja.
- **Aspect:**
  - progressive *estar* + gerund (*està menjant*)
  - prospective *estar a punt de* + infinitive
  - resultative *haver* + participle (*ha menjat*, no agreement)

  The past auxiliary sits in front of the whole group: *va estar menjant*.
- **Modals:**
  - *haver de* (MUST, with `link: 'de'`), *poder* (CAN), *voler* (WILL).
  - Inner modals are infinitives: *vol poder anar*.
  - The chain is served by `modalChain` in `engine/src/types.ts:468`.
- **Copula BE:** *ser* vs *estar*, following the es engine's rule for predicate adjectives.
- **Pronominal verbs:** BECOME is *tornar-se*, which needs the reflexive clitic.
  - Proclitic *es / s'*: *es torna feliç*. Enclitic *-se* after an infinitive: *tornar-se*.
  - A small `clitic.ts` covering person and elision is enough for the reflexive. The full weak-pronoun
    system (*en, hi*, clusters) is out of scope.

### 2.3 Complements

| complement | Catalan | notes |
|---|---|---|
| locative | *a* + definite (*a la casa*), *en* + other determiners (*en una casa*) | specifiers: *sota, sobre, darrere, davant, al voltant de* |
| direction | *a* (*al mercat*); animate goal *cap a* (*cap al nen*) | the animate split mirrors es *hacia* / fr *vers* |
| source | ***lluny de*** (*lluny de la casa*) | the ablative-adverb pattern of the other Romance engines (`SOURCE_ABLATIVE_ADVERB_VERBS`) |
| route | *per* (*pel parc*); *a través de* | |
| cause | *a causa de / gràcies a / per culpa de* | the three sentiments |
| manner | similative *com* (*com l'aigua*); measure *a* (*a gran velocitat*); means/mode *amb* | |
| instrumental | *amb* (*amb el bastó*) | process level: gerund (*triant la paraula*) |
| terminus | *a* (*al nen*) | |
| predicative | no preposition | |

**Relatives:** *que*. After a preposition: *on* for place, *qui* for people (*el nen a qui*), and *el
qual / la qual* otherwise (*la casa de la qual*).

**Coordination:** *i*, *però*, *o*. *I* never switches form, unlike es *y → e*.

### 2.4 Moods — extend `mood.ts`

- **Conditional:** future stem + *-ia, -ies, -ia, -íem, -íeu, -ien*. Derived from the stored 1sg future
  (*menjaré → menjaria*), the way it/es/pt already do.
- **Imperfect subjunctive** (the *if* clause): *-és, -essis, -és, -éssim, -éssiu, -essin*. Built on the
  stored 3sg stem (*mengés, corregués, fos, tingués*). It isn't derivable from the infinitive: the spelling
  changes and irregulars are too many.
- **Imperative** (D4):
  - *tu* = 3sg present (*menja*); *vosaltres* = 2pl present (*mengeu*); *nosaltres* = 1pl present
    subjunctive (*mengem*).
  - Negative = *no* + present subjunctive (*no mengis, no mengeu*).
  - Overrides for *ser* (*sigues, siguem, sigueu*), *saber* (*sàpigues*), *anar* (*ves*), *fer*
    (*fes*), *venir* (*vine*).
- **If-word:** *si*.

## 3. Interface

- **Language names:** *català* in Catalan; Catalan in each language: *Catalan, catalano, catalan,
  Katalanisch, catalán, catalão, カタルーニャ語* (reading *かたるーにゃご*). The existing seven named in
  Catalan: *anglès, italià, francès, alemany, espanyol, japonès, portuguès*. `NAME_FORMAT` capitalises
  them.
- **Typeahead:** search matches the word in the interface language
  (`frontend/src/i18n/useConceptLabel.ts:51-65`). Check that accents and the middle dot don't defeat
  search (*cafe* → *cafè*, *col·legi*); fold diacritics if they do. This is shared with P04.
- **Fonts:** Lora and Inter cover *à è é í ï ò ó ú ü ç l·l*. Nothing to add.

## 4. Testing and review

- **Unit:** every function file in `languages/ca/` gets its colocated test, with fixtures in
  `ca.fixtures.ts`.
- **Sentence suite:** `packages/engine/test/languages/ca.test.ts` grows phase by phase, organised like
  the existing sentence tests. Known defects go in `test.fails` blocks named `known bugs: …`, per
  `docs/bugs/engine-grammar-bugs.md`.
- **Native review:** before promotion, a speaker reviews a generated sheet: the conjugation snapshot
  cells for `ca`, all 111 UI strings and 48 definitions, and every sentence in the `ca` suite. Corrections
  come back as test edits, then fixes.
- **e2e:**
  - `translation.spec.ts` checks the `ca` row renders.
  - One `expectSentences` line per phase in an existing spec (e.g. `verb.spec.ts`).
  - `language.spec.ts` selects Catalan as the interface language once it is ready.

## 5. Phases

| # | Ships | Done when |
|---|---|---|
| 0 | Groundwork (§0): single language list, no DB CHECK + migration, `LANGUAGE_STATUS`, ready-only test gating, skills/docs updated | The suite is green with no new language; a dummy `preview` language renders an empty row without breaking boot. |
| 1 | `ca` as **preview**: engine skeleton, articles/elision/contractions, agreement, pro-drop, present tense; all 108 nouns, 58 adjectives, 4 pronouns, verbs' present | "the big cats eat the mouse", pronoun subjects, determiners all render in the `ca` suite. |
| 2 | Verb group: periphrastic past, future, aspect, modals, negation with concord, copula, BECOME + reflexive, degree | Verb conjugation cells for `ca` match the review sheet. |
| 3 | Clause and complements: all complement types, relatives, coordination, conditional, imperative, infinitive, instrumental levels, possessives, generic *es* | Every existing sentence suite has a `ca` expectation under the preview gate. |
| 4 | **Promotion**: all 111 UI strings and 48 definitions render, native review done, `ca` added to exhaustive tests and snapshots, status → `ready` | Catalan is selectable as the interface language; boot check passes with `ca` included. |

## 6. Risks

- **Test churn at promotion.** About 59 exhaustive tests and a 30k-line snapshot grow by one language.
  The gate keeps that to one reviewed commit instead of breaking the suite for weeks.
- **Pronominal verbs and clitics.** Catalan weak pronouns are the hardest part of its grammar. Only the
  reflexive is in scope; anything that needs *en/hi* is documented as a gap.
- **Variety politics.** Calling the Central standard "Catalan" is normal practice, but Valencian speakers
  may expect *valencià* forms. Name the variety in the README.
- **Flag.** The Senyera is the usual symbol for the language, but flags for languages are always
  approximate. D3 is deliberately a separate decision.

## Out of scope

Valencian and Balearic variants; formal *vostè* commands; the literary synthetic past; weak pronouns
*en/hi* and clitic clusters; participle agreement with object clitics; Catalan `concept_definitions` text
beyond the engine-composed definitions.
