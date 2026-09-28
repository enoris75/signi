# Lithuanian (`lt`) — the style sheet and the column's shape

The conventions every `lt` string in the corpus (`packages/backend/src/concepts/lt/`) and the engine
(`packages/engine/src/languages/lt/`) follows. **Standard Lithuanian** (*bendrinė lietuvių kalba*) as
the State Commission of the Lithuanian Language (VLKK) codifies it (P18 D1).

Drafted 2026-09-28 by the implementer from model knowledge (P18 D12: the VLKK *Dabartinės lietuvių
kalbos žodynas* and the *Lietuvių kalbos žodynas* are consulted, never ingested). **Not yet reviewed**:
every form is *(verify)* until the native review ([P18-E12](README.md#6-tasks-e1e13)). A `// (verify)`
comment marks the choices the author is specifically unsure of.

## Spelling

- Lithuanian letters: *ą č ę ė į š ų ū ž*, always written, never approximated (*žuvis*, not *zuvis*).
  Search folds them (`fold`; all nine decompose, so no hand mapping as Polish *ł* needed).
- **No stress marks.** Standard spelling does not write the accent, and neither does the corpus.
- **Language names and nationality words are lowercase** (*lietuvių kalba, anglų kalba*); the UI
  capitalises.
- *ne-* is written **together** with the verb (*nevalgo*, *nesuvalgė*, *nėra*). The corpus stores the
  positive forms only; negation is the engine's.
- **Never stored** (the engine builds them): the negated verb, the reflexive *-si* of a suffix-reflexive
  verb, the declined cases of an adjective (the engine declines from `base`, `fem` and the class).

## The column's shape

`LanguageColumn` entries keyed by concept id, one file per role (`nouns.ts`, `verbs.ts`,
`adjectives.ts`, `adverbs.ts`, `pronouns.ts`, `interjections.ts`), merged by `concepts/lt/index.ts`.
Entries are built with the helpers in `concepts/lt/helpers.ts` (P18 D3, D4), so the keys are the same
everywhere and each class is pinned by one worked paradigm in `helpers.test.ts`. A concept left out
**borrows Polish** (`columns.ts`, P18 D10), so a hole is a quality issue, not a crash; the target is
**every concept, nothing borrowed**. A role file may split into `-a/-b` files as Polish's did, if one
file grows past review size.

**Keys are Polish's** ([style-pl.md](../P05-polish/style-pl.md)) wherever the two languages agree, and a
key Polish needs that Lithuanian has no use for is simply not written (`animate_acc`, `virile`, the
*l*-participle's `past_*`).

**Non-word keys.** Mirror the flags of the Polish entry that describe *meaning* (`subtype`, `polarity`,
`negative_slot`, `interrogative`, `thing`, `generic`, `person`, `number`, `subject_sense`,
`object_sense`, `infinitive_sense`, `content_clause_force`, `seeming`, `copula`, `causative`,
`experiencer`, `ordinal`, the government keys, …), translating the value where it is a word or a case.
Drop the ones that are a feature of Polish only, with a comment where the choice is not obvious.

### Nouns — `nouns.ts`

Every case is stored (P18 D3), keyed as Polish's:

| key | meaning | *namas* | *katė* |
|---|---|---|---|
| `base` | nominative singular | namas | katė |
| `gen_sg`, `dat_sg`, `acc_sg`, `ins_sg`, `loc_sg`, `voc_sg` | the other singular cases | namo, namui, namą, namu, name, name | katės, katei, katę, kate, katėje, kate |
| `plural` | nominative plural | namai | katės |
| `gen_pl`, `dat_pl`, `acc_pl`, `ins_pl`, `loc_pl` | the other plural cases | namų, namams, namus, namais, namuose | kačių, katėms, kates, katėmis, katėse |
| `gender` | `masc` \| `fem` — Lithuanian nouns have no neuter | masc | fem |
| `count` | always `'singular'`, as every column | | |

Written with a **class helper** and the stem, the part before the nominative ending:

| helper | class | example | notes |
|---|---|---|---|
| `as` | masc *-as* | `as('nam')` *namas* | soft *-ias*: pass the stem with its *i* (`as('keli')` *kelias*, `as('sveči')` *svečias → svetyje*); *-jas*: `as('vėj')` *vėjas, vėjyje, vėjau* |
| `is` | masc *-is* (*io*-stem) | `is('brol')` *brolis* | *t/d* soften before *io*: `is('med')` *medis, medžio* |
| `ys` | masc *-ys* | `ys('arkl')` *arklys* | as `is` |
| `us` | masc *-us* | `us('sūn')` *sūnus* | *-ius*: `us('skaiči')` *skaičius*, which takes the *io* plural (*skaičiai*) |
| `a` | fem *-a*, *-ia* | `a('rank')` *ranka*, `a('žini')` *žinia* | a masculine *-a* noun passes `'masc'` |
| `e` | fem *-ė* | `e('kat')` *katė, kačių* | a masculine *-ė* (*dėdė*) passes `'masc'` |
| `i` | fem *i*-stem | `i('šird')` *širdis, širdžių* | `{ genPl: 'naktų' }` for the *-ų* nouns (*naktis, ausis*); masculine *dantis* passes `'masc'` |
| `paradigm` + `noun` | anything else | *šuo, šuns …*; *akmuo, akmens …*; *sesuo, sesers …*; *duktė, dukters …*; *mėnuo, mėnesio …*; *žmogus / žmonės* | the whole paradigm, nom → voc, then nom → loc plural |

- **A person or animal with a feminine** (*katinas/katė*, *mokytojas/mokytoja*) carries the feminine's
  whole paradigm under `fem_` keys: `as('katin', { extra: fem(e('kat')) })`. The feminine agrees as
  `fem`.
- Which noun is the plain word for the animal follows the language, not English: CAT is *katė*
  (feminine, the general word), with *katinas* the tomcat — so CAT is `e('kat')` and has no `fem_`
  cells. `// (verify)` each such choice.
- **Mass nouns** (concepts marked `countable: false`) pass `{ sgOnly: true }`, unless Lithuanian uses a
  plural for the sense.
- **Plural-only nouns** (*pinigai, durys, marškiniai, žirklės*) carry `plurale_tantum: '1'` and the
  plural paradigm in **every singular key too** (as Polish does), so a reader of either number gets the
  plural. `voc_sg` = the nominative plural.
- **Language names**: `language('<people, genitive plural>')` → *lietuvių kalba, lietuvių kalbos, …*
  (P18 §3), feminine, no plural: *anglų, italų, prancūzų, vokiečių, ispanų, japonų, portugalų,
  katalonų, lenkų, retoromanų*; Swiss German is *šveicarų vokiečių*.
- **Proper nouns**: a country or continent declines as a noun (*Afrika, Afrikos, …*; *Italija,
  Italijos*); a person's name takes the proper-name vocative (*Jonai*, *Petrai*) where the class helper
  would give *-e*: override `voc_sg`.
- **Multiword nouns** store every case of the whole phrase; a head with a genitive complement declines
  only the head (*frazių kūrėjas, frazių kūrėjo, …*).
- **Indeclinable nouns** (*kakava* declines; *kino, meniu, kivi* do not) repeat the base in every cell.

### Verbs — `verbs.ts`

One lexeme holds both aspects (P18 D5, P05 D1), written with `verb(imperfective, perfective?, extra?)`
from the dictionary's **three principal parts**: infinitive, 3rd-person present, 3rd-person past.

```ts
EAT: verb('valgyti, valgo, valgė', 'suvalgyti, suvalgo, suvalgė'),
BE: verb({ parts: 'būti, yra, buvo', over: { '1sg_present': 'esu', '2sg_present': 'esi', '1pl_present': 'esame', '2pl_present': 'esate' } }),
```

| key | meaning | *valgyti* |
|---|---|---|
| `base` | infinitive — the label and search form | valgyti |
| `{p}_present` (`1sg` … `3pl`) | present | valgau, valgai, valgo, valgome, valgote, valgo |
| `{p}_past` | simple past | valgiau, valgei, valgė, valgėme, valgėte, valgė |
| `{p}_frequentative` | frequentative past (*used to*, with *always*) | valgydavau … valgydavo |
| `{p}_future` | future | valgysiu, valgysi, valgys, valgysime, valgysite, valgys |
| `{p}_conditional` | conditional | valgyčiau, valgytum, valgytų, valgytume, valgytumėte, valgytų |
| `2sg_imperative, 1pl_imperative, 2pl_imperative` | imperative | valgyk, valgykime, valgykite |
| `adverbial`, `adverbial_fem`, `adverbial_plural`, `adverbial_fem_plural` | the half-participle (*pusdalyvis*), agreeing with the subject | valgydamas, valgydama, valgydami, valgydamos |
| `past_active`, `_fem`, `_plural`, `_fem_plural` | active past participle, for the resultative (*yra suvalgęs*) | valgęs, valgiusi, valgę, valgiusios |
| `passive`, `_fem`, `_plural`, `_fem_plural`, `passive_neut` | passive past participle (A01) and its neuter | valgytas, valgyta, valgyti, valgytos, valgyta |
| `pf_…` | every key above, for the perfective | suvalgyti, suvalgau …, suvalgysiu … |

The 3rd person is one form for both numbers; the `3pl_*` keys repeat `3sg_*`, so the engine can read
any person key as every other engine does.

- **What the helper derives**, each pinned in `helpers.test.ts`:
  - the present from its 3rd person: *-a* (*eina → einu, eini*; *šaukia → šaukiu, šauki*), *-i*
    (*myli → myliu*; *t/d* soften in the 1sg: *girdi → girdžiu*), *-o* (*valgo → valgau*);
  - the past from its 3rd person: *-o* (*ėjo → ėjau*), *-ė* (*matė → mačiau, matei*);
  - everything else from the infinitive stem: the future (a sibilant stem takes no second *s*: *nešti →
    nešiu, neš*; *vežti → vešiu*; a one-syllable *y/ū* stem shortens the 3rd person: *būti → bus*),
    the frequentative, the conditional, the imperative (a stem-final *g/k* is dropped before *-k*:
    *bėgti → bėk*), the half-participle and the passive participle;
  - the active past participle from the past (*valgė → valgęs, valgiusi*; *ėjo → ėjęs, ėjusi*).
- **`over`** replaces the cells a rule gets wrong (*būti*'s present *esu … yra*; *duoti*'s imperative is
  regular, but check each irregular verb's table: *eiti, būti, duoti, dėti, imti, gauti, žinoti*).
- **No `pf` argument** = unpaired or biaspectual (*mylėti*, *žinoti*, *būti*, *turėti*, *galėti*,
  *norėti*), and the engine uses the one set everywhere.
- **The partner** is the ordinary perfective a dictionary pairs with the verb: *valgyti/suvalgyti,
  daryti/padaryti, rašyti/parašyti, matyti/pamatyti, sakyti/pasakyti, gerti/išgerti,
  skaityti/perskaityti, pirkti/nupirkti, duoti/atiduoti* `// (verify)`. Motion verbs pair with their
  *nu-* / *at-* perfective only where the sense is kept (*bėgti/nubėgti*); leave a verb unpaired rather
  than pair it with a prefix that changes the meaning.
- **Stative concepts stay unpaired** (*mylėti, žinoti, turėti, norėti*), as in Polish.
- **Reflexive verbs**:
  - *suffix* reflexives (*praustis, juoktis, mokytis*) write their parts **without** *-si*
    (`'praustis, prausia, prausė'`) and pass `{ reflexive: '1' }`. `base` keeps *-tis*; every other
    cell is bare. The engine attaches *-si* to an affirmative form (*prausia → prausiasi*) and moves it
    in after *ne-* in a negative one (*nesiprausia*), P18 §2.2.
  - *prefix* reflexives (*nusiprausti, atsiminti, susitikti*) write the *-si-* inside their parts and
    carry no flag: negation is plain *ne-* (*nenusiprausė*).
  - Decide by Lithuanian, not by English or Polish: *juoktis* (laugh) is reflexive, *bijoti* (fear) is
    not.
- **Government** (`extra`), Polish's keys: `object_case: 'gen' | 'dat' | 'ins'` (*laukti* + gen,
  *padėti* + dat); `object_prep` + `object_prep_case` (*galvoti apie* + acc); `terminus_case`;
  `topic_prep` + `topic_prep_case` (*kalbėti apie* + acc); `terminus_prep` + `terminus_prep_case`;
  `infinitive_link` only where Lithuanian needs a word before an infinitive (most verbs take it bare:
  *nori valgyti*).
- **Modals:** MUST *turėti*, CAN *galėti*, WILL (want) *norėti* — no `pf_` keys.
- A verb is **one word**; a multiword verb needs a new key first.

### Adjectives — `adjectives.ts`

`adj(base, extra?)`, from the masculine nominative singular. The helper stores `base`, `fem`, `neuter`,
`comparative` and `superlative` (all nominative singular); the engine declines every case by class.

| class | *base* | fem | neuter | comparative | superlative |
|---|---|---|---|---|---|
| *-as* | geras | gera | gera | geresnis | geriausias |
| *-ias* | žalias | žalia | žalia | žalesnis | žaliausias |
| *-us* | gražus | graži | gražu | gražesnis | gražiausias |
| *-is* | didelis | didelė | dideli `// (verify)` | *didesnis* (irregular, passed) | *didžiausias* |

- The superlative softens *t/d* before *-iausias* (*baltas → balčiausias*, *saldus → saldžiausias*).
- **Irregular degrees** are passed in `extra`: `adj('didelis', { comparative: 'didesnis', superlative:
  'didžiausias' })`. An adjective with no synthetic degree (a relational adjective: *medinis*,
  *lietuviškas*) passes `{ comparative: '', superlative: '' }`, and the engine says *labiau /
  labiausiai* + positive.
- **Plain forms only** (P18 D8): never the definite *-sis* form (*baltasis*).
- `position: 'post'` is never needed: Lithuanian adjectives precede the noun.

### Adverbs, pronouns, interjections

- **Adverbs** mirror the Polish entry's keys one for one: *niekada, niekur* keep `polarity: 'negative'`
  (it triggers *ne-* on the verb, negative concord); `comparative` / `superlative` where synthetic
  (*greičiau, greičiausiai*).
- **Pronouns** (`pronouns.ts`) keep Polish's `person`, `number`, `gender`, `generic`, `thing` flags and
  its case keys (`gen, dat, acc, ins, loc`), with the 3rd person's variants under `fem_` (*ji, jos, jai,
  ją, ja, joje*), `plural_` (*jie, jų, jiems, juos, jais, juose*) and `plural_fem_` (*jos, jų, joms,
  jas, jomis, jose*). Lithuanian has no clitic or post-preposition forms, so none of Polish's `_short` or
  `prep_` keys. GENERIC_PERSON: P18 D7's subjectless 3rd person, `base: ''`, `generic: '1'`
  `// (verify)`. SOMETHING *kažkas*, SOMEONE *kažkas* (person), EVERYTHING *viskas*, with `negative`
  (*niekas*) and its cases under `negative_`.
- **Interjection:** HEY *ei*.

## The engine, for reference

- **No articles.** `definite`, `indefinite` and `bare` render nothing; *šis/ši* (this), *tas/ta*
  (that), *visi/visos* (all), *joks/jokia* (no, + *ne-* on the verb), *keli/kelios* (some, agreeing),
  *daug/mažai* (many/few, + genitive plural), P18 §2.1.
- **Case by slot**, the genitive **before** its head (P18 §2.1); **aspect by cell** (§0.3);
  **prepositions by complement**, the bare locative for plain "in" (§2.3).
- **Pro-drop** in the 1st and 2nd person only (P18 D6).
- **Possessives** *mano, tavo, jo, jos, mūsų, jūsų, jų*, and *savo* for a possessor coreferent with the
  subject (`coreferent: 'subject'`) — indeclinable, so no keys.
