# Sursilvan (`rm-sursilv`): the style sheet

These are the spelling and morphology rules that every `rm-sursilv` string in the corpus
(`packages/backend/src/concepts/rm-sursilv/`) follows, and that the engine fork (P04-E8, E9) will
follow. It is written in the same shape as the [Dieth style sheet](../P10-swiss-german/dieth-style-sheet.md).
The standard is written Sursilvan, the idiom of the Surselva: *romontsch sursilvan*, as the
*Grammatica Sursilvana* and the Vieli/Decurtins dictionaries give it. A Rumantsch Grischun or Engadine
form in this column is a leak, not a variant.

**Status:** drafted 2026-09-27 by the implementer (P04-E5) from model knowledge. No form was copied
from a source (see [Sources](#sources)). **Every cell is *(verify)*** until the Sursilvan reviewer's
pass (P04-E19). The cells below marked *(verify)* are the ones the author is least sure of.

## Spelling

| rule | examples |
|---|---|
| **Participles in *-au*** (the *-ar* verbs), *-iu* (the *-er* and *-ir* verbs). They agree after *esser*: *-au, -ada, -ai, -adas*; *-iu, -ida, -i, -idas* | *magliau, cantau; vendiu, durmiu; la gatta ei ida, els ein i* |
| **Predicative masculine singular in *-s***, on an adjective and on a participle after *esser* | *il paun ei buns; el ei vegnius; el ei staus* |
| *jeu*, never RG *jau* or Vallader *eu* | *jeu sun* |
| *ei* is the 3sg of *esser*, and also the neuter and impersonal subject | *el ei; ei plova* |
| /k/ before *e, i* is written *ch*, and /g/ is written *gh* (on *-ar* stems) | *tschercar → jeu tscherchel; pagar → nus paghein* |
| /tɕ/ is written *tg*, and /dʑ/ is written *gi* before *a, o, u* | *tgaun, notg, patertgar; leger → el legia* |
| Language names and demonyms are lowercase (P04 §0.5) | *romontsch, tudestg, talian* |
| Adverbs of manner are formed in *-mein* (RG *-main*) | *exactamein, natiralmein* |
| Accents are written only where the dictionary writes them | *spért* |

## Articles and elision (the engine's, never stored)

| | masculine | feminine |
|---|---|---|
| definite sg | *il*; ***igl*** before a vowel (*igl um, igl auto*) | *la*; *l'* before a vowel (*l'aua*) |
| definite pl | *ils* | *las* |
| indefinite sg | *in* | *ina*; *in'* before a vowel (*in'aura*) |

*a + il → al*, *da + il → dil* (Sursilvan *dil*, RG *dal*), *en + il → el* *(verify every
contraction)*. Possessives take no article: *miu bab, mia mumma, mes cudischs* *(verify)*.

## Adjectives

- **Attributive and predicative differ in the masculine singular** (P04-E9): *in paun bun*, but *il paun
  ei buns*. The column stores `predicative_masc_sg` on every adjective. The masculine plural is *buns*
  in both positions, so no `predicative_masc_pl` is stored. **Open for the reviewer:** does BECOME
  (*daventa buns*) take the *-s*, does the object predicative (*jeu anflel el buns*) take it, and does an
  impersonal subject keep the bare form (*ei ei bun*)?
- An adjective that ends in *-s* keeps it: *bass, bass, bassa, bassas*.
- The irregular pairs are *pign/pintga*, *bi/bella/bials*, *niev/nova*, *vegl/veglia*,
  *giuven/giuvna*, *agen/atgna*, and *-el* adjectives such as *flaivel/flaivla* and *pusseivel/pusseivla*.
- **Before the noun** (`position: 'pre'`): *grond* (degree), *bi*, *vegl*, *auter*, *medem*, the ordinals
  *emprem, secund, tierz*, *proxim*, *davos*, *agen* and *sulet* *(verify)*. *bun* is stored with its
  postnominal form. The prenominal *bien* of *Bien di!* is not modelled *(verify)*.

## Verbs

The column stores the present, the imperfect, the conditional and the present subjunctive (six persons
each), the participle, `aux: 'be'`, and the three imperatives (2sg, 1pl, 2pl). The past is *haver/esser* +
participle. The future is ***vegnir a*** + infinitive: *jeu vegnel a magliar* (P04 D7).

**Regular classes**, with S for the stressed stem (used in 1sg, 2sg, 3sg and 3pl) and U for the
unstressed one (used in the infinitive, 1pl and 2pl). Many verbs alternate between the two:
*clamar/clom-, purtar/port-, luvrar/lavur-, patertgar/patratg-, dumandar/dumond-, spitgar/spetg-,
udir/aud-, beiber/bub-*.

