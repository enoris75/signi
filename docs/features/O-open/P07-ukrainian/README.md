# P07. Ukrainian — *українська* as a new output language

**Feature:** Ukrainian (`uk`) renders every phrase the other languages render, as a row in the
translations panel and, once complete, as an interface language.
**Shape:**
- **General groundwork:** [P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language).
- **Slavic groundwork:** [P05 §0](../P05-polish/README.md#0-slavic-groundwork--shared-by-p05-p06-and-p07)
  — aspect pairs as `pf_` keys, case paradigms, the shared aspect-selection table, quantifier government,
  `subjectAntecedent`, declined relative pronouns. Whichever Slavic language ships first carries it.
- **Engine:** a new folder `packages/engine/src/languages/uk/`.
- **Relation to Russian:** structurally close to [P06](../P06-russian/README.md), but **its own
  language, with its own data**. No Ukrainian form is derived from a Russian one (§6).

**Status:** planning. The decisions below are **proposed**, not yet confirmed. Forms marked *(verify)* are
ones this plan is unsure of.

| construction | Ukrainian |
|---|---|
| the cat eats the mouse | кіт їсть мишу |
| the cat ate the mouse | кіт **зʼїв** мишу — perfective (P05 §0.3) |
| the (female) cat ate the mouse | кішк**а** зʼїл**а** мишу — the past agrees in gender |
| the cat will eat / will be eating the mouse | кіт **зʼїсть** мишу / кіт **їстиме** мишу — synthetic imperfective future (D2) |
| the cat does not eat the mouse | кіт **не** їсть мишу *(verify: or* миші*, D4)* |
| the cat never eats the mouse | кіт **ніколи не** їсть мишу |
| the dog sees the cat / the cats eat the mice | собака бачить **кота** / коти їдять **мишей** — animate accusative = genitive |
| the cat runs to the child / away from the house; in the house | кіт біжить **до дитини** / **від будинку**; **у будинку** |
| the man gives the book to the child | чоловік дає книжк**у** дитин**і** |
| the cat is happy / was happy | кіт щасливий / кіт **був** щасливий — no present copula |
| the cat is an animal | кішка **—** тварина |
| the cat becomes a legend | кіт стає легенд**ою** — instrumental |
| we eat (pronoun subject) | **ми** їмо (D5) |
| one eats the mouse | мишу **їдять** — subjectless 3rd plural |
| the cat eats its (own) food | кіт їсть **свою** їжу |
| if the dog ran, the cat would eat the mouse | **якби** собака біг, кіт зʼїв **би** мишу |
| eat the mouse! / let's eat the mouse! | **зʼїж** мишу! / **зʼїжмо** мишу! — synthetic 1pl imperative |
| he was in the house / she was in the house | він був **у** будинку / вона була **в** будинку — euphony (D7) |

---

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | Script and apostrophe | **Cyrillic** (with *і ї є ґ*). The apostrophe is stored as **U+02BC** (*ʼ*, modifier letter apostrophe) in *зʼїсти, мʼясо*; search folds *ʼ ' ’* together. | U+02BC is a letter, so words don't split at it in selection or search, and it is the character recommended for Ukrainian text processing. Users type any of the three. |
| D2 | Imperfective future | **Synthetic** *їстиму, їстимеш, їстиме, їстимемо, їстимете, їстимуть*, **derived** from the infinitive. | Normative and distinctly Ukrainian, regular (infinitive + *-му/-меш/…*), and needs no stored forms. The analytic *буде їсти* is equally correct; the reviewer may prefer it. |
| D3 | Present copula | **Zero copula.** Predicate adjectives in the **long form** (*кіт щасливий*); predicate nouns with a dash (*кішка — тварина*); *був/буде* + instrumental outside the present. | Ukrainian short adjectives are rare, unlike Russian. *Є* as a present copula exists but reads bookish. |
| D4 | Negated direct object | **Accusative** in phase 1; genitive (*не їсть миші*) is a reviewer ruling. *(verify)* | Both occur. How strongly the standard prefers the genitive is exactly a native-speaker question. |
| D5 | Pronoun subjects | **Kept** (*ми їмо*) *(verify)*. | Ukrainian drops them more readily than Russian. Keeping them is always correct; dropping them is a style choice for the reviewer. |
| D6 | Generic subject ("one") | The **subjectless 3rd plural** (*мишу їдять*). | Standard. The impersonal *-но/-то* forms (*зʼїдено*) mean something else (a result). |
| D7 | Euphony (*милозвучність*) | **Implement** the alternations: *у/в*, *і/й*, *з/із/зі*. | Written Ukrainian follows them. A text without them reads as careless or Russified. §2.3. |
| D8 | Quantifier + verb | **Singular** (*багато котів їсть*) until reviewed; the plural (*їдять*) is also in use *(verify which the standard prefers)*. | Usage may differ from Russian; the reviewer decides. |
| D9 | Lexical data source | **VESUM** (the Ukrainian morphological dictionary) or Wiktionary, **after checking their licences**; otherwise author by hand. **Never** from Russian data. | ~3,300 forms; §6. |
| D10 | Flag | 🇺🇦 | |

## Why

- Ukrainian has about 35–40 million speakers, and a growing demand for Ukrainian as a language of its
  own in software rather than an afterthought to Russian.
- **Given the Slavic groundwork, most of the engine is familiar.** What's new is small and specific:
  - the synthetic imperfective future and 1pl imperative
  - long-form predicate adjectives
  - dative *-ові/-еві*
  - euphony alternations — the first rule in the app that changes a word by the **sound of its
    neighbour**
- **Doing it well means resisting Russian.** That constraint shapes the data and the review more than
  the code.

## 0. Groundwork

P03 §0 and P05 §0. Ukrainian-specific additions:

- **Language list:** `uk` in `LanguageCode`, `LANGUAGES`, `uiStrings.ts` (`'language.uk'`) and
  `translator/translator.consts.ts`; 🇺🇦 in `FLAG`.
- **Language-name concept `UKRAINIAN`:**
  - In Ukrainian a language name is a substantivised adjective: *українська (мова)*. Store its case
    forms as noun forms (*української, українською*); it is feminine.
  - Ukrainian in the other languages: *Ukrainian, ucraino, ukrainien, Ukrainisch, ucraniano, ucraniano,
    ucraïnès* (ca), *ukraiński* (pl), *украинский* (ru), *ウクライナ語* (reading *うくらいなご*).
  - The existing languages named in Ukrainian: *англійська, італійська, французька, німецька, іспанська,
    японська, португальська, каталанська, польська, російська*.
- **Search:** folds the apostrophe variants (D1). As with Russian, Latin input still reaches words
  through their English labels.

## 1. Data — what a Ukrainian column costs

| role | concepts | Ukrainian forms | notes |
|---|---|---|---|
| noun | 108 | ~1,300 | base, plural, gender + 10 case forms. The vocative (*коте!*) isn't stored: nothing addresses a noun. |
| verb | 57 | ~1,700 | per aspect: infinitive, 6 × present (imperfective) or future (perfective), 4 × past, 3 × imperative (2sg, **1pl**, 2pl), adverbial participle (*вибираючи / вибравши*). The imperfective future is derived (D2). |
| adjective | 58 | ~120 | `base` + comparative (*швидший, кращий*). Declension derived by rule. |
| adverb | 6 | ~12 | *швидко, повільно, добре, разом, завжди, ніколи* (`polarity: negative`) |
| pronoun | 4 | ~130 | *я, ти, він/вона/воно, ми, ви, вони* in 6 cases, with *н-* after prepositions (*до нього, у неї*) |

**About 3,300 values.** Irregulars to settle first:

| verb | forms |
|---|---|
| *бути* | *є*, *був*, *буду* |
| *їсти* | *їм, їси, їсть, їмо, їсте, їдять* |
| *дати* | *дам, даси, дасть, дамо, дасте, дадуть* |
| *бігти* | *біжу, біжиш … біжать* |
| *хотіти* | *хочу, хочеш* |
| *могти* | *можу, можеш* |
| *іти/піти* | *ішов/йшов* — itself subject to euphony |
| *ставати/стати* | |

## 2. The engine — `packages/engine/src/languages/uk/`

Expect **~60 source files, ~2,000 LOC**. Copy structure from `ru/` or `pl/` if either lands first, but
re-derive every table from Ukrainian sources.

### 2.1 Noun phrase

- **Case assignment by slot:** as P06 §2.1, with the long-form predicate adjective (D3).
  - Direct object: accusative; genitive for animate masculine singulars and animate plurals.
  - Terminus: dative. Masculine animates prefer *-ові/-еві* (*котові*); store `dat_sg` as used.
  - Possessor and noun modifier: genitive, postnominal (*їжа кота*, *творець семантичних фраз*).
  - Predicative noun: instrumental with *стати* and outside the present.
- **Adjectives:** prenominal, declined by rule (hard *-ий*, soft *-ій*). Comparatives in *-ший/-іший*
  from the stored form; superlative *най-* + comparative (*найшвидший*).
- **Possessives:** *мій, твій, наш, ваш, їхній* decline; *його, її* don't. ***Свій*** when
  `subjectAntecedent` (P05 §0.5).

### 2.2 Verb group

- **Tense × aspect:** P05 §0.3.
  - The imperfective future is synthetic (D2).
  - The past agrees in gender and number: *їв, їла, їло, їли*.
- **Copula:** zero in the present (D3).
- **Negation:** *не* before the verb; negative concord *ніколи не*, *жоден … не*.
- **Modals:** MUST = *мусити* (*мусить зʼїсти*); CAN = *могти*; WILL = *хотіти*.
- **Reflexive verbs** carry *-ся* in their stored forms (*здаватися* for SEEM). BECOME is *ставати/стати*
  with no *-ся*.

### 2.3 Complements, and euphony

| complement | Ukrainian | case |
|---|---|---|
| locative | *у/в* (*у будинку*); specifiers *на* (on), *під* (under), *за* (behind), *перед* (in front of), *навколо* (around) | *у/в/на* + locative; *під/за/перед* + instrumental; *навколо* + genitive |
| direction | *до* (*до будинку, до дитини*) | genitive |
| source | *від* ("away from": *від будинку*) | genitive |
| route | *через* (*через будинок*) | accusative |
| cause | neutral *через* / positive *завдяки* / negative *з вини* | accusative / dative / genitive |
| manner | similative *як* (*як вода*); measure and mode *з* (*з великою швидкістю*) | *як* + nominative; *з* + instrumental |
| instrumental | bare **instrumental** (*ножем*); process level: adverbial participle | instrumental |
| terminus | bare **dative** (*дитині*) | dative |

**Euphony (D7)** is a pass over the finished sentence, not a per-word rule, because each choice depends on
the **previous word's last sound** and the **next word's first sound**:

| alternation | after a vowel, before a consonant | after a consonant, before a consonant | other cases |
|---|---|---|---|
| preposition *in* | *в* (*вона була **в** будинку*) | *у* (*він був **у** будинку*) | *в* before a vowel; *у* before *в, ф* and clusters such as *льв, св, тв* |
| conjunction *and* | *й* (*собака **й** кіт*) | *і* (*кіт **і** собака*) | *і* before a vowel |
| preposition *with/from* | *з* | *із* | *зі* before some clusters (*зі школи*) |

At the start of a sentence only the next word decides (*В Одесі…*, *У будинку…*). The same alternations
apply to other *у/в*- and *і/й*-initial words (*увесь/весь*, *іти/йти*). Check the finer cases against the
2019 orthography *(verify)*.

This pass needs every word's surface form, which the engine has at the very end of `renderClause`. Design
it as a small `euphony.ts` with its own unit tests.

- **Relatives:** *який* (declined; P05 §0.6).
- **Coordination:** *і/й* (euphony), *але*, *або*.

### 2.4 Moods

- **Conditional:** *би* + past in both clauses. The if-word is ***якби*** (*якби собака біг, кіт зʼїв би
  мишу*).
- **Imperative:** stored 2sg / **1pl** / 2pl (*зʼїж / зʼїжмо / зʼїжте*); imperfective when negative (*не
  їж*).
- **Infinitive / citation:** the infinitive the aspect table selects.

## 3. Interface

- **Fonts:** Lora, Inter and Playfair Display ship Cyrillic including *і ї є ґ*. Also check that U+02BC
  (*ʼ*) renders in all three (it sits in the Latin range, not Cyrillic) in the translations panel.
- **Typeahead:** apostrophe folding (D1). Cyrillic search works once the interface language is Ukrainian.

## 4. Testing and review

- **Unit and sentence tests:** as P05 §4, in `languages/uk/` and `packages/engine/test/languages/uk.test.ts`.
- **Euphony:** `euphony.ts` gets exhaustive unit tests (every alternation × vowel/consonant on each side ×
  sentence start).
- **Review:** a native review before promotion covers D4, D5, D8, the P05 §0.3 aspect table, and a
  **Russianism screen** of all ~3,300 forms and the 111 UI strings (§6).
- **e2e:** the `uk` row renders; one `expectSentences` line per phase, including one that exercises
  *у/в*.

## 5. Phases

| # | Ships | Done when |
|---|---|---|
| 0 | P03 §0 + P05 §0, if not already shipped | as P05 phase 0 |
| 1 | `uk` preview: case assignment, declension, animate accusative, present tense, demonstratives, zero copula, **euphony pass** | subject/object/terminus and "X is Y" sentences render, with *у/в, і/й* correct |
| 2 | Aspect table, past agreement, synthetic imperfective future, negation, modals, *стати* + instrumental, degree, quantifier government | every row of P05 §0.3 has a passing `uk` test |
| 3 | Complements with case government, relatives, coordination, *якби* conditionals, imperative incl. 1pl, infinitive, instrumental levels, *свій* | every sentence suite has a `uk` expectation under the preview gate |
| 4 | UI strings and definitions render, native review including the Russianism screen, exhaustive tests and snapshots → `ready` | Ukrainian is selectable as the interface language |

## 6. Risks

- **Russian contamination.** The single biggest risk. Model knowledge and many online resources mix
  Russian into Ukrainian: vocabulary (*являтися* for "be", *приймати участь* for *брати участь*), endings
  (dative *коту* where *котові* is preferred), and missing euphony.
  - No Ukrainian form is derived or copied from the `ru` column.
  - The review explicitly screens for Russianisms.
- **Euphony is sentence-level.** Any code that joins words after the pass (coordination connectors, the
  condition's comma, relative clauses assembled separately) can break it. The pass must run on the final
  string, and tests must cover joined clauses.
- **Aspect choice** (P05 §6) and **data licensing** (D9).

## Out of scope

The vocative; the analytic imperfective future (unless the reviewer prefers it, D2); *є* as a
present-tense copula; pronoun dropping (D5); indeterminate motion verbs; numerals; the passive
([A01](../../Z-Done/A01-passive-voice/README.md)).
