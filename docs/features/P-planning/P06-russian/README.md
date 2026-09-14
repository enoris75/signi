# P06. Russian — *русский* as a new output language

**Feature:** Russian (`ru`) renders every phrase the other languages render, as a row in the translations
panel and, once complete, as an interface language. It is the first language in a non-Latin alphabet
other than Japanese.
**Shape:**
- **General groundwork:** [P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language).
- **Slavic groundwork:** [P05 §0](../P05-polish/README.md#0-slavic-groundwork--shared-by-p05-p06-and-p07)
  — aspect pairs as `pf_` keys, case paradigms in `noun_forms`, the shared aspect-selection table,
  quantifier government, `subjectAntecedent` for reflexive possessives, declined relative pronouns.
  Whichever Slavic language ships first carries it.
- **Engine:** a new folder `packages/engine/src/languages/ru/`.

**Status:** planning. The decisions below are **proposed**, not yet confirmed.

| construction | Russian |
|---|---|
| the cat eats the mouse | кот ест мышь |
| the cat ate the mouse | кот **съел** мышь — perfective (P05 §0.3) |
| the (female) cat ate the mouse | кошк**а** съел**а** мышь — the past agrees in gender, not person |
| the cat will eat / will be eating the mouse | кот **съест** мышь / кот **будет есть** мышь |
| the cat does not eat the mouse | кот **не** ест мышь |
| the cat never eats the mouse | кот **никогда не** ест мышь |
| the dog sees the cat / the cats eat the mice | собака видит **кота** / коты едят **мышей** — animate accusative = genitive |
| the cat runs to the child / away from the house; in the house | кот бежит **к ребёнку** / **от дома**; **в доме** |
| the man gives the book to the child | мужчина даёт книг**у** ребёнк**у** |
| the cat is happy / was happy | кот **счастлив** / кот **был** счастлив — no present copula (D4) |
| the cat is an animal | кошка **—** животное — dash for the missing copula |
| the cat becomes a legend | кот становится легенд**ой** — instrumental |
| many cats eat | **много кошек ест** — genitive plural, singular verb |
| we eat (pronoun subject) | **мы** едим — pronouns kept (D7) |
| one eats the mouse | мышь **едят** — subjectless 3rd plural (D6) |
| the cat eats its (own) food | кот ест **свою** еду |
| if the dog ran, the cat would eat the mouse | **если бы** собака бежала, кот съел **бы** мышь |
| eat the mouse! / don't eat the mouse! / let's eat the mouse! | **съешь** мышь! / **не ешь** мышь! / **давайте съедим** мышь! |

---

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | Script | **Cyrillic only.** No transliteration row. | The panel shows each language as its readers write it. Japanese is not romanised either. |
| D2 | *ё* | **Write *ё*** in the lexicon (*ребёнок, её, всё*); **fold *ё* → *е*** in search. | Many texts write *е*, but *ё* removes real ambiguities (*всё* "everything" / *все* "everyone"), and folding keeps search forgiving. |
| D3 | Stress marks | **Not shown.** A later option could store stress-marked forms and render them through the ruby path Japanese furigana uses. | Stress marks help learners but are not standard written Russian. |
| D4 | Present copula | **Zero copula.** Predicate adjectives use the **short form** where it exists (*счастлив*, *рада*), long form otherwise. Predicate nouns take a dash in the present (*кошка — животное*); *был/будет* + instrumental outside it (*был легендой*). | That is standard Russian. The dash matters: many UI strings and definitions are "X is a Y" sentences. |
| D5 | Negated direct object | **Accusative** (*не ест мышь*). The genitive of negation is left to the reviewer. | Modern usage prefers the accusative for concrete, specific objects; the genitive is optional and register-bound. |
| D6 | Generic subject ("one") | The **subjectless 3rd plural** (*мышь едят*). | The usual "indefinite-personal" construction. Reflexive-passive *мышь естся* is odd. |
| D7 | Pronoun subjects | **Kept** (*мы едим*). | Written Russian keeps them. Dropping them is colloquial. |
| D8 | Quantifier + verb | **Singular neuter** verb (*много кошек ест*, *несколько кошек ело*). | The normative choice. The plural is common in speech; the reviewer can switch it. |
| D9 | "Let's" | ***давайте*** + perfective 1pl future (*давайте съедим*). Negated: *давайте не будем* + imperfective infinitive. | *Давайте* addresses a group, which fits the cohortative best; *давай* is one addressee. |
| D10 | Lexical data source | **OpenCorpora** or **Wiktionary** morphology, **after confirming their share-alike licence terms** fit the corpus; otherwise author by hand and have everything reviewed. | ~3,400 forms. |
| D11 | Flag | 🇷🇺, with P03 D3's caveat: a flag stands for a language only approximately, and Russian is spoken far beyond Russia. The alternative is a text badge **RU** for this row. | Consistency with the other rows, versus neutrality. A product call. |

## Why

- Russian has about 250 million speakers.
- **It exercises what Polish builds, in a second language:** cases, aspect pairs, quantifier government
  and reflexive possessives.
- **It adds two things Polish doesn't:** a Cyrillic script, and a **missing present-tense copula**. The
  latter touches the definitions and UI strings more than any other rule.
- Russian morphology is extremely well described, so forms can be checked rigorously.

## 0. Groundwork

P03 §0 and P05 §0. Russian-specific additions:

- **Language list:** `ru` in `LanguageCode`, `LANGUAGES`, `uiStrings.ts` (`'language.ru'`) and
  `translator.ts`; 🇷🇺 in `FLAG` (D11).
- **Language-name concept `RUSSIAN`:**
  - Named *русский* in Russian: a substantivised adjective (*русский язык*), so its case forms
    (*русского, русском*) are stored as noun forms. In the others *Russian, russo, russe, Russisch, ruso, russo, rus* (ca),
    *rosyjski* (pl), *ロシア語* (reading *ろしあご*).
  - The existing languages named in Russian: *английский, итальянский, французский, немецкий, испанский,
    японский, португальский, каталанский, польский*.
  - `NAME_FORMAT` capitalises the first letter; `toUpperCase` handles Cyrillic.
- **Search** folds *ё* → *е* (D2). Latin input still finds a word through its English label
  (`frontend/src/i18n/useConceptLabel.ts:51-65`), so a user with a Latin keyboard isn't stuck.

## 1. Data — what a Russian column costs

| role | concepts | Russian forms | notes |
|---|---|---|---|
| noun | 108 | ~1,300 | base, plural, gender + 10 case forms (P05 §0.2). Suppletive plurals stored (*ребёнок → дети*, *человек → люди*). |
| verb | 57 | ~1,600 | per aspect: infinitive, 6 × present (imperfective) or future (perfective), 4 × past (`past_masc, past_fem, past_neut, past_pl`), 2 × imperative, adverbial participle (*выбирая / выбрав*) |
| adjective | 58 | ~350 | `base`, 4 × short form, comparative (*быстрее, лучше*). The long-form declension is derived. |
| adverb | 6 | ~12 | *быстро, медленно, хорошо, вместе, всегда, никогда* (`polarity: negative`) |
| pronoun | 4 | ~130 | *я, ты, он/она/оно, мы, вы, они* in 6 cases, with the ***н-*** forms after prepositions (*к нему, у неё*) |

**About 3,400 values.**

- **Irregulars to settle first:** *быть* (no present; *был*, *буду*), *есть* (*ем, ешь, ест, едим, едите,
  едят*), *бежать* (*бегу, бежишь … бегут*), *хотеть* (*хочу, хочешь, хочет, хотим*), *мочь* (*могу,
  можешь*), *дать* (*дам, дашь, даст, дадим*), *идти/пойти* (*шёл*), *стать/становиться*.
- **Gaps:** some imperfective verbs have no usable adverbial participle (*есть*). Store what exists and
  let the instrumental process level fall back to the perfective one (*съев*), or document the gap.

## 2. The engine — `packages/engine/src/languages/ru/`

Expect **~60 source files, ~2,000 LOC**. Russian and Polish engines are structurally alike but don't
share code (language folders never import each other). Copy structure from `pl/` if it lands first.

### 2.1 Noun phrase

- **Case assignment by slot:**

  | slot | case |
  |---|---|
  | subject | nominative |
  | direct object | accusative; **genitive for animate masculine singulars and all animate plurals** |
  | terminus | dative |
  | possessor, noun modifier | genitive, postnominal (*еда кота*, *создатель семантических фраз*) |
  | predicative noun | instrumental with *стать*; with the copula, present nominative after a dash, instrumental otherwise (D4) |
  | predicative adjective | short form (D4) |

- **Adjectives:** prenominal, declined by rule from `base`. The ending of `base` (*-ый / -ий / -ой*) selects
  hard, soft or stressed endings, and the spelling rules after *г к х ж ш щ ч ц* apply.
- **Degree:** comparative from the stored form, *более* + adjective otherwise; superlative *самый* +
  adjective.
- **Possessives:** *мой, твой, наш, ваш* decline; *его, её, их* don't; ***свой*** when `subjectAntecedent`
  (P05 §0.5).
- **Pronouns:** after a preposition, 3rd-person pronouns take *н-* (*к нему*, *для неё*).

### 2.2 Verb group

- **Tense × aspect:** P05 §0.3.
  - The past agrees in **gender and number**: *ел, ела, ело, ели*. With *я/ты* the gender comes from
    the pronoun chooser; masculine when unknown.
  - Imperfective future is *буду* + infinitive.
- **Copula:** omitted in the present (D4).
- **Negation:** *не* before the verb. Negative concord: *никогда не*, *никакой … не*.
- **Modals:**
  - MUST = *должен / должна / должно / должны*, a short adjective agreeing with the subject (past
    *должен был*).
  - CAN = *мочь*; WILL = *хотеть*.
  - Inner modals: *должен уметь*, *хочет мочь*. Chains beyond two are marginal, as in the other engines.
- **Reflexive verbs** (*становиться*, *казаться* for SEEM) carry *-ся/-сь* in their stored forms, so no
  clitic system is needed.
- **Generic subject:** D6.

### 2.3 Complements — prepositions and the case they govern

| complement | Russian | case |
|---|---|---|
| locative | *в* (*в доме*); specifiers *на* (on), *под* (under), *за* (behind), *перед* (in front of), *вокруг* (around) | *в/на* + prepositional; *под/за/перед* + instrumental; *вокруг* + genitive |
| direction | places *в/на* + accusative (*в дом*); persons *к* + dative (*к ребёнку*) | the animate split mirrors es *hacia* / pl *do* |
| source | *от* ("away from": *от дома*) | genitive |
| route | *через* (*через дом*) | accusative |
| cause | neutral *из-за* / positive *благодаря* / negative *по вине* | genitive / dative / genitive |
| manner | similative *как* (*как вода*); measure and mode *с* (*с большой скоростью*) | *как* + nominative; *с* + instrumental |
| instrumental | bare **instrumental** (*ножом*); process level: adverbial participle (*выбирая слово*) | instrumental |
| terminus | bare **dative** (*ребёнку*) | dative |

- **Euphony:** *в/во, с/со, к/ко, о/об/обо* before some clusters and pronouns (*во дворе, со мной, ко
  мне*). A small rule in the preposition helper.
- **Relatives:** *который* (P05 §0.6).
- **Coordination:** *и*, *но*, *или*; *а* for contrast is out of scope.

### 2.4 Moods

- **Conditional:** *бы* + past in both clauses. The if-word is ***если бы*** (*если бы собака бежала,
  кот съел бы мышь*).
- **Imperative:** stored 2sg/2pl (*съешь / съешьте*); 1pl per D9; imperfective when negative.
- **Infinitive / citation:** the infinitive the aspect table selects.

## 3. Interface

- **Fonts:** Lora, Inter and Playfair Display all ship Cyrillic, and the Google Fonts CSS in
  `frontend/index.html` serves it by unicode-range with no change. Check real rendering in the
  translations panel once the row exists.
- **Line length:** Russian sentences run longer than English ones. Check the translations panel wraps
  cleanly at phone width.
- **Typeahead:** D2 folding. Cyrillic search works as soon as the interface language is Russian.

## 4. Testing and review

- **Unit and sentence tests:** as P05 §4, in `languages/ru/` and `packages/engine/test/languages/ru.test.ts`.
- **Dedicated tests:** the zero copula (present vs past vs future, adjective vs noun predicate), the
  animate accusative, and the *н-* pronoun forms.
- **Review:** a native review before promotion covers the P05 §0.3 aspect table, D5 and D8.
- **e2e:** the `ru` row renders in `translation.spec.ts`; one `expectSentences` line per phase.

## 5. Phases

| # | Ships | Done when |
|---|---|---|
| 0 | P03 §0 + P05 §0, if not already shipped | as P05 phase 0 |
| 1 | `ru` preview: case assignment, noun/adjective/pronoun declension, animate accusative, present tense, demonstratives, zero copula | subject/object/terminus and "X is Y" sentences render |
| 2 | Aspect table, past agreement, futures, negation, modals, *стать* + instrumental, degree, quantifier government | every row of P05 §0.3 has a passing `ru` test |
| 3 | Complements with case government, relatives, coordination, *если бы* conditionals, imperative incl. *давайте*, infinitive, instrumental levels, *свой* | every sentence suite has a `ru` expectation under the preview gate |
| 4 | UI strings and definitions render (dash copula), native review, exhaustive tests and snapshots → `ready` | Russian is selectable as the interface language |

## 6. Risks

- **The zero copula meets the UI strings.** Definitions and labels composed as "X is a Y" will look wrong
  if the dash rule misfires, and the backend's boot check can't tell a wrong string from a right one,
  only an empty one. Review every definition.
- **Aspect choice** (P05 §6).
- **Licensing:** share-alike data (D10) may constrain how the corpus can be relicensed later.
- **Flag** (D11).

## Out of scope

Stress marks; transliteration; indeterminate motion verbs; the genitive of negation; numerals; the
vocative; *а* as a contrastive conjunction; the passive
([A01](../../A-ready/A01-passive-voice/README.md)), which for Russian needs short passive participles.