| | *-ar* (*purtar*) | *-er* (*vender*) | *-ir* (*sentir*) | inchoative (*capir*) |
|---|---|---|---|---|
| present | S-el, S-as, S-a, U-ein, U-eis, S-an | S-el, S-as, S-a, U-ein, U-eis, S-an | S-el, S-as, S-a, U-in, U-is, S-an | U-eschel, -eschas, -escha, U-in, U-is, -eschan |
| imperfect | U-avel, -avas, -ava, -avan, -avas, -avan | U-evel, -evas, -eva, -evan, -evas, -evan | as *-er* | as *-ir* |
| conditional | U-ass, -asses, -ass, -assen, -asses, -assen | U-ess, … | U-iss, … | as *-ir* |
| subjunctive | S-i, S-ies, S-i, U-ien, U-ies, S-ien | same | same | U-eschi, …, U-ien, U-ies, U-eschien |
| participle | U-au | U-iu | U-iu | U-iu |
| imperative | S-a, U-ein, U-ei | S-a, U-ein, U-ei | S-a, U-in, U-i | U-escha, U-in, U-i |

*(verify)* the whole *-er* row. The author is not sure whether the unstressed *-er* verbs (*vender,
prender*) take *-ein* or *-in* in 1pl. Also *(verify)* whether 2pl subjunctive *-ies* should be *-ieis*.

**Pronominal verbs** carry the fused *se-* in every person: *jeu sefermel, ti sefermas, el seferma*. They take
*esser* (*el ei sefermaus*).

### The irregular core

Every cell *(verify)*.

| verb | present (jeu, ti, el, nus, vus, els) | imperfect (1sg / 3sg) | conditional (1sg, 3pl) | subjunctive (1sg) | participle | aux | imperative (2sg, 1pl, 2pl) |
|---|---|---|---|---|---|---|---|
| *esser* | sun, eis, ei, essan, essas, ein | fuvel / fuva | fuss, fussen | seigi | stau | esser | sei, seigien, seies |
| *haver* | hai, has, ha, havein, haveis, han | havevel / haveva | havess, havessen | hagi | giu | haver | hagies, hagien, hagies |
| *vegnir* | vegnel, vegns, vegn, vegnin, vegnis, vegnan | vegnevel / vegneva | vegniss, vegnissen | vegni | vegniu | esser | vegn, vegnin, vegni |
| *ir* | mon, vas, va, mein, meis, van | mavel / mava | mass, massen | mondi | iu | esser | va, mein, mei |
| *far* | fetsch, fas, fa, fagein, fageis, fan | fagevel / fageva | fagess, fagessen | fetschi | fatg (fatga, fatgs, fatgas) | haver | fai, fagein, fagei |
| *dir* | ditgel, dis, di, schein, scheis, din | schevel / scheva | schess, schessen | ditgi | detg (detga, detgs, detgas) | haver | di, schein, schei |
| *saver* (know; can) | sai, sas, sa, savein, saveis, san | savevel / saveva | savess, savessen | sappi | saviu | haver | sappies, sappien, sappies |
| *puder* (may be, might) | pos, pos, po, pudein, pudeis, pon | pudevel / pudeva | pudess, pudessen | possi | pudiu | haver | possies, possien, possies |
| *vuler* | vi, vul, vul, lein, leis, vulan | vulevel / vuleva | less, lessen | vegli | vuliu | haver | veglies, veglien, veglies |
| *stuer* | stoi, stos, sto, stuein, stueis, ston | stuevel / stueva | stuess, stuessen | stoppi | stuiu | haver | stoppies, stoppien, stoppies |
| *veser* | vesel, vesas, vesa, vesein, veseis, vesan | vesevel / veseva | vesess, vesessen | vesi | viu | haver | vesa, vesein, vesei |
| *dar* | dun, das, dat, dein, deis, dattan | devel / deva | dess, dessen | detti | dau | haver | dai, dein, dei |
| *star* | stun, stas, sta, stein, steis, stattan | stevel / steva | stess, stessen | stetti | stau | esser | stai, stein, stei |
| *crer* | creiel, cres, cre, cartein, carteis, crein | cartevel / carteva | cartess, cartessen | creigi | cartiu | haver | crei, cartein, cartei |
| *tener* | tegnel, tegns, tegn, tenein, teneis, tegnan | tenevel / teneva | teness, tenessen | tegni | teniu | haver | tegn, tenein, tenei |
| *murir* | mierel, miers, miera, murin, muris, mieran | murevel / mureva | muriss, murissen | mieri | miert (morta, morts, mortas) | esser | miera, murin, muri |

