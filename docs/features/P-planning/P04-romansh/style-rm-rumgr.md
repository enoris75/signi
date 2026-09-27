# Rumantsch Grischun (`rm-rumgr`) — the style sheet

The spelling conventions every `rm-rumgr` string in the corpus and the engine follows
([P04-E3 D2](P04-E3-sources-and-reviewers.md#d2-a-style-sheet-per-variety)). **Rumantsch Grischun
only**: a Sursilvan or Vallader form is a leak, not a variant (P04 D1).

Drafted 2026-09-27 by the implementer from the RG grammars and dictionary, consulted only
([sources.md](sources.md)). **Not yet reviewed** — every rule is *(verify)* until E19.

## Accents

RG writes a **grave** accent, and only on a **stressed final vowel** or to tell homographs apart:

| rule | examples |
|---|---|
| Past participles of *-ar* verbs end in stressed **-à**; *-ir* verbs in **-ì** | *mangià, chantà, lubì, fallì* — feminine and plural lose the accent: *mangiada, mangiads* |
| The copula's 3sg is **è**, apart from the conjunction *e* | *el è, e* (and) |
| Other stressed finals | *là, puspè, utschè, martgà, quinà* |
| **No acute**, no circumflex | never *é*, *ê* |
| Plural of a noun in **-à / -è** restores the stem | *martgà → martgads*, *utschè → utschels*, *quinà → quinads* |

## Elision and the article

| | masc | fem |
|---|---|---|
| definite sg | **il** | **la** |
| before a vowel | **l'** | **l'** |
| definite pl | **ils** | **las** |
| indefinite sg | **in** | **ina** |
| indefinite pl | — (bare) | — (bare) |

- **l'** before any vowel, both genders: *l'um, l'aua, l'auto, l'emna*. The engine elides (P04-E7);
  the corpus never stores the elided form.
- *da* elides before a vowel in fixed phrases the corpus stores: *cumplement d'argument, barra
  d'utensils*. *la* does not elide in the plural.
- Contractions of preposition + definite article, one word:

  | | il | ils | la | las |
  |---|---|---|---|---|
  | **a** | **al** | **als** | a la | a las |
  | **da** | **dal** | **dals** | da la | da las |
  | **en** | **en il** *(verify)* | **en ils** | en la | en las |
  | **sin** | **sin il** | **sin ils** | sin la | sin las |

  Only the masculine forms of *a* and *da* contract (*al, dal, als, dals*); before a vowel *a l',
  da l'* stay apart.

## Capitals

- **Language names are lowercase** (P04 §0.5): *rumantsch, rumantsch grischun, sursilvan, vallader,
  englais, talian, franzos, tudestg, spagnol, portugais, giapunais, tudestg svizzer*. The UI
  capitalises through `NAME_FORMAT`.
- Nationality adjectives lowercase: *american*.
- Proper names of places capitalised: *Europa, America dal Nord, Frantscha, Turitg*.

## Nouns

- Gender is **masc** or **fem**; RG has no neuter. Gender often differs from Italian: *il maun, il
  chau, l'isch* (m); *la mieur, la moda, la gruppa, la glista* (f).
- Plural: **-s** (*giat, giats*; *chasa, chasas*); none after a final **-s** (*urs, pajais, cas,
  process*); **-à → -ads**, **-è → -els**; irregular *um, umens*.
- Plural-only nouns carry `count: 'plural'`: *ils daners* (money), *las novitads* (news).
- Feminine of person and animal nouns stored as `fem`/`fem_plural`: *giat, giatta*; *ami, amia*.

## Adjectives

Four forms stored for every adjective (`base`, `fem`, `masc_plural`, `fem_plural`):

| pattern | masc sg | fem sg | masc pl | fem pl |
|---|---|---|---|---|
| regular | bun | buna | buns | bunas |
| | grond | gronda | gronds | grondas |
| *-el* drops its *e* | pussaivel | pussaivla | pussaivels | pussaivlas |
| *-en* drops its *e* | pitschen, giuven | pitschna, giuvna | pitschens, giuvens | pitschnas, giuvnas |
| participle *-à* | salvà | salvada | salvads | salvadas |
| participle *-ì* | lubì | lubida | lubids | lubidas |
| *-l* before a consonant | ault | auta | auts | autas |
| palatal | vegl | veglia | vegls | veglias |
| *-ss* takes no plural *-s* *(verify)* | bass | bassa | bass | bassas |
| invariable phrase | senza titel | senza titel | senza titel | senza titel |

Position: after the noun by default (*ina chasa gronda*). **Before the noun** (`position: 'pre'`):
*grond, pitschen, bun, vegl, giuven, bel*, and the determiner-like *emprim, segund, terz, proxim*
(NEXT), *ultim, auter, medem, vair* (genuine), *agen, sulet* *(verify the list)*.

## Pronouns

Subject pronouns are always written (not pro-drop): *jau, ti, el/ella, nus, vus, els/ellas*;
generic *ins*. Clitic objects *ma, ta, al/la, ans, as, als/las*; stressed *mai, tai, el/ella, nus,
vus, els/ellas*.

## Variety markers — the leak guard

Words that are RG and not Sursilvan or Vallader, or the reverse. A string in the RG row containing a
right-hand word is a leak (P04-E7's guard tests against this list).

| meaning | **RG** | Sursilvan | Vallader |
|---|---|---|---|
| is (3sg of *esser*) | **è** | ei | es |
| not (negation) | **na … betg** | buca | nu / na |
| I | **jau** | jeu | eu |
| with | **cun** | cun | cun (same — not a marker) |
| house | **chasa** | casa | chasa |
| cat | **giat** | gat | giat |
| dog | **chaun** | tgaun | chan |
| water | **aua** | aua | aua (same — not a marker) |
| man | **um** | um | hom |
| today | **oz** | oz | hoz |
| now | **ussa** | ussa | uossa |
| very | **fitg** | fetg | fich |
| something | **insatge** | enzatgei | alch |
| nothing | **nagut** | nuot | nüglia |
| always | **adina** | adina | adüna |
| participle *-ar* | **-à** (*mangià*) | **-au** (*mangiau*) | -à |
| infinitive *-ar* | **-ar** | -ar | -ar (same) |
| definite masc sg | **il** | il | il (same) |

The reliable single-token markers for the guard are ***è, betg, jau, insatge, nagut*** (RG) against
*ei, buca, jeu, enzatgei, nuot, tgaun, -au* (Sursilvan) and *es, eu, hoz, hom, uossa, alch, nüglia,
adüna, fich* (Vallader). Sursilvan and Vallader forms in this table are *(verify)*; the idioms' own
style sheets rule on them.
