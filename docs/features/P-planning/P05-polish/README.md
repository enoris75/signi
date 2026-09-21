# P05. Polish — *polski* as a new output language

**Feature:** Polish (`pl`) renders every phrase the other languages render, as a row in the translations
panel and, once complete, as an interface language.
**Shape:**
- **General groundwork:** [P03 §0](../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language)
  (single language list, no database CHECK, `preview`/`ready` status, ready-only test gating).
- **Slavic groundwork (§0):** shared with [P06 Russian](../P06-russian/README.md) and
  [P07 Ukrainian](../P07-ukrainian/README.md) — aspect pairs in the lexicon, case paradigms, one
  aspect-selection table, quantifier government, reflexive possessives. Whichever of the three ships
  first carries it.
- **Engine:** a new folder `packages/engine/src/languages/pl/`.

**Status:** planning. The decisions below are **proposed**, not yet confirmed.

| construction | Polish |
|---|---|
| the cat eats the mouse | kot je mysz |
| the cat ate the mouse | kot **zjadł** mysz — perfective (§0.3) |
| the (female) cat ate the mouse | kot**ka** zjadł**a** mysz — the past agrees in gender |
| the cat will eat the mouse | kot **zje** mysz — perfective future |
| the cat was eating the mouse | kot **jadł** mysz — imperfective |
| the cat does not eat the mouse | kot **nie** je **myszy** — genitive of negation |
| the cat never eats the mouse | kot **nigdy nie** je myszy |
| the cat sees the dog | kot widzi **psa** — animate accusative = genitive |
| the boys ate / the girls ate | chłopcy **zjedli** / dziewczynki **zjadły** — masculine-personal plural |
| the cat runs to / away from the house; in the house | kot biegnie **do domu** / **od domu**; **w domu** |
| the man gives the book to the child | mężczyzna daje książk**ę** dzieck**u** |
| the cat becomes a legend | kot staje się legend**ą** — instrumental |
| many cats eat | **wiele kotów je** — genitive plural, singular verb |
| we eat (pronoun subject) | **jemy** — pro-drop |
| one eats the mouse | **je się** mysz |
| the cat eats its (own) food | kot je **swoje** jedzenie — reflexive possessive (§0.5) |
| if the dog ran, the cat would eat the mouse | **gdyby** pies biegł, kot zjadł**by** mysz |
| eat the mouse! / don't eat the mouse! | **zjedz** mysz! / **nie jedz** myszy! |

---

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | How a verb's two aspects are stored | **One lexeme, prefixed keys:** imperfective forms keep today's keys; perfective forms carry `pf_` (`pf_base`, `pf_3sg_future`, …). §0.1. | The engine needs both aspects of a verb at once, and `lookupLexicalEntry` returns one form map per concept and language. |
| D2 | Which aspect each tense/aspect cell uses | The **aspect-selection table** in §0.3, shared by pl/ru/uk. | The plan says nothing about completion. A fixed, documented table is predictable, and the reviewer can amend it. |
| D3 | Noun paradigms | **Store** the 12 case forms (6 cases × 2 numbers; the vocative is never rendered). | Polish declension has too many stem alternations (*pies → psa*, *ręka → ręce*, *dziecko → dzieci*) to derive safely. |
| D4 | Adjective declension | **Derive** by rule from `base`. **Store** the masculine-personal nominative plural (*dobry → dobrzy*, *wysoki → wysocy*) and the comparative (*większy*). | The endings are regular once the stem is known; the consonant alternations before *-i/-y* are not. |
| D5 | Generic subject ("one") | Impersonal ***się*** with the object in the accusative (*je się mysz*). | The standard Polish impersonal. |
| D6 | Imperative persons | 2sg / 1pl / 2pl (*zjedz / zjedzmy / zjedzcie*). | Polish has a synthetic 1pl imperative; no "let's" periphrasis is needed. |
| D7 | Lexical data source | Author from **SGJP / PoliMorf** morphology **after checking their licences**; otherwise author by hand from Wiktionary-checked forms. | ~3,300 forms are too many to type unchecked. |
| D8 | Flag | 🇵🇱 | |

## Why

- Polish has about 40 million speakers, and it is the largest West Slavic language.
- **It is the first language here with a full case system.** Nouns, adjectives, pronouns and possessives
  all decline, and prepositions and quantifiers choose the case. German declines articles and adjective
  endings; Polish declines the words themselves.
- **Verbal aspect is lexical.** A verb concept is two verbs. The engine's tense × aspect grid has to map
  onto the Slavic pairs.
- Doing Polish first builds the Slavic groundwork that Russian and Ukrainian reuse.

## 0. Slavic groundwork — shared by P05, P06 and P07