The modals: MUST and SHOULD use *stuer*. CAN is *saver* (ability: *el sa nudar*). MAY is *astgar*
(permission). MIGHT is *puder* (possibility). WILL is *vuler*, with the conditional *less* (*jeu less
ir*, "I would like to go"). The least certain cells in this table are the imperfect of *vuler*, the
subjunctive of *crer*, and every modal imperative.

## Pronouns

| | subject | object / after a preposition |
|---|---|---|
| 1sg / 1pl | *jeu / nus* | *mei / nus* |
| 2sg / 2pl | *ti / vus* | *tei / vus* |
| 3sg m / f / neuter | *el / ella / ei* | *el / ella / quei* |
| 3pl m / f | *els / ellas* | *els / ellas* |
| generic | *ins* | |

Sursilvan does not drop the subject pronoun. It has no proclitic object pronouns: an object pronoun is
the stressed form placed after the verb (*jeu vesel tei*). The dative is *a* + that form (*ad el*)
*(verify)*.

## Function words the engine writes

| | Sursilvan | RG | Vallader |
|---|---|---|---|
| negation | ***buca***, a single particle after the finite verb (*el maglia buca*, *el ha buca magliau*) | *na … betg* | *nu* |
| never / no longer | *mai* (with no *buca*), *buca pli* *(verify)* | | |
| if | *sche* | *sche* | |
| and, or, but | *e (ed before a vowel), ni, mo* *(verify ni vs u)* | | |
| relative | *che*; *nua* (place) | | |
| more / most / less | *pli / il pli / meins* *(verify)* | | |
| very, too, a little | *fetg, memia, empau* | | |

## The leak guard: words that mark Sursilvan

These words appear in Sursilvan and in neither RG nor Vallader. A test that renders the `rm-sursilv`
row can assert them, and it can assert that RG's words are absent (*jau, è, betg, giat, mangià,
chaun, uffant*).

- ***jeu*** (I), ***ei*** (is), ***ein*** (are), ***buca*** (not), ***ins*** (one).
- ***gat*** (cat), ***tgaun*** (dog), ***affon*** (child), ***fegl*** (son), ***cudisch*** (book).
- ***magliar / magliau*** (eat), ***lein / leis*** (we, you want), ***mon / mein*** (I, we go), ***schein*** (we say).
- Participles in ***-au*** (RG *-à*) and the predicative ***-s*** (*buns*).
- *romontsch* (the language, RG *rumantsch*), *tudestg*, *talian*.

## Lexical choices worth a second look

- **EAT is *magliar*, not *mangiar*.** The P04 README's table writes Sursilvan *mangiau*, but the author
  believes *mangiar* is the Engadine and RG verb, and that Sursilvan says *magliar, magliau*. The
  reviewer should rule on this first. It decides the example sentence of the whole feature.
- *daners* (MONEY) is plural-only, so it is stored with `count: 'plural'`, the same way *it notizie* is.
- Several nouns differ in gender from Italian, and the column comments each one: *il maun, il tgau,
  igl isch, il plaid, la miur, la vart, la sort, il lungatg*.
- A multi-word verb stores its particle in every cell: *ir ora, ir a pei, levar si, seser giu, crudar
  ensemen, metter en urden, haver basegn, empruar puspei*.

## Sources

| work | used how | terms of use |
|---|---|---|
| *Pledari Grond*, online, Sursilvan dictionary (Lia Rumantscha, pledarigrond.ch) | **consulted** from memory. No form was copied | The Lia Rumantscha says its RG, Surmiran, Sursilvan and Sutsilvan dictionaries are *"openly licensed (© Lia Rumantscha 1980–2025)"*, as cited in the rumlem paper ([arXiv 2604.11233](https://arxiv.org/html/2604.11233)). The licence name has not been confirmed on pledarigrond.ch. Ruling until E3: **consult** |
| *Grammatica Sursilvana* (Spescha) | the conjugation classes and the predicative *-s*, from memory | print; no stated terms; **consult** |
| Vieli/Decurtins, *Vocabulari romontsch sursilvan–tudestg* | from memory | print, Lia Rumantscha; no stated terms; **consult** |
| *Dicziunari Rumantsch Grischun* | not used | |

No source was open at authoring time. Every form is model knowledge and is marked *(verify)*. This
sheet makes no claim that a source attests any form.
