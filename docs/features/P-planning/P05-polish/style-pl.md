# Polish (`pl`) — the style sheet and the column's shape

The conventions every `pl` string in the corpus (`packages/backend/src/concepts/pl/`) and the engine
(`packages/engine/src/languages/pl/`) follows. **Standard written Polish** (*polszczyzna ogólna*), in the
current orthography of the Rada Języka Polskiego.

Drafted 2026-09-28 by the implementer from model knowledge (P05 D7: SGJP and PoliMorf are consulted,
never ingested). **Not yet reviewed** — every form is *(verify)* until the native review
([P05-E11](README.md#7-tasks-e1e12)).

## Spelling

- Polish letters: *ą ć ę ł ń ó ś ź ż*, always written, never approximated (*żółw*, not *zolw*). Search
  folds them (`fold`, P05 §3).
- **Language names and nationality adjectives are lowercase** (*polski, angielski*); the UI capitalises.
- *nie* is written apart from verbs (*nie je*) and together with adjectives and adverbs in the positive
  degree (*niedobry*, *nieduży*) — the engine only ever negates verbs.
- The corpus never stores *się* in a finite cell, a person ending on the *l*-participle, or a
  preposition's euphonic vowel (*we, ze, ode*): all three are the engine's.

## The column's shape

`LanguageColumn` entries keyed by concept id, one file per role (`nouns-a/b/c.ts`, `verbs-a/b.ts`,
`adjectives.ts`, `adverbs.ts`, `pronouns.ts`, `interjections.ts`), merged by `concepts/pl/index.ts`.
Entries are built with the helpers in `concepts/pl/helpers.ts`, so the keys are the same everywhere.
A concept left out **borrows German** (`columns.ts`), so a hole is a quality issue, not a crash — but
the target is **every concept, nothing borrowed**.

**Non-word keys.** Mirror the flags of the German and Spanish entries that describe *meaning*
(`subtype`, `polarity`, `negative_slot`, `interrogative`, `fuses_with`/`fused`, `thing`, `generic`,
`person`, `number`, `subject_sense`, `object_sense`, `infinitive_sense`, `content_clause_force`,
`seeming`, `copula`, `causative`, `experiencer`, `ordinal`, …), translating the value where it is a
word. Drop the ones that are a feature of German or Spanish only (`particle`, `umlaut`, `weak`,
`compound`, `stressed_a`, `object_a`, `takes_article`, `subjunctive_stem`, `aux`), with a comment where
the choice is not obvious.

### Nouns — `nouns-a.ts`, `nouns-b.ts`, `nouns-c.ts`

Every case is stored (P05 D3): Polish stem alternations (*pies → psa*, *ręka → ręce*, *dziecko →
dzieci*, *przyjaciel → przyjaciele, przyjaciół*) are too many to derive.

| key | meaning | *kot* | *książka* |
|---|---|---|---|
| `base` | nominative singular | kot | książka |
| `gen_sg`, `dat_sg`, `acc_sg`, `ins_sg`, `loc_sg`, `voc_sg` | the other singular cases | kota, kotu, kota, kotem, kocie, kocie | książki, książce, książkę, książką, książce, książko |
| `plural` | nominative plural | koty | książki |
| `gen_pl`, `dat_pl`, `acc_pl`, `ins_pl`, `loc_pl` | the other plural cases | kotów, kotom, koty, kotami, kotach | książek, książkom, książki, książkami, książkach |
| `gender` | `masc` \| `fem` \| `neut` — the **agreement** gender (*mężczyzna* is `masc`) | masc | fem |
| `count` | always `'singular'`, as every column | | |
| `animate_acc: '1'` | masculine whose accusative singular is its genitive: animals, people, and the few inanimate nouns that behave so (*grzyb → grzyba*) | ✓ | |
| `virile: '1'` | masculine personal: the plural is virile (*chłopcy*, accusative = genitive *chłopców*), and adjectives and past verbs take the virile plural (*dobrzy chłopcy zjedli*) | | |

- A masculine personal noun in *-a* (*tata, twórca, mężczyzna*) is `virile` **without** `animate_acc`:
  its own accusative is *tatę*, not the genitive. Its adjective still agrees as an animate masculine
  (*dobrego tatę*), so **the engine reads `animate_acc || virile`** for the adjective's accusative.
- Written with `m`, `ma` (adds `animate_acc`), `mp` (adds `animate_acc` and `virile`), `f`, `n`:
  `CAT: ma('kot, kota, kotu, kota, kotem, kocie, kocie', 'koty, kotów, kotom, koty, kotami, kotach')`.
- **A person or animal with a feminine** (*kot/kotka*, *nauczyciel/nauczycielka*) carries the feminine's
  whole paradigm under `fem_` keys: `...paradigm('kotka, kotki, …', 'kotki, kotek, …', 'fem_')` →
  `fem`, `fem_gen_sg`, …, `fem_plural`, `fem_gen_pl`, …. The feminine agrees as `fem`, its plural never
  virile.
- **Mass nouns** (concepts marked `countable: false`) store no plural, unless Polish uses one for the
  sense.
- **Plural-only nouns** (*pieniądze, plecy, drzwi, wiadomości*) carry `plurale_tantum: '1'`, the
  plural paradigm, and **the same plural forms in every singular key** (`base` = *pieniądze*, `gen_sg`
  = *pieniędzy*, …, `voc_sg` = the nominative), so a reader of either number gets the plural. Gender
  `masc` without `virile`: a non-virile plural agrees the same whatever its singular's gender.
- **Proper nouns and language names**: language names are substantivised adjectives (*polski,
  polskiego, polskiemu, polski, polskim, polskim, polski*), masc inanimate, no plural. A continent or
  country declines as a noun (*Afryka, Afryki, Afryce, Afrykę, Afryką, Afryce, Afryko*).
- **Multiword nouns** store every case of the whole phrase (*dopełnienie bliższe, dopełnienia
  bliższego, …*). A head noun with a genitive complement declines only the head (*twórca fraz*).
- **Indeclinable nouns** (*kakao, menu, kiwi*) repeat the base in every cell.
- The vocative plural is the nominative plural and is not stored.

### Verbs — `verbs-a.ts`, `verbs-b.ts`

One lexeme holds both aspects (P05 D1), written with `verb(imperfective, perfective?, extra?)`:

| key | meaning | *jeść / zjeść* |
|---|---|---|
| `base` | imperfective infinitive — the label and search form | jeść |
| `{p}_present` (`1sg` … `3pl`) | imperfective present | jem, jesz, je, jemy, jecie, jedzą |
| `past_masc, past_fem, past_neut, past_virile, past_nonvirile` | imperfective *l*-participle | jadł, jadła, jadło, jedli, jadły |
| `past_stem_masc` | only where the 1sg/2sg masculine stem differs from `past_masc` | (*mógł → mogł-em*) |
| `2sg_imperative, 1pl_imperative, 2pl_imperative` | imperfective imperative | jedz, jedzmy, jedzcie |
| `adverbial` | contemporary adverbial participle | jedząc |
| `passive, passive_virile` | passive participle, masc sg and virile pl (transitive verbs) | jedzony, jedzeni |
| `pf_base` | perfective infinitive | zjeść |
| `pf_{p}_future` | perfective simple future | zjem, zjesz, zje, zjemy, zjecie, zjedzą |
| `pf_past_*`, `pf_past_stem_masc`, `pf_*_imperative`, `pf_passive*` | the same cells of the perfective | zjadł …; zjedz …; zjedzony, zjedzeni |

- **No `pf_` keys** = unpaired or biaspectual (*kochać*, *wiedzieć*, *musieć*, *móc*, *mieć*), and the
  engine uses the imperfective everywhere.
- **The partner** is the ordinary perfective a dictionary pairs with the verb (*robić/zrobić,
  widzieć/zobaczyć, mówić/powiedzieć, brać/wziąć, dawać/dać, kupować/kupić, pisać/napisać*). Motion
  verbs pair the **determinate** imperfective with its *po-* perfective (*biec/pobiec, iść/pójść,
  jechać/pojechać, lecieć/polecieć, płynąć/popłynąć*); the indeterminate *biegać, chodzić* are out of
  scope (P05 §0.3).
- **Never stored** (the engine builds them): the person endings on the *l*-participle (*jadłem,
  jadłaś, jedliśmy*), the conditional (*jadłbym*), the imperfective future (*będę jadł*), the
  impersonal (*je się*).
- **BE** (*być*) alone also stores `{p}_future` (*będę, będziesz, będzie, będziemy, będziecie, będą*),
  which the imperfective future is built with, and its present *jestem … są*.
- **Reflexive verbs** pass `extra: { reflexive: '1' }` and keep *się* only on `base`/`pf_base`
  (*stawać się / stać się*); every other cell is bare. Decide by Polish, not by Spanish: *bać się*
  is reflexive where English *fear* is not; *wracać* is not where Spanish *volverse* is.
- **Government** (`extra`):
  - `object_case: 'gen' | 'dat' | 'ins'` — a direct object in a case other than the accusative
    (*szukać* + gen, *pomagać* + dat, *rządzić* + ins).
  - `object_prep` + `object_prep_case` — an object with a preposition (*czekać na* + acc, *myśleć o*
    + loc, *bać się* has `object_case: 'gen'`).
  - `terminus_prep` + `terminus_prep_case` — a terminus that takes a preposition instead of the bare
    dative (ADD *dodać do* + gen, LINK *połączyć z* + ins).
  - `object_predicative_link` — the preposition before an object predicate (TRANSFORM *przekształcić
    w* + acc); its case is the accusative.
  - `infinitive_link` only where Polish needs a word before an infinitive; most verbs take it bare
    (*chce jeść*, *zaczyna jeść*).
- **Stative concepts stay unpaired** even where a dictionary lists a perfective (*kochać*, *wiedzieć*,
  *pamiętać*, *mieć*, *trzymać*): the prefixed verb means something else (*zapamiętać* = memorise).
- A verb is **one word** (the engine appends person endings to `past_masc`); a multiword verb needs a
  new key first.
- **Modals:** MUST *musieć*, CAN *móc*, WILL (want) *chcieć* — no `pf_` keys.

### Adjectives — `adjectives.ts`

`adj(base, virile, comparative?, extra?)` (P05 D4). The engine declines from `base`:

| | masc | fem | neut | virile pl | non-virile pl |
|---|---|---|---|---|---|
| nom | dobry | dobra | dobre | **dobrzy** (stored) | dobre |
| gen | dobrego | dobrej | dobrego | dobrych | dobrych |
| dat | dobremu | dobrej | dobremu | dobrym | dobrym |
| acc | dobry / dobrego (animate) | dobrą | dobre | dobrych | dobre |
| ins | dobrym | dobrą | dobrym | dobrymi | dobrymi |
| loc | dobrym | dobrej | dobrym | dobrych | dobrych |

- `base` ends in *-y* (hard) or *-i* (soft, and after *k, g*: *wysoki, drogi*). An adjective that does
  not (*sam, rad*) says so in a comment and stores its full table under `fem, neut, …` keys.
- `virile`: always stored (*wysocy, drodzy, mali, nowi, mądrzy, polscy*).
- `comparative`: the synthetic comparative, masc nom sg (*większy, lepszy, gorszy, mniejszy,
  szybszy*). Omitted when Polish says *bardziej* + positive. The superlative is always *naj-* +
  comparative (*największy*), or *najbardziej* + positive.
- `position: 'post'` on a classifying adjective that follows its noun (*język polski*, *kot domowy*).
  Default prenominal.

### Adverbs, pronouns, interjections

- **Adverbs** mirror the Spanish entry's keys one for one: *nigdy* keeps `polarity: 'negative'` (it
  triggers *nie* on the verb, negative concord), `comparative`/`superlative` where synthetic
  (*szybciej, najszybciej*).
- **Pronouns** (`pronouns.ts`) keep es/de's `person`, `number`, `gender`, `generic`, `thing` flags. The
  cases are keyed as nouns are, with variant prefixes:

  | key | *ja* | *on* |
  |---|---|---|
  | `base` | ja | on |
  | `gen`, `dat`, `acc`, `ins`, `loc` | mnie, mnie, mnie, mną, mnie | jego, jemu, jego, nim, nim |
  | `gen_short`, `dat_short`, `acc_short` (clitic, where it exists) | —, mi, — | go, mu, go |
  | `prep_gen`, `prep_dat`, `prep_acc`, `prep_ins`, `prep_loc` (after a preposition) | — | niego, niemu, niego, nim, nim |

  The 3rd person's other variants carry the same keys under `fem_` (*ona, jej, jej, ją, nią, niej*),
  `neut_` (*ono, jego, jemu, je, nim, nim*), `plural_` (virile *oni, ich, im, ich, nimi, nich*) and
  `plural_fem_` (non-virile *one, ich, im, je, nimi, nich*); the nominatives are `singular_fem`,
  `singular_neut`, `plural`, `plural_fem`, as Spanish names them. *my/wy* are `plural` + `plural_*` on
  the 1st and 2nd person. GENERIC_PERSON is `base: 'się'`, `generic: '1'` (P05 D5).
  SOMETHING *coś*, SOMEONE *ktoś*, EVERYTHING *wszystko*: every case, and `negative` (*nic, nikt*) with
  its cases under `negative_` (*niczego/nic, nikogo, …*).
- **Interjection:** HEY *hej*.

## The engine, for reference

- **No articles.** `definite`, `indefinite` and `bare` render nothing; *ten/ta/to* (this),
  *tamten* (that), *wszystkie/wszyscy* (all), *żaden* (no, + *nie* on the verb), *kilka/wiele/mało*
  (some/many/few, governing the genitive plural and a 3sg neuter verb, P05 §0.4).
- **Case by slot** (P05 §2.1), **aspect by cell** (§0.3), **prepositions by complement** (§2.3).
- **Pro-drop:** a bare pronoun subject is dropped (*jemy*), as in Spanish.