### 0.1 Aspect pairs in the lexicon (D1)

A verb concept keeps **one lexeme per language**. Its forms map holds both aspects:

| key | meaning | pl | ru | uk |
|---|---|---|---|---|
| `base` | imperfective infinitive (label, search) | jeść | есть | їсти |
| `pf_base` | perfective infinitive | zjeść | съесть | зʼїсти |
| `1sg_present` … `3pl_present` | imperfective present | jem … jedzą | ем … едят | їм … їдять |
| `pf_1sg_future` … `pf_3pl_future` | perfective (synthetic) future | zjem … zjedzą | съем … съедят | зʼїм … зʼїдять |
| past / imperative / adverbial participle | per language (§2 of each plan), unprefixed = imperfective, `pf_` = perfective | | | |

A verb with **no `pf_` keys** is unpaired or biaspectual (LOVE, KNOW), and the engine uses its
imperfective forms in every cell. Nothing changes for the seven existing languages: they never read
`pf_` keys.

### 0.2 Case paradigms in the lexicon (D3)

- **Nouns:** case forms go in the existing `noun_forms` key/value table, so there is no schema change.
  - Keys: `gen_sg, dat_sg, acc_sg, ins_sg, loc_sg`, and the same five for `_pl`.
  - The nominative stays in `base` (singular) and `plural`, which labels and search already read.
- **Gender:** `noun_lexemes.gender` is already `masc | fem | neut`.
- **Animacy and personhood** come from the concept columns `animate` and `human` that `lexicon.ts`
  already threads into `forms` ([`lexicon.ts:66-67`](../../../../packages/backend/src/lexicon.ts#L66-L67)):
  - Polish masculine-personal = `human` + `masc`; masculine-animate = `animate` + `masc`.
  - Russian/Ukrainian animate accusative = `animate`.
- **Pronouns:** declined in `pronoun_forms` with the same case keys.

Each engine defines its own case type in `<lang>.types.ts`. `de/de.types.ts:4` is the model
(`'nom' | 'acc' | 'dat' | 'gen'`); language folders never import one another, so there is no shared
Slavic module.

### 0.3 The aspect-selection table (D2)

| engine cell | aspect | pl | ru | uk |
|---|---|---|---|---|
| present, neutral | imperfective | je | ест | їсть |
| past, neutral | **perfective** | zjadł | съел | зʼїв |
| future, neutral | **perfective** | zje | съест | зʼїсть |
| progressive (any tense) | imperfective | je / jadł / będzie jadł | ест / ел / будет есть | їсть / їв / їстиме |
| prospective | perfective future after "about to" | zaraz zje | вот-вот съест | ось-ось зʼїсть |
| resultative | perfective past | zjadł | съел | зʼїв |
| with a frequency adverb (*always*, *never*) | imperfective | zawsze je | всегда ест | завжди їсть |
| under a modal | perfective infinitive; imperfective if the modal is negated | musi zjeść / nie musi jeść | должен съесть / не должен есть | мусить зʼїсти / не мусить їсти |
| conditional (both clauses) | perfective | zjadłby | съел бы | зʼїв би |
| imperative | perfective; **imperfective when negative** | zjedz / nie jedz | съешь / не ешь | зʼїж / не їж |
| negation otherwise | unchanged | nie zjadł | не съел | не зʼїв |

- **Why perfective for the neutral past and future:** the engine's `past` has always meant the simple
  perfective past (*passato remoto*, *passé simple*).
- **Negation:** a negated past often prefers the imperfective in Russian (*не ел*, "didn't eat at
  all"). That is a question for the reviewer, not a phase-1 rule.
- **Motion verbs** (RUN, GO, COME) pair a *determinate* imperfective with a prefixed perfective
  (*biec/pobiec*, *бежать/побежать*, *бігти/побігти*). The indeterminate verbs (*biegać*, *бегать*,
  *бігати*) are out of scope.

### 0.4 Determiners and quantifier government

There are no articles. The existing determiner values map as follows:

| value | pl | ru | uk | effect |
|---|---|---|---|---|
| definite, indefinite, bare | — | — | — | nothing rendered |
| this / that | ten / tamten | этот / тот | цей / той | agrees with the noun |
| all | wszystkie (wszyscy for persons) | все | всі | plural, noun keeps its case |
| no | żaden | никакой | жоден | agrees **and** negates the verb |
| some | kilka | несколько | кілька | **genitive plural**, verb **3sg neuter** |
| many | wiele (wielu for persons) | много | багато | as *some* |
| few | mało | мало | мало | as *some* |

"Governs genitive plural, verb singular neuter" is the one new agreement rule: *wiele kotów **je***,
*много кошек **ест***. It belongs in each engine's clause assembly.

### 0.5 Reflexive possessives — a small plan addition

When a possessive pronoun refers back to the **subject of its own clause**, Polish, Russian and Ukrainian
use a reflexive possessive: *kot je **swoje** jedzenie* ("the cat eats its [own] food") vs *kot je
**jego** jedzenie* ("… his [someone else's] food").

- **Today:** `PronominalPossessor` carries only `person`, `number` and `gender`
  ([`shared/src/index.ts:527-533`](../../../../packages/shared/src/index.ts#L527-L533)). The canvas knows
  which noun was picked as the antecedent, but the plan loses it.
- **Proposal:** add `subjectAntecedent?: boolean`, set by `selectionToPlan` when the picked antecedent is
  the clause's own subject. The seven existing engines ignore it. It would also serve future Scandinavian
  *sin/sitt* or Latin *suus*.

### 0.6 Relative pronouns

*który* / *который* / *який* decline for the head's gender and number and take their case from their
role in the clause. `de/relativePronoun.ts` already does exactly this for German *der/dem/den*, and is
the model.

## 1. Data — what a Polish column costs

| role | concepts | Polish forms | notes |
|---|---|---|---|
| noun | 108 | ~1,300 | base, plural, gender + 10 case forms (D3) |
| verb | 57 | ~1,750 | per aspect: infinitive, 6 × present (imperfective) or future (perfective), 5 × *l*-participle (`past_masc`, `past_fem`, `past_neut`, `past_virile`, `past_nonvirile`), 3 × imperative, adverbial participle (*jedząc*) |
| adjective | 58 | ~120 | `base`, `virile_plural`, `comparative` (D4) |
| adverb | 6 | ~12 | *szybko, wolno, dobrze, razem, zawsze, nigdy* (`polarity: negative`) |
| pronoun | 4 | ~110 | *ja, ty, on/ona/ono, my, wy, oni/one*, each in 6 cases (*mnie, mi, mną, …*) |

**About 3,300 values**, roughly double a Romance language. Most of the difference is the noun
paradigms and the second aspect.

- **Past and conditional** are **built from the *l*-participle**, never stored per person: *zjadł-em,
  zjadł-aś, zjedli-śmy*; conditional *zjadł-by-m*.
- **Imperfective future** is *być* + *l*-participle (*będzie jadł*), also derived.
- **Verbs to settle first:** *być, mieć, iść/pójść, jeść/zjeść, widzieć/zobaczyć, móc, chcieć, musieć,
  stać się, dać/dawać*.

## 2. The engine — `packages/engine/src/languages/pl/`

Expect **~60 source files, ~2,000 LOC**: more than German (58 / 1,626), because every noun-phrase word
declines.

### 2.1 Noun phrase

- **Case assignment by slot:**

  | slot | case |
  |---|---|
  | subject | nominative |
  | direct object | accusative, **genitive when the verb is negated** |
  | terminus | dative |
  | possessor | genitive, postnominal (*jedzenie kota*) |
  | noun modifier | genitive (*twórca fraz semantycznych*) |
  | predicative noun | instrumental (*jest legendą*, *staje się legendą*) |
  | predicative adjective | nominative (*jest szczęśliwy*) |

- **Accusative of masculine animates** = genitive (*widzę psa*); for masculine-personal plurals too
  (*widzę chłopców*).
- **Adjectives:** prenominal, declined by rule from `base` (§D4): the hard *-y* and soft *-i* stems, the
  *-k/-g* spelling rule, and the masculine-personal nominative plural from the stored form.
- **Degree:** synthetic comparative from the stored form (*większy*), superlative *naj-* + comparative
  (*największy*); analytic *bardziej / najbardziej* for adjectives without one.
- **Possessives:** *mój, twój, jego/jej, nasz, wasz, ich*, and ***swój*** (§0.5). All decline except
  *jego/jej/ich*.

### 2.2 Verb group

- **Pro-drop:** a bare pronoun subject is dropped, as in `es/renderClause.ts`.
- **Tense × aspect:** follows §0.3.
  - The past agrees in **person and gender**; the person endings attach to the *l*-participle.
  - First and second person need the subject's gender, which the pronoun chooser already asks for.
    Default to masculine when it is unknown.
- **Negation:** *nie* before the finite verb, plus the genitive of negation on the direct object.
  Negative concord: *nigdy nie*, *żaden … nie*.
- **Modals:** *musieć* (MUST), *móc* (CAN), *chcieć* (WILL), with inner modals as infinitives (*chce
  móc iść*).
- **Copula:**
  - *być* + nominative adjective / instrumental noun.
  - BECOME = *stać się*. Reflexive *się* is a clitic: it follows the verb in simple clauses, and moves
    to second position in longer ones. That placement is a phase-2 simplification.
- **Generic subject:** *się* impersonal (D5).

### 2.3 Complements — prepositions and the case they govern

| complement | Polish | case |
|---|---|---|
| locative | *w* (*w domu*); specifiers *na* (on), *pod* (under), *za* (behind), *przed* (in front of), *wokół* (around) | locative; *pod/za/przed* + instrumental; *wokół* + genitive |
| direction | *do* (*do domu*, *do dziecka*); *ku* for "towards" | *do* + genitive; *ku* + dative |
| source | *od* (away from: *od domu*) | genitive |
| route | *przez* (*przez dom*) | accusative |
| cause | *z powodu* / *dzięki* / *przez* (fault) | genitive / dative / accusative |
| manner | similative *jak* (*jak woda*); mode *z* (*z radością*); means: bare instrumental | *jak* + nominative; *z* + instrumental |
| instrumental | bare **instrumental**, no preposition (*nożem*) | instrumental |
| terminus | bare **dative** (*dziecku*) | dative |
| predicative | none | instrumental (noun) / nominative (adjective) |

**Euphony:** *w/we*, *z/ze* before some consonant clusters (*we wtorek*, *ze szkoły*). A small rule in
the preposition helper.

**Relatives:** *który* (§0.6). **Coordination:** *i*, *ale*, *lub/albo*.

### 2.4 Moods

- **Conditional:** *l*-participle + *by* + person ending (*zjadłbym*, *zjadłaby*).
- **If-clause:** ***gdyby*** + *l*-participle, with the person marker on *gdyby* (*gdybym zjadł*).
- **Imperative** (D6): perfective by default, imperfective when negated (§0.3).
- **Infinitive / citation:** the infinitive of the aspect the cell selects.

## 3. Interface

- **Language names:** *polski* in Polish, a substantivised adjective (*język polski*) whose case forms
  (*polskiego, polskim*) are stored as noun forms. Polish in each language: *Polish, polacco, polonais, Polnisch,
  polaco, polonês, polonès, ポーランド語*. The existing languages named in Polish: *angielski, włoski,
  francuski, niemiecki, hiszpański, japoński, portugalski, kataloński*.
- **Fonts:** Lora, Inter and Playfair Display cover *ą ć ę ł ń ó ś ź ż*.
- **Typeahead:** fold diacritics in search (*zolw* → *żółw*), as P03 §3 proposes.

## 4. Testing and review

As P03 §4:

- **Unit:** colocated unit tests in `languages/pl/`.
- **Sentence suite:** `packages/engine/test/languages/pl.test.ts`. One test per row of §0.3 and per row
  of the case-assignment table.
- **Native review** before promotion. The aspect table is the part most likely to be amended.
- **e2e:** one `expectSentences` line per phase.

## 5. Phases

| # | Ships | Done when |
|---|---|---|
| 0 | P03 §0 general groundwork + §0 Slavic groundwork (`pf_` keys, case keys, `subjectAntecedent`) | the existing suite is green; a `preview` language with no forms boots |
| 1 | `pl` preview: case assignment, noun and adjective declension, pronouns, pro-drop, present tense, demonstratives | subject/object/terminus sentences with adjectives render in the `pl` suite |
| 2 | Aspect table, past/future/conditional from *l*-participles, negation with genitive, modals, copula and *stać się*, degree, quantifier government | every row of §0.3 has a passing test |
| 3 | Complements with case government, relatives, coordination, *gdyby* conditionals, imperative, infinitive, instrumental levels, possessives with *swój* | every sentence suite has a `pl` expectation under the preview gate |
| 4 | UI strings and definitions render, native review, `pl` in the exhaustive tests and snapshots → `ready` | Polish is selectable as the interface language |

## 6. Risks

- **Aspect is a modelling choice, not a fact.** A plan that doesn't say whether an action was completed
  will sometimes get the "wrong" aspect. A later `completion` flag on the verb phrase would make it
  explicit; out of scope here.
- **The conjugation snapshot explodes.** The `verb.conjugation` snapshot multiplies again, by cases and
  both aspects. Consider a separate snapshot file per Slavic language.
- **Clitic placement** (*się*, *by*, person markers) in long clauses is simplified, and documented as
  such.
- **Data licensing** for SGJP/PoliMorf (D7).

## Out of scope

Indeterminate motion verbs; the vocative; *się* second-position placement beyond simple clauses;
numerals and their case government; a completion flag on the verb phrase; the passive
([A01](../../Z-Done/A01-passive-voice/README.md)) for Polish, which will need *zostać* + passive
participle when A01 lands.
